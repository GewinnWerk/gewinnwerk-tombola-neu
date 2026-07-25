# Technische Live-Reife: Eishockey-Tombola

Stand: 25. Juli 2026

## Ergebnis

Der aktuelle Stand ist eine optisch starke, lokal funktionsfähige Produktdemo. Er ist **nicht live einsetzbar** und darf noch keine echten Lose verkaufen. Für einen beaufsichtigten Pilot fehlen zentrale Zahlungs-, Daten-, Ziehungs-, Rollen- und Compliance-Funktionen.

## Kritische Befunde

| Bereich | Ist-Zustand | Risiko | Erforderlicher Sollzustand |
|---|---|---|---|
| Losbestand | verkaufte Lose sind in `app/page.tsx` hart codiert | Doppelverkauf und falsche Verfügbarkeit | serverseitige transaktionale Reservierung |
| Bestellungen | Name, E-Mail und Gewinne nur im Browser-`localStorage` | Datenverlust, Gerätebindung, Manipulation | Firestore oder gleichwertige zentrale Datenbank |
| Zahlung | Oberfläche bestätigt eine Demozahlung | keine echte Zahlungswahrheit | Mollie Connect/OAuth je Verein, verifizierter Webhook |
| Backendzahlung | `functions/index.js` nutzt einen globalen `MOLLIE_API_KEY` | Geld könnte im falschen Konto landen | pro Verein verbundener OAuth-Kontext; harte Kontozuordnung |
| Backendmodell | enthält alte Felder wie Telefon, Hund und Halsband | fachlich veraltet, unnötige Daten | minimales Eishockey-Datenmodell |
| Ziehung | `Math.random()` und lokale Auswahl; Demo kann aus aktuell markierten Losen ziehen | nicht fair, nicht auditierbar | serverseitige, autorisierte Ziehung aus Snapshot bezahlter Lose |
| Gewinnerprotokoll | Hauptgewinner nur lokal gespeichert und überschreibbar | kein belastbarer Nachweis | unveränderbares Auditprotokoll mit Korrekturereignissen |
| Synchronisation | Handy und Hallenscreen teilen keinen Livezustand | widersprüchliche Anzeige | eine serverseitige Draw-Session mit Echtzeitkanal |
| Adminzugang | keine Authentifizierung/Rollen | unbefugte Änderungen und Ziehungen | Plattform-, Vereinsadmin- und Operatorrollen |
| Firebase | keine `.firebaserc`, Firestore Rules oder Indizes | nicht deploybar/sicher | eigenes Projekt, Regeln, Indizes, App Check, getrennte Umgebungen |
| Rechtstexte | Footerlinks sind Platzhalter | Kauf ohne Pflichtinformationen | echte Vereinsseiten für Teilnahme, Datenschutz, Impressum |
| QR-Kauf | kein QR-Generator/keine Kampagnen-URL | Eingangsfluss fehlt | veranstaltungsgebundener QR-Code mit sicherer Ziel-URL |
| Hallenmodus | Ziehungsbühne ist nur Teil der Startseite | unlesbar/ungeeignet für Regie | eigene Route `/live/[eventId]` im 16:9-Kioskmodus |
| Statistiken | Sammelbetrag und Loszahlen sind Demo-Festwerte | irreführend | echte, serverseitig aggregierte Werte oder klarer Demo-Hinweis |

## Zielarchitektur

### Daten

- `clubs`: Verein, Mollie-Verbindung, Verantwortliche
- `events`: Heimspiel, Verkaufsfenster, Status, Regeln und Hallenlayout
- `prizes`: Wert, Sponsor, Anzahl, Erlebnisbedingungen und Freigaben
- `tickets`: Nummer, Reservierungsstatus, Auftragsreferenz und Ziehungsberechtigung
- `paymentIntents`: Betrag, Währung, Verein, Ablauf und Mollie-ID
- `orders`: Käuferkontakt, bezahlte Lose, Zahlungsstatus und Aufbewahrungsstatus
- `drawSessions`: Kandidaten-Snapshot, Commit-Zeit, Zufallsnachweis und Ergebnis
- `auditEvents`: unveränderbare Bedien- und Korrekturhistorie

### Rollen

- Plattformadmin: technische Einrichtung, aber keine verdeckte Gewinneränderung
- Vereinsadmin: Gewinne, Verkauf, Freigaben, Exporte
- Spieltagsoperator: Verkaufsstart/-stopp und freigegebene Ziehung
- Hallenscreen: ausschließlich lesender, kurzlebiger Präsentationszugang
- Käufer: Zugriff nur auf eigenen Vorgang über sichere Referenz

## Transparente Ziehung

