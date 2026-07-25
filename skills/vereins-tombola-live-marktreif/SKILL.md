---
name: vereins-tombola-live-marktreif
description: Digitale Vereins- und Eishockey-Tombolas markt-, pilot- und livefähig vorbereiten, prüfen, gestalten und testen. Verwenden für Behörden-/Compliance-Grenzen in Deutschland und Bayern, QR- und mobile Kaufstrecken, Mollie-Zahlungen direkt an den Verein, transparente Live-Auslosungen, Beamer-/Monitor-/Videowall-Modi, Datenschutz, Erlebnispreise, technische Audits, Pilotkonzepte, Vereinsrecherche, Angebotspakete und Anschreiben. Keine eigenmächtigen Liveverkäufe, Deployments, Zahlungen oder Kontaktaufnahmen ausführen.
---

# Vereins-Tombola live und marktreif machen

## Arbeitsprinzip

Den Verein als Veranstalter, Zahlungseigentümer und Empfänger sämtlicher Loserlöse behandeln. Marktbereitschaft, technische Pilotfähigkeit, behördliche Freigabe und echter Livebetrieb immer getrennt ausweisen.

Vor Rechts-/Compliance-Aussagen `references/compliance-grenze.md` vollständig lesen. Vor Technik- oder Ziehungsarbeit `references/live-technik-und-ziehung.md` vollständig lesen. Für Marktansprache und Angebote `references/markt-und-pilot.md` vollständig lesen.

## Ablauf

1. Tatsächlichen Projektordner, Git-Status, Vorgängerversion, Laufzeit, Hosting, Datenbank, Zahlungsbackend und vorhandene Dokumentation feststellen.
2. Bestehenden Stand vor Änderungen sichern; fremde oder unzuordenbare Änderungen erhalten.
3. Den Ist-Zustand mit Belegen prüfen:
   - Losbestand und Reservierung
   - Käufer- und Zahlungsdaten
   - Vereins-/Mandantentrennung
   - Rollen und Adminzugang
   - QR-/Mobil-/Checkout-Ablauf
   - Ziehungsquelle, Auditnachweis und Korrekturweg
   - synchroner Handy-/Hallenscreen
   - Datenschutz, Rechtstexte und Löschung
   - Monitoring, Backup und Offline-Notfallplan
4. Kritische Demo-Abkürzungen wie `localStorage`, hart codierte Verkäufe, globale Zahlungsschlüssel, `Math.random()`-Gewinner oder ungeschützte Adminseiten ausdrücklich benennen.
5. Behördenfähigen Spielplan und Compliance-Check erstellen. Nie „genehmigungsfrei“ oder „rechtssicher“ behaupten.
6. Produktfluss entwerfen:
   - Halleneingang mit Plakat und veranstaltungsbezogenem QR-Code
   - mobile Loswahl, Reservierung und Vereins-Checkout
   - Bestätigung und Live-Status auf dem Käufergerät
   - Verkaufsschluss, Kandidaten-Snapshot und Transparenzmoment
   - synchroner Countdown, Animation und neutrales Gewinnerlos
   - Gewinnabholung und datensparsamer Abschluss
7. Hallenmodus als eigene fernlesbare 16:9-Oberfläche planen. Plan B über Beamer, Sprecher und mobile Seite vorsehen.
8. Markt nur mit aktuellen offiziellen Vereins-, Verbands- und Behördenquellen recherchieren. Unsichere Termine oder Kontakte als `needs_review` markieren.
9. Anschreiben und Angebote ausschließlich als Entwürfe erstellen. Preise offenlassen, wenn nicht entschieden. Keine Nachricht senden.
10. Lint, Typprüfung, Build, Backendtests, Mobilflow und Projektionsflow durchführen.
11. `references/markt-und-pilot.md` als Freigabegate abarbeiten.
12. Ergebnisse getrennt berichten: lokal geprüft, Git gesichert, bereitgestellt, öffentlich verifiziert, Demo/Test/Live und offene Freigaben.

## Unverhandelbare Geldflussregel

- Jede Loszahlung im eigenen verifizierten Mollie-Konto des Vereins erstellen.
- Mollie Connect/OAuth pro Verein verwenden.
- Keine Loszahlung über das Konto des Softwareanbieters leiten.
- Keine Application Fee, Provision oder Umsatzbeteiligung aus Loszahlungen einbehalten.
- Softwaremiete separat gegenüber dem Verein abrechnen.
- Globale API-Schlüssel-Prototypen niemals live verwenden.

## Transparente Ziehung

Nur serverseitig bestätigte, bezahlte und teilnahmeberechtigte Lose verwenden. Kandidatensatz vor Start schließen und mit Zeitstempel sowie Hash protokollieren. Gewinner mit kryptografisch geeigneter serverseitiger Zufallsquelle bestimmen und atomar speichern. Animation erst danach abspielen; sie darf das Ergebnis nie erzeugen oder verändern.

Groß anzeigen: Losnummer, Preis und Abholhinweis. Nicht groß anzeigen: Name, E-Mail, Telefonnummer, Zahlungsreferenz oder andere Käuferdaten. Namen oder Bilder nur mit separater freiwilliger Freigabe veröffentlichen.

## Kontrollierte Aktionen

Ohne ausdrückliche Freigabe nicht:

- echte Lose verkaufen oder Mollie-Livezahlungen starten
- Deployments oder öffentliche Veröffentlichungen auslösen
- Vereine, Behörden, Sponsoren oder Interessenten kontaktieren
- Rückerstattungen, Auszahlungen oder Accountänderungen durchführen
- Genehmigungen als erteilt behandeln
- Erlebnispreise wie Umkleide- oder Trainerbankzugang zusagen

Jede finanzielle Aktion bleibt manuell und benötigt eine ausdrückliche Freigabe. Dazu zählen insbesondere Preise, Gebühren, Listing-Veröffentlichungen, Verkäufe, Zahlungen, Rabatte, bezahlte Werbung und Auszahlungen. Keine Automationsschicht darf diese Aktionen ausführen oder still vorbereitete Werte live übernehmen.

Wenn das Projekt einen eigenständigen Runner enthält, ihn als getrennte Komponente behandeln. Er darf nur Setup-Prüfungen, Simulationen mit klaren Testdaten, Quellen-/Angebotsberichte und Monitoring ausführen. Bei finanzieller oder externer Aktion muss er stoppen und einen Entscheidungsbericht erzeugen.

Bei fehlender Freigabe sichere Entwürfe, Testdaten und Checklisten liefern.

## Ergebnisstandard

Jede Übergabe enthält:

- klare Go/No-Go-Aussage
- kritische Risiken mit konkretem Beleg
- erledigte lokale Prüfungen
- offene Behörden-, Rechts-, Steuer-, Datenschutz- und Hallenfreigaben
- nächste Nutzerentscheidungen
- Backup- und Rückweg
