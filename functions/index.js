'use strict';

const admin = require('firebase-admin');
const { onCall, HttpsError, onRequest } = require('firebase-functions/v2/https');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { defineSecret } = require('firebase-functions/params');

admin.initializeApp();
const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;
const Timestamp = admin.firestore.Timestamp;

const MOLLIE_API_KEY = defineSecret('MOLLIE_API_KEY');
const REGION = 'europe-west3';

function cleanText(value, max = 500) {
  return String(value || '').trim().slice(0, max);
}

function normalizeTombolaId(value) {
  const id = cleanText(value, 120);
  if (!/^[a-zA-Z0-9_-]{3,120}$/.test(id)) {
    throw new HttpsError('invalid-argument', 'Ungültige tombolaId.');
  }
  return id;
}

function normalizeNumbers(numbers) {
  if (!Array.isArray(numbers)) throw new HttpsError('invalid-argument', 'Losnummern fehlen.');
  const normalized = [...new Set(numbers.map(n => Number(n)).filter(Number.isInteger))].sort((a, b) => a - b);
  if (!normalized.length) throw new HttpsError('invalid-argument', 'Bitte mindestens ein Los auswählen.');
  if (normalized.length > 50) throw new HttpsError('invalid-argument', 'Maximal 50 Lose pro Kauf erlaubt.');
  return normalized;
}

function ticketPrice(number, settings) {
  return Number(number) <= Number(settings.premiumCount || 0)
    ? Number(settings.premiumPrice || 0)
    : Number(settings.standardPrice || 0);
}

function ticketClass(number, settings) {
  return Number(number) <= Number(settings.premiumCount || 0) ? 'premium' : 'standard';
}

function moneyValue(value) {
  return Number(value || 0).toFixed(2);
}

async function loadSettings(tombolaId) {
  const snap = await db.doc(`tombolas/${tombolaId}/settings/global`).get();
  return snap.exists ? snap.data() : {};
}

function mollieMethods(settings) {
  const raw = cleanText(settings.mollieMethods || '', 300);
  if (!raw) return undefined;
  const arr = raw.split(',').map(x => x.trim()).filter(Boolean);
  return arr.length ? arr : undefined;
}

