# Technischer Status

Stand: 25. Juli 2026

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
- keine Firebase-Projektdatei `.firebaserc`, keine Firestore Rules und kein Hosting-Ziel vorhanden
- Mollie-Konto und Entwicklerbereich wurden eingesehen; es wurde bewusst kein Token kopiert, erstellt oder verändert
- keine Mollie-Testzahlung erfolgt

## Blocker vor Pilotbetrieb

1. Mandanten- und Rollenmodell einschließlich Vereins-Admin
2. Firestore Security Rules, App Check und Missbrauchsschutz
3. Mollie-Connect-/OAuth-Anbindung pro Verein; der vorhandene globale `MOLLIE_API_KEY`-Prototyp darf nicht live verwendet werden
4. Datenschutz-, Lösch-, Export- und Auftragsverarbeitungsprozess
5. vollständige Testzahlung samt Webhook, Abbruch, Ablauf und Rückerstattung
6. Rechts-/Steuercheck für Pilotbundesland und konkrete Vereinsveranstaltung
7. Monitoring, Backup, Fehleralarm und Offline-Notfallablauf
