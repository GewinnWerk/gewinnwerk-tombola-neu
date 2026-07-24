# Technischer Status

Stand: 24. Juli 2026

## Lokal geprüft

- moderne responsive Start- und Tombolaseite
- interaktive Loswahl mit vergebenen und ausgewählten Nummern
- deutscher Seitentitel, Beschreibung und Sprache
- ESLint ohne Befund
- Next.js-Produktions-Build und TypeScript erfolgreich
- Firebase-Functions-Datei syntaktisch gültig
- Mollie-Kern prüft Tombola-ID, HTTPS-Rücksprungadresse, Betrag und Währung
- fehlgeschlagene Webhooks antworten mit Fehlerstatus für einen erneuten Versuch

## Noch nicht verbunden oder live geprüft

- Oberfläche nutzt derzeit Demo-Daten statt Firestore
- Zahlungsbutton startet bewusst keine echte Zahlung
- kein nachgewiesenes Git-Repository in diesem Ordner
- keine Firebase-Projektdatei `.firebaserc`, keine Firestore Rules und kein Hosting-Ziel vorhanden
- kein Zugriffstest auf ein Mollie-Konto und keine Testzahlung erfolgt
- keine visuelle Browserabnahme möglich, weil in dieser Sitzung kein Browser bereitstand

## Blocker vor Pilotbetrieb

1. Mandanten- und Rollenmodell einschließlich Vereins-Admin
2. Firestore Security Rules, App Check und Missbrauchsschutz
3. getrennte Zahlungskonten je Verein statt eines globalen Plattformschlüssels
4. Datenschutz-, Lösch-, Export- und Auftragsverarbeitungsprozess
5. vollständige Testzahlung samt Webhook, Abbruch, Ablauf und Rückerstattung
6. Rechts-/Steuercheck für Pilotbundesland und konkrete Vereinsveranstaltung
7. Monitoring, Backup, Fehleralarm und Offline-Notfallablauf