1. Verkauf serverseitig schließen.
2. Snapshot aller bezahlten, teilnahmeberechtigten Losnummern bilden.
3. Hash des Kandidatensatzes und Zeitpunkt vor Start auf Handy und Hallenscreen zeigen.
4. Autorisierten Start durch Spieltagsoperator protokollieren.
5. kryptografisch geeignete serverseitige Zufallsquelle verwenden.
6. Ergebnis und Ziehungsbeleg atomar speichern.
7. Animation erst nach feststehendem Ergebnis abspielen.
8. Hallenscreen und Smartphones lesen dasselbe signierte Ergebnis.
9. Nach dem Spiel einen öffentlichen Prüfbeleg ohne Käuferdaten bereitstellen.

Die Animation bestimmt niemals den Gewinner.

## Eingang-zu-Gewinner-Flow

### Halleneingang

- A2/A1-Plakat mit Vereinslogo, Verwendungszweck, Gewinnbeispielen und großem QR-Code
- klarer Hinweis auf Verkaufsende und Ziehungszeit
- verantwortlicher Verein sowie Kurzlinks zu Teilnahmebedingungen und Datenschutz
- keine Preisangabe im universellen Template; Preis je Pilot konfigurierbar

### Mobil

1. QR öffnet direkt die Veranstaltung, nicht eine allgemeine Startseite.
2. Besucher sieht Zweck, Gewinne, Preis, Verkaufsende und freie Lose.
3. Auswahl und Reservierung erfolgen serverseitig.
4. Vor Zahlung erscheinen Veranstalter, Altersregel, Teilnahmebedingungen und Datenschutz.
5. Mollie-Checkout gehört nachweislich zum Verein.
6. Nach Rückkehr wird Zahlung serverseitig geprüft.
7. Bestätigungsseite zeigt Lose, Vorgang, Ziehungszeit und Live-Link.
8. Vor Ziehung zeigt die Seite Status „Verkauf offen/geschlossen – Ziehung folgt“.
9. Während der Show wechselt sie synchron zu Countdown, Ziehung und Gewinnerlos.

### Großbild

- eigene 16:9-Ansicht ohne Navigation, Adminlinks oder Käuferdaten
- fernlesbare Typografie und hoher Kontrast
- Phasen: Ankündigung → Verkaufsende → Prüfstatus → Countdown → Ziehung → Gewinner
- neutrales Gewinnerlos, zum Beispiel `LOS 0427`
- optionaler Name oder Foto ausschließlich nach gesonderter Freigabe

## Datenschutz

- Für Kauf und Gewinnkontakt genügen in der Regel Name und E-Mail; Notwendigkeit je Veranstaltung prüfen.
- Auf Hallenscreens niemals E-Mail, Telefonnummer, Zahlungs-ID oder vollständigen Namen anzeigen.
- Gewinner standardmäßig nur als Losnummer darstellen.
- Öffentliche Namens-/Fotoanzeige getrennt und freiwillig einwilligen lassen; Nicht-Einwilligung darf die Gewinnchance nicht beeinflussen.
- Live-Screen darf keine frei abrufbare Adminschnittstelle enthalten.
- Externe Sponsorenbilder serverseitig kontrollieren oder selbst hosten; keine beliebigen Tracking-URLs laden.

## Produktreife-Gates

### Gate 1 – Behördenfähiger Prototyp

- kein Liveverkauf
- vollständiger Spielplan/Teilnahmebedingungen-Entwurf
- QR-, Mobil- und Hallenflow klickbar
- nachvollziehbares Ziehungskonzept
- schriftliche Behördenanfrage möglich

### Gate 2 – Technischer Testbetrieb

- Firebase Testprojekt mit Regeln und Rollen
- Mollie-Testkonto pro Testverein
- vollständige Testkäufe, Abbrüche und Webhooks
- synchroner Hallen-/Handymodus
- automatisierte Doppelverkaufs- und Ziehungstests

### Gate 3 – Beaufsichtigter Pilot

- schriftliche Erlaubnis-/Anzeigeprüfung für genau diesen Verein und Verkaufsweg
- Datenschutz-, Steuer- und Vertragsfreigaben
- Generalprobe in der Halle
- Support und Plan B vor Ort
- echte Zahlung nur nach ausdrücklicher Freigabe

### Gate 4 – Saisonprodukt

- wiederholbares Vereins-Onboarding über Mollie Connect
- Monitoring, Backups, Alarmierung und Rückerstattungsprozess
- standardisierter Abschlussbericht
- dokumentierter Sicherheits- und Datenschutztest
- mindestens drei erfolgreich abgeschlossene Piloten
