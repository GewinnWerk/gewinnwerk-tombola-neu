# Vereinsglück

Moderne digitale Tombola für kleine Vereine, Fördervereine und lokale Veranstaltungen.

## Lokaler Start

```bash
npm install
npm run dev
```

Danach `http://localhost:3000` öffnen.

## Projektstand

- responsive, interaktive Produktdemo mit Losauswahl
- vorhandener Firebase-Functions-Kern für Mollie-Zahlungen und Losreservierung
- Businessplan und Pilotkonzept in `BUSINESSPLAN.md`
- noch keine produktionsreife Verbindung zwischen Oberfläche, Firestore und Vereins-Mollie-Konto
- keine nachgewiesene Live-Bereitstellung aus diesem Arbeitsordner

## Vor dem Livebetrieb

Security Rules, Mandantentrennung, Vereins-Admin, eigene Zahlungskonten je Verein, Rechtstexte, Datenschutzprozesse, Monitoring und Ende-zu-Ende-Test umsetzen. Die Demo kennzeichnet den deaktivierten Zahlungsweg ausdrücklich.
