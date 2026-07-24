"use client";
/* eslint-disable @next/next/no-img-element -- Die Live-Vorschau muss lokale Data-URL-Logos ohne Host-Konfiguration anzeigen. */

import Link from "next/link";
import { ChangeEvent, CSSProperties, useEffect, useState } from "react";
import { defaultConfig, MainDrawResult, readConfig, readMainDraw, readOrders, saveConfig, saveMainDraw, TombolaConfig, TombolaOrder } from "../../lib/tombola-config";

const steps = ["Verein", "Tombola", "Gewinne", "Sponsoren", "Vorschau", "Betrieb"];

export default function AdminPage() {
  const [config, setConfig] = useState<TombolaConfig>(defaultConfig);
  const [activeStep, setActiveStep] = useState(0);
  const [saved, setSaved] = useState(false);
  const [orders, setOrders] = useState<TombolaOrder[]>([]);
  const [mainDraw, setMainDraw] = useState<MainDrawResult | null>(null);
  const [winnerInput, setWinnerInput] = useState("");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setConfig(readConfig());
      setOrders(readOrders());
      setMainDraw(readMainDraw());
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function update<K extends keyof TombolaConfig>(key: K, value: TombolaConfig[K]) {
    setSaved(false);
    setConfig((current) => ({ ...current, [key]: value }));
  }

  function updatePrize(index: number, key: "title" | "value", value: string) {
    const prizes = config.prizes.map((prize, prizeIndex) => prizeIndex === index ? { ...prize, [key]: value } : prize);
    update("prizes", prizes);
  }

  function updateSponsor(index: number, key: "name" | "logoUrl", value: string) {
    update("sponsors", config.sponsors.map((sponsor, sponsorIndex) => sponsorIndex === index ? { ...sponsor, [key]: value } : sponsor));
  }

  function updateRange(index: number, key: "from" | "to" | "prize", value: string) {
    update("instantPrizeRanges", config.instantPrizeRanges.map((range, rangeIndex) => rangeIndex === index ? { ...range, [key]: key === "prize" ? value : Number(value) } : range));
  }

  function storeMainWinner() {
    const ticket = Number(winnerInput);
    if (!Number.isInteger(ticket) || ticket < 1 || ticket > config.totalTickets) {
      window.alert(`Bitte eine Losnummer zwischen 1 und ${config.totalTickets} eingeben.`);
      return;
    }
    const order = orders.find((item) => item.tickets.includes(ticket));
    const result: MainDrawResult = {
      ticket,
      prize: config.mainPrizeTitle,
      drawnAt: new Date().toISOString(),
      name: order?.name || "Noch keinem bezahlten Los zugeordnet",
      email: order?.email || "",
    };
    saveMainDraw(result);
    setMainDraw(result);
  }

  function handleLogo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 900_000) {
      window.alert("Bitte verwende ein Logo unter 900 KB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => update("logoDataUrl", String(reader.result || ""));
    reader.readAsDataURL(file);
  }

  function persist() {
    saveConfig(config);
    setSaved(true);
  }

  function reset() {
    if (!window.confirm("Möchtest du wirklich alle Angaben auf die Demo-Werte zurücksetzen?")) return;
    setConfig(defaultConfig);
    saveConfig(defaultConfig);
    setSaved(true);
  }

  return (
    <main className="admin-page" style={{ "--admin-primary": config.primaryColor, "--admin-accent": config.accentColor } as CSSProperties}>
      <aside className="admin-sidebar">
        <Link className="admin-brand" href="/"><span>VG</span><div><strong>Vereinsglück</strong><small>Veranstaltungs-Cockpit</small></div></Link>
        <div className="event-chip"><i className="status-dot" /><div><small>Aktuelle Tombola</small><strong>{config.eventName}</strong></div></div>
        <nav aria-label="Einrichtungsschritte">
          {steps.map((step, index) => (
            <button className={activeStep === index ? "active" : ""} onClick={() => setActiveStep(index)} key={step}>
              <b>{index + 1}</b><span>{step}<small>{index === 0 ? "Name, Logo & Farben" : index === 1 ? "Lose, Preis & Termin" : index === 2 ? "Preise & Nummernbereiche" : index === 3 ? "Partner & Logos" : index === 4 ? "Alles kontrollieren" : "Verkäufe & Gewinner"}</small></span>
            </button>
          ))}
        </nav>
        <div className="admin-help"><strong>Du brauchst Hilfe?</strong><p>Alle Einstellungen können später wieder geändert werden.</p><a href="mailto:support@vereinsglueck.de">Support kontaktieren</a></div>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <div><span className="admin-kicker">Einrichtung · Schritt {activeStep + 1} von 6</span><h1>{steps[activeStep]}</h1></div>
          <div className="admin-top-actions"><Link href="/" target="_blank">Kundenseite öffnen ↗</Link><button className="save-button" onClick={persist}>{saved ? "✓ Gespeichert" : "Änderungen speichern"}</button></div>
        </header>

        <div className="admin-content">
          <div className="admin-form-card">
            {activeStep === 0 && <>
              <div className="form-heading"><span>01</span><div><h2>So tritt dein Verein auf</h2><p>Logo, Farben und Texte erscheinen direkt auf der Tombolaseite.</p></div></div>
              <label>Vereinsname<input value={config.associationName} onChange={(e) => update("associationName", e.target.value)} /></label>
              <label>Wofür wird gesammelt?<input value={config.purpose} onChange={(e) => update("purpose", e.target.value)} placeholder="z. B. unsere Jugendfeuerwehr" /></label>
              <div className="logo-upload">
                <div className="logo-preview">{config.logoDataUrl ? <img src={config.logoDataUrl} alt="Vereinslogo Vorschau" /> : <span>Logo</span>}</div>
                <div><strong>Vereinslogo</strong><p>PNG oder JPG, maximal 900 KB</p><label className="upload-button">Logo auswählen<input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleLogo} /></label>{config.logoDataUrl && <button className="text-button" onClick={() => update("logoDataUrl", "")}>Entfernen</button>}</div>
              </div>
              <div className="color-grid">
                <label>Hauptfarbe<div className="color-input"><input type="color" value={config.primaryColor} onChange={(e) => update("primaryColor", e.target.value)} /><span>{config.primaryColor}</span></div></label>
                <label>Akzentfarbe<div className="color-input"><input type="color" value={config.accentColor} onChange={(e) => update("accentColor", e.target.value)} /><span>{config.accentColor}</span></div></label>
              </div>
            </>}

            {activeStep === 1 && <>
              <div className="form-heading"><span>02</span><div><h2>Deine Veranstaltung</h2><p>Die wichtigsten Angaben für Verkauf und Ziehung.</p></div></div>
              <label>Veranstaltungsname<input value={config.eventName} onChange={(e) => update("eventName", e.target.value)} /></label>
              <div className="two-fields"><label>Tag / Datum<input value={config.eventDate} onChange={(e) => update("eventDate", e.target.value)} /></label><label>Ziehungszeit<input value={config.drawTime} onChange={(e) => update("drawTime", e.target.value)} /></label></div>
              <div className="two-fields"><label>Anzahl Lose<input type="number" min="20" max="5000" step="10" value={config.totalTickets} onChange={(e) => update("totalTickets", Math.max(20, Number(e.target.value)))} /><small>20 bis 5.000 Lose</small></label><label>Preis pro Los<input type="number" min="0.5" max="100" step="0.5" value={config.ticketPrice} onChange={(e) => update("ticketPrice", Math.max(.5, Number(e.target.value)))} /><small>Betrag in Euro</small></label></div>
            </>}

            {activeStep === 2 && <>
              <div className="form-heading"><span>03</span><div><h2>Deine Gewinne</h2><p>Mindestens sechs Felder stehen bereit. Kurze Namen wirken auf dem Handy am besten.</p></div></div>
              {config.prizes.map((prize, index) => <div className="prize-admin-row" key={index}><b>{index + 1}</b><label>Gewinn<input value={prize.title} onChange={(e) => updatePrize(index, "title", e.target.value)} /></label><label>Wert / Zusatz<input value={prize.value} onChange={(e) => updatePrize(index, "value", e.target.value)} /></label></div>)}
              <button className="add-sponsor-button" disabled={config.prizes.length >= 12} onClick={() => update("prizes", [...config.prizes, { title: "", value: "" }])}>+ Weiteren Gewinn hinzufügen</button>
              <p className="field-hint">{config.prizes.length} von maximal 12 Gewinnfeldern</p>
              <h3 className="admin-subheading">Sofortgewinne nach Losnummer</h3>
              <p className="field-hint">Beispiel: Lose 10 bis 20 erhalten sofort denselben Preis. Der Hauptpreis bleibt davon getrennt.</p>
              {config.instantPrizeRanges.map((range, index) => <div className="range-row" key={index}><label>Von<input type="number" min="1" max={config.totalTickets} value={range.from} onChange={(event) => updateRange(index, "from", event.target.value)} /></label><label>Bis<input type="number" min="1" max={config.totalTickets} value={range.to} onChange={(event) => updateRange(index, "to", event.target.value)} /></label><label>Preis<input value={range.prize} onChange={(event) => updateRange(index, "prize", event.target.value)} /></label><button onClick={() => update("instantPrizeRanges", config.instantPrizeRanges.filter((_, rangeIndex) => rangeIndex !== index))}>×</button></div>)}
              <button className="add-sponsor-button" disabled={config.instantPrizeRanges.length >= 20} onClick={() => update("instantPrizeRanges", [...config.instantPrizeRanges, { from: 1, to: 1, prize: "" }])}>+ Nummernbereich hinzufügen</button>
              <label className="main-prize-input">Hauptpreis für die spätere Ziehung<input value={config.mainPrizeTitle} onChange={(event) => update("mainPrizeTitle", event.target.value)} /></label>
            </>}

            {activeStep === 3 && <>
              <div className="form-heading"><span>04</span><div><h2>Sponsoren sichtbar würdigen</h2><p>Name und optional eine öffentlich erreichbare Logo-URL eintragen.</p></div></div>
              <div className="sponsor-admin-list">
                {config.sponsors.map((sponsor, index) => <div className="sponsor-admin-row" key={index}><div className="sponsor-mini-logo">{sponsor.logoUrl ? <img src={sponsor.logoUrl} alt="" /> : sponsor.name.slice(0, 2).toUpperCase()}</div><label>Name<input value={sponsor.name} onChange={(e) => updateSponsor(index, "name", e.target.value)} placeholder="Sponsorname" /></label><label>Logo-URL (optional)<input value={sponsor.logoUrl} onChange={(e) => updateSponsor(index, "logoUrl", e.target.value)} placeholder="https://…" /></label><button aria-label={`${sponsor.name} entfernen`} onClick={() => update("sponsors", config.sponsors.filter((_, sponsorIndex) => sponsorIndex !== index))}>×</button></div>)}
              </div>
              <button className="add-sponsor-button" disabled={config.sponsors.length >= 20} onClick={() => update("sponsors", [...config.sponsors, { name: "", logoUrl: "" }])}>+ Sponsor hinzufügen</button>
              <p className="field-hint">Bis zu 20 Sponsoren. Logos nur mit Erlaubnis des jeweiligen Unternehmens verwenden.</p>
            </>}

            {activeStep === 4 && <>
              <div className="form-heading"><span>05</span><div><h2>Bereit für den Testlauf</h2><p>Kontrolliere die Zusammenfassung und speichere anschließend.</p></div></div>
              <div className="review-list">
                <div><span>Verein</span><strong>{config.associationName}</strong></div>
                <div><span>Veranstaltung</span><strong>{config.eventName} · {config.eventDate}</strong></div>
                <div><span>Tombola</span><strong>{config.totalTickets.toLocaleString("de-DE")} Lose à {config.ticketPrice.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}</strong></div>
                <div><span>Möglicher Losumsatz</span><strong>{(config.totalTickets * config.ticketPrice).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}</strong></div>
                <div><span>Ziehung</span><strong>{config.drawTime}</strong></div>
                <div><span>Sponsoren</span><strong>{config.sponsors.length || "Keine eingetragen"}</strong></div>
              </div>
              <div className="review-notice">Die Konfiguration ist lokal gespeichert. Eine Veröffentlichung oder echte Zahlung wird dadurch noch nicht ausgelöst.</div>
            </>}

            {activeStep === 5 && <>
              <div className="form-heading"><span>06</span><div><h2>Verkäufe und Gewinner</h2><p>Gespeicherte Demo-/Live-Zahlungen und Hauptgewinner abrufen.</p></div></div>
              <div className="operation-stats"><div><strong>{orders.length}</strong><span>Zahlungen</span></div><div><strong>{orders.reduce((sum, order) => sum + order.tickets.length, 0)}</strong><span>bezahlte Lose</span></div><div><strong>{orders.reduce((sum, order) => sum + order.instantWins.length, 0)}</strong><span>Sofortgewinne</span></div></div>
              <div className="main-draw-admin">
                <span>Hauptpreisziehung · {config.eventDate}, {config.drawTime}</span>
                <h3>{config.mainPrizeTitle}</h3>
                <div><input type="number" min="1" max={config.totalTickets} value={winnerInput} onChange={(event) => setWinnerInput(event.target.value)} placeholder="Gewinnerlos, z. B. 23" /><button onClick={storeMainWinner}>Gewinner speichern</button></div>
                {mainDraw && <div className="stored-winner"><small>Gespeicherter Hauptgewinner</small><strong>Los {String(mainDraw.ticket).padStart(3, "0")} · {mainDraw.name}</strong><span>{mainDraw.email || "Keine E-Mail zugeordnet"} · {new Date(mainDraw.drawnAt).toLocaleString("de-DE")}</span></div>}
              </div>
              <div className="order-list"><h3>Gespeicherte Vorgänge</h3>{orders.length ? orders.map((order) => <article key={order.id}><div><strong>{order.name}</strong><span>{order.email}</span></div><div><strong>{order.tickets.map((ticket) => String(ticket).padStart(3, "0")).join(", ")}</strong><span>{order.instantWins.length ? order.instantWins.map((win) => `${win.ticket}: ${win.prize}`).join(" · ") : "Kein Sofortgewinn"}</span></div><small>{order.status === "demo_paid" ? "Demo" : "Bezahlt"} · {new Date(order.paidAt).toLocaleString("de-DE")}</small></article>) : <p className="empty-orders">Noch keine Zahlungen gespeichert.</p>}</div>
            </>}

            <div className="form-footer"><button className="reset-button" onClick={reset}>Demo-Werte wiederherstellen</button><div><button disabled={activeStep === 0} onClick={() => setActiveStep((step) => step - 1)}>Zurück</button>{activeStep < 5 ? <button className="next-button" onClick={() => setActiveStep((step) => step + 1)}>Weiter</button> : <button className="next-button" onClick={persist}>Speichern</button>}</div></div>
          </div>

          <aside className="live-preview">
            <div className="preview-label"><span>Live-Vorschau</span><i>Änderungen erscheinen sofort</i></div>
            <div className="preview-phone">
              <div className="preview-nav">{config.logoDataUrl ? <img src={config.logoDataUrl} alt="" /> : <b>VG</b>}<strong>{config.associationName}</strong></div>
              <div className="preview-hero"><small>{config.eventName}</small><h3>Ein Los.<br /><em>Viel Vereinsglück.</em></h3><p>Unterstütze {config.purpose}.</p><button>Lose sichern</button></div>
              <div className="preview-stats"><span><strong>{config.ticketPrice.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €</strong>pro Los</span><span><strong>{config.totalTickets}</strong>Lose</span></div>
            </div>
            <p>So sehen Gäste den oberen Bereich auf dem Smartphone.</p>
          </aside>
        </div>
      </section>
    </main>
  );
}
