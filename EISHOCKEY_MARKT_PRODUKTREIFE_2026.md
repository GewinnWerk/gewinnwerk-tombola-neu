# Eishockey-Tombola: Markt- und Produktreife 2026/27

Stand: 25. Juli 2026

## Entscheidung

**Marktidee: sinnvoll. Livebetrieb: noch No-Go.**

Kleinere Eishockeyvereine bieten einen guten Pilotmarkt: wiederkehrende Heimspiele, emotional starke Club-Erlebnisse, sichtbare Nachwuchszwecke und vorhandene Hallenkommunikation. Der QR-Kauf mit paralleler Ziehung auf Handy und Hallenscreen ist ein klares Produktversprechen.

Der aktuelle Prototyp darf dennoch keine echten Lose verkaufen. Hauptblocker sind:

1. Die Schwaben-Allgemeinerlaubnis schließt Internet-Losverkauf aus; der mobile QR-Kauf benötigt eine schriftlich bestätigte zulässige Behördenstruktur.
2. Bestellungen, Käufer und Ziehung werden aktuell nur lokal im Browser gespeichert.
3. Die Demo-Ziehung nutzt `Math.random()` und ist weder manipulationsgeschützt noch auditierbar.
4. Der vorhandene Backendprototyp nutzt einen globalen Mollie-Schlüssel statt Mollie Connect pro Verein.
5. Authentifizierung, Firestore-Regeln, Live-Synchronisation und echte Rechtstexte fehlen.

## Empfohlene Pilotstrategie

1. Behördenfähigen Spielplan und klickbaren Testflow fertigstellen, ohne echtes Geld.
2. Gemeinde/Regierung mit genauer Beschreibung des QR-Kaufs und Verkaufsorts schriftlich anfragen.
3. Technik zuerst mit Testdaten und Mollie-Testmodus aufbauen.
4. Hallen-Generalprobe bei einem kleinen Landesligaverein durchführen.
5. Erst nach schriftlichen Freigaben einen beaufsichtigten Einzelspiel-Pilot aktivieren.
6. Preise für Software und Lose erst nach Aufwand, Gewinnwerten und Behördenrahmen manuell entscheiden.

## Empfohlene Reihenfolge der Vereine

1. ERC Lechbruck – kleiner Standort, Nachwuchs, Monitorwerbung, klare Zuständigkeiten
2. ESC Kempten – neue LED-Wand, guter Technikpartner für die zweite Stufe
3. EV Pfronten – familiärer Landesligastandort und klare Kontakte
4. ERC Sonthofen – Förderkreis mit konkretem Nachwuchszweck
5. EV Bad Wörishofen – Landesliga-Aufstieg und Veranstaltungserfahrung

Keine Kontaktaufnahme wurde durchgeführt.

## Erstellte Arbeitsunterlagen

- [Compliance Bayern](./COMPLIANCE_EISHOCKEY_BAYERN.md)
- [Technische Live-Reife](./TECHNIK_LIVEREIFE_EISHOCKEY.md)
- [QR-/Mobil-/Hallenscreen-Flow](./SCREEN_FLOW_EISHOCKEY.md)
- [Priorisierte Vereinsliste](./MARKT_EISHOCKEY_ALLGAEU.md)
- [Angebots- und Anschreibenentwurf](./ANGEBOT_EISHOCKEY_ENTWURF.md)
- [Überarbeiteter Businessplan](./BUSINESSPLAN.md)
- [Übertragbarer Projektskill](./skills/vereins-tombola-live-marktreif/SKILL.md)
- [Eigenständiger Prepare-only-Runner](./automation/README.md)

## Nächste Nutzerentscheidungen

1. Soll der erste Behördenfähigkeits- und Technikpilot auf ERC Lechbruck oder EV Pfronten zugeschnitten werden?
2. Soll es nur eine Hauptziehung oder zusätzlich Sofortgewinne geben?
3. Welche Erlebnispreise darf der Pilotverein tatsächlich schriftlich zusagen?
4. Welche Hallentechnik ist für den ersten Pilot verbindlich verfügbar?
5. Welches Preis- und Lizenzmodell soll nach den ersten Aufwandstests kalkuliert werden?

Keine dieser Entscheidungen wird durch Skill oder Runner automatisch veröffentlicht oder finanziell umgesetzt.