async function mollieRequest(path, options = {}) {
  const res = await fetch(`https://api.mollie.com/v2${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${MOLLIE_API_KEY.value()}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new HttpsError('internal', 'Mollie Anfrage fehlgeschlagen.', json);
  return json;
}

function publicBaseUrl(settings) {
  const url = cleanText(settings.websiteUrl || '', 500);
  if (!url) throw new HttpsError('failed-precondition', 'Die öffentliche Website-URL fehlt.');
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw new HttpsError('failed-precondition', 'Die öffentliche Website-URL ist ungültig.');
  }
  if (parsed.protocol !== 'https:' && parsed.hostname !== 'localhost') {
    throw new HttpsError('failed-precondition', 'Die öffentliche Website-URL muss HTTPS verwenden.');
  }
  return parsed.toString();
}

function webhookUrl() {
  const project = process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT;
  return `https://${REGION}-${project}.cloudfunctions.net/mollieWebhook`;
}

async function cleanupIntent(tombolaId, intentId, numbers) {
  const batch = db.batch();
  batch.update(db.doc(`tombolas/${tombolaId}/paymentIntents/${intentId}`), {
    status: 'failed',
    updatedAt: FieldValue.serverTimestamp()
  });
  batch.delete(db.doc(`tombolas/${tombolaId}/orders/${intentId}`));
  for (const n of numbers || []) {
    const ref = db.doc(`tombolas/${tombolaId}/tickets/${n}`);
    const snap = await ref.get();
    if (snap.exists && snap.data().orderId === intentId && snap.data().status === 'processing') {
      batch.delete(ref);
    }
  }
  await batch.commit().catch(() => null);
}

exports.createMolliePayment = onCall({
  region: REGION,
  secrets: [MOLLIE_API_KEY]
}, async (request) => {
  const tombolaId = normalizeTombolaId(request.data?.tombolaId);

  const numbers = normalizeNumbers(request.data?.numbers);
  const customer = request.data?.customer || {};
  const name = cleanText(customer.name, 120);
  const phone = cleanText(customer.phone, 80);
  if (name.length < 2 || phone.length < 6) {
    throw new HttpsError('invalid-argument', 'Name und Telefonnummer sind Pflichtfelder.');
  }

  const settings = await loadSettings(tombolaId);
  const totalTickets = Number(settings.totalTickets || 0);
  if (!totalTickets) throw new HttpsError('failed-precondition', 'Tombola-Einstellungen fehlen. Bitte zuerst im Editor speichern.');
  if (numbers.some(n => n < 1 || n > totalTickets)) throw new HttpsError('invalid-argument', 'Ungültige Losnummer.');

  const amount = numbers.reduce((sum, n) => sum + ticketPrice(n, settings), 0);
  if (amount <= 0) throw new HttpsError('failed-precondition', 'Der Zahlungsbetrag muss größer als 0 sein.');

  const intentRef = db.collection(`tombolas/${tombolaId}/paymentIntents`).doc();
  const expiresAt = Timestamp.fromMillis(Date.now() + 60 * 60 * 1000);
  const currency = cleanText(settings.mollieCurrency || 'EUR', 3).toUpperCase() || 'EUR';
  const firstName = String(name || '').split(' ')[0] || 'Teilnehmer/in';
  const publicName = customer.publicConsent ? firstName : 'Teilnehmer/in';
  const publicDog = customer.publicConsent ? cleanText(customer.dog, 120) : '';

  await db.runTransaction(async trx => {
    const ticketRefs = numbers.map(n => db.doc(`tombolas/${tombolaId}/tickets/${n}`));
    const snaps = [];
    for (const ref of ticketRefs) snaps.push(await trx.get(ref));
    const taken = snaps.filter(s => s.exists && s.data().status !== 'free').map(s => s.id);
    if (taken.length) throw new HttpsError('failed-precondition', `Diese Lose sind leider nicht mehr frei: ${taken.join(', ')}`);

    trx.set(intentRef, {
      tombolaId,
      status: 'creating',
      customer: {
        name,
        phone,
        email: cleanText(customer.email, 120),
        dog: cleanText(customer.dog, 120),
        collar: cleanText(customer.collar, 80),
        note: cleanText(customer.note, 500),
        publicConsent: !!customer.publicConsent
      },
      tickets: numbers,
      amount,
      currency,
      expiresAt,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });

    for (const n of numbers) {
      trx.set(db.doc(`tombolas/${tombolaId}/tickets/${n}`), {
        number: n,
        orderId: intentRef.id,
        status: 'processing',
        class: ticketClass(n, settings),
        price: ticketPrice(n, settings),
        publicName,
        publicDog,
        checkoutExpiresAt: expiresAt,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });
    }
  });

  let payment;
  try {
    const base = publicBaseUrl(settings).replace(/#.*$/, '').replace(/\?.*$/, '');
    const method = mollieMethods(settings);
    payment = await mollieRequest('/payments', {
      method: 'POST',
      body: JSON.stringify({
        amount: { currency, value: moneyValue(amount) },
        description: `Tombola ${settings.associationName || tombolaId} - Lose ${numbers.join(', ')}`.slice(0, 255),
        redirectUrl: `${base}?payment=${encodeURIComponent(intentRef.id)}#kaufen`,
        webhookUrl: webhookUrl(),
        method,
        metadata: { tombolaId, paymentIntentId: intentRef.id }
      })
    });
  } catch (err) {
    await cleanupIntent(tombolaId, intentRef.id, numbers);
    throw err;
  }

  await intentRef.update({
    status: 'open',
    molliePaymentId: payment.id,
    checkoutUrl: payment._links?.checkout?.href || '',
    updatedAt: FieldValue.serverTimestamp()
  });

  return {
    paymentIntentId: intentRef.id,
    molliePaymentId: payment.id,
    checkoutUrl: payment._links?.checkout?.href,
    amount,
    currency
  };
});

exports.verifyMolliePayment = onCall({
  region: REGION,
  secrets: [MOLLIE_API_KEY]
}, async (request) => {
  const tombolaId = normalizeTombolaId(request.data?.tombolaId);
  const paymentIntentId = cleanText(request.data?.paymentIntentId, 120);
  if (!paymentIntentId) throw new HttpsError('invalid-argument', 'Zahlungsdaten fehlen.');

  const intentSnap = await db.doc(`tombolas/${tombolaId}/paymentIntents/${paymentIntentId}`).get();
  if (!intentSnap.exists) throw new HttpsError('not-found', 'Zahlung nicht gefunden.');
  const intent = intentSnap.data();
  if (!intent.molliePaymentId) return { status: intent.status || 'open' };
  return await finalizeMolliePayment(intent.molliePaymentId, tombolaId, paymentIntentId);
});

exports.mollieWebhook = onRequest({
  region: REGION,
  secrets: [MOLLIE_API_KEY]
}, async (req, res) => {
  try {
    const id = req.body?.id || req.query?.id;
    if (!id) { res.status(400).send('missing id'); return; }
    await finalizeMolliePayment(String(id));
    res.status(200).send('ok');
  } catch (err) {
    console.error(err);
    res.status(500).send('retry');
  }
});

async function finalizeMolliePayment(molliePaymentId, expectedTombolaId, expectedIntentId) {
  const payment = await mollieRequest(`/payments/${encodeURIComponent(molliePaymentId)}`, { method: 'GET' });
  const tombolaId = expectedTombolaId || payment.metadata?.tombolaId;
  const paymentIntentId = expectedIntentId || payment.metadata?.paymentIntentId;
  if (!tombolaId || !paymentIntentId) return { status: payment.status || 'unknown' };

  const intentRef = db.doc(`tombolas/${tombolaId}/paymentIntents/${paymentIntentId}`);
  const intentSnap = await intentRef.get();
  if (!intentSnap.exists) return { status: payment.status || 'unknown' };
  const intent = intentSnap.data();
  const numbers = normalizeNumbers(intent.tickets || []);
  const paidValue = Number(payment.amount?.value);
  const expectedValue = Number(intent.amount || 0);
  const paidCurrency = cleanText(payment.amount?.currency || '', 3).toUpperCase();
  const expectedCurrency = cleanText(intent.currency || 'EUR', 3).toUpperCase();

  if (!Number.isFinite(paidValue) || paidValue !== expectedValue || paidCurrency !== expectedCurrency) {
    await intentRef.set({
      status: 'payment_mismatch',
      updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });
    throw new HttpsError('failed-precondition', 'Zahlungsbetrag oder Währung stimmen nicht überein.');
  }

  if (payment.status === 'paid' || payment.isPaid === true) {
    const orderRef = db.doc(`tombolas/${tombolaId}/orders/${paymentIntentId}`);
    const customer = intent.customer || {};

    await db.runTransaction(async trx => {
      const ticketSnaps = [];
      for (const n of numbers) ticketSnaps.push(await trx.get(db.doc(`tombolas/${tombolaId}/tickets/${n}`)));
      const invalid = ticketSnaps.filter(s => !s.exists || s.data().orderId !== paymentIntentId).map(s => s.id);
      if (invalid.length) throw new HttpsError('failed-precondition', `Lose konnten nicht bestätigt werden: ${invalid.join(', ')}`);

      trx.set(orderRef, {
        name: customer.name || '',
        phone: customer.phone || '',
        email: customer.email || '',
        dog: customer.dog || '',
        collar: customer.collar || '',
        note: customer.note || '',
        publicConsent: !!customer.publicConsent,
        tickets: numbers,
        amount: Number(intent.amount || 0),
        currency: intent.currency || 'EUR',
        status: 'paid',
        molliePaymentId,
        mollieMethod: payment.method || '',
        source: 'mollie-checkout',
        createdAt: intent.createdAt || FieldValue.serverTimestamp(),
        paidAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      }, { merge: true });

      for (const n of numbers) {
        trx.update(db.doc(`tombolas/${tombolaId}/tickets/${n}`), {
          status: 'paid',
          paidAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp()
        });
      }
      trx.update(intentRef, {
        status: 'paid',
        molliePayment: payment,
        paidAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });
    });

    const orderSnap = await orderRef.get();
    return { status: 'paid', order: { id: paymentIntentId, ...orderSnap.data() } };
  }

  if (['failed', 'expired', 'canceled'].includes(payment.status)) {
    await cleanupIntent(tombolaId, paymentIntentId, numbers);
    await intentRef.set({ status: payment.status, molliePayment: payment, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    return { status: payment.status };
  }

  await intentRef.set({ status: payment.status || 'open', molliePayment: payment, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  return { status: payment.status || 'open' };
}

exports.cleanupExpiredCheckouts = onSchedule({
  region: REGION,
  schedule: 'every 10 minutes',
  timeZone: 'Europe/Berlin'
}, async () => {
  const now = Timestamp.now();
  const snap = await db.collectionGroup('tickets')
    .where('status', '==', 'processing')
    .where('checkoutExpiresAt', '<=', now)
    .limit(200)
    .get();

  const batch = db.batch();
  snap.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
});
