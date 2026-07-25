# Live-Technik und Ziehung

## Mindestarchitektur

- getrennte Vereine und Veranstaltungen
- sichere Rollen für Plattform, Vereinsadmin, Operator und Nur-Lese-Hallenscreen
- transaktionale Losreservierung mit Ablauf
- zentraler Zahlungs-, Bestell- und Losstatus
- Mollie Connect/OAuth im Kontext des Vereins
- idempotente Webhooks mit Betrags-, Währungs- und Mandantenprüfung
- unveränderbares Auditprotokoll für Adminänderungen und Ziehungen
- Firestore Rules oder gleichwertige serverseitige Zugriffskontrolle
- getrennte Test- und Liveumgebung

## Ziehungsprotokoll

1. Verkauf serverseitig schließen.
2. Snapshot aller gültigen bezahlten Lose erzeugen.
3. Anzahl, Zeitpunkt und Hash des Kandidatensatzes veröffentlichen.
4. autorisierten Bediener protokollieren.
5. serverseitige kryptografische Zufallsquelle verwenden.
6. Ergebnis atomar mit Snapshot und Zeit speichern.
7. Animation aus dem feststehenden Ergebnis speisen.
8. Handy und Hallenscreen aus derselben Ergebnisquelle aktualisieren.
9. öffentlichen Prüfbeleg ohne Käuferdaten erzeugen.

## Screen-Flow

- Plakat: Verein, Zweck, freigegebene Gewinne, QR, Verkaufsende, Ziehungszeit, Pflichtlinks
- Mobil: Veranstaltung, Loswahl, Reservierung, Checkout, Bestätigung, Live-Status
- Halle 16:9: Verkauf offen/geschlossen, gültige Loszahl, Transparenzmoment, Countdown, Gewinnerlos
- Gewinner: standardmäßig nur neutrale Losnummer und Abholort
- Plan B: eigener Laptop/Beamer, Mobilfunk-Backup, Sprecher plus mobile Seite
- Totalausfall: kein improvisierter Ersatzalgorithmus; dokumentierten Ersatztermin aktivieren

## Testfälle

- gleichzeitiger Kauf desselben Loses
- abgebrochene, abgelaufene und doppelt angeklickte Zahlung
- wiederholter und verspäteter Webhook
- falscher Betrag, falsche Währung oder falscher Verein
- Netzverlust vor und während Ziehung
- erneuter Ziehungsstart und unzulässige Korrektur
- Abweichung zwischen Handy- und Hallenscreen
- unbefugter Admin- oder Screenzugriff
- Datenschutzprüfung aller öffentlichen Ansichten
