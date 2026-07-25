# Funktionsabgleich mit der Vorgängerversion

Stand: 25. Juli 2026

| Bereich | Alte Version | Neuer Stand | Status |
|---|---|---|---|
| Vereinsname, Zweck, Logo und Farben | vorhanden | geführter Admin mit Live-Vorschau | umgesetzt |
| Veranstaltung, Datum und Ziehungszeit | vorhanden | geführter Admin | umgesetzt |
| Lospreis und Losanzahl | Preis und Gewinnintervall | Preis und 20–5.000 Lose | umgesetzt |
| Gewinne | JSON-Eingabe | mindestens sechs, bis zu zwölf verständliche Formularzeilen | umgesetzt |
| Sponsoren | Namen oder Bild-URLs | bis zu 20 Namen/Logo-URLs plus Laufband | umgesetzt |
| Kundenseite | einzelne HTML-App | moderne responsive Next.js-Seite | umgesetzt |
| Ziehungsanimation | einfache Hunde-/Lotto-Sequenz | professionelles Glücksrad mit Gewinnerinszenierung | umgesetzt als Vorführmodus |
| Admin-PIN und Rollen | lokale PIN/Master-PIN | noch nicht sicher angebunden | offen |
| Mollie-Zahlung | altes Render-Backend | Firebase-Funktionsprototyp; Sollzustand ist Mollie Connect/OAuth je Verein ohne Platform-Anteil am Losumsatz | globale Schlüsselverwendung gesperrt, Connect noch offen |
| Käuferdaten / Gewinnstatus | Name und lokale Prüfung | Name, E-Mail, Demozahlung, Sofortgewinn und gespeicherter Vorgang | lokal umgesetzt, Mollie-Anbindung offen |
| Verkaufsstart/-stopp | vorhanden | noch nicht angebunden | offen |
| Verkaufsstatistik und Tabelle | vorhanden | Admin-Betriebsansicht mit Zahlungen, Losen und Sofortgewinnen | lokal umgesetzt, Firestore offen |
| QR-Plakat und Druck | vorhanden | noch nicht neu umgesetzt | offen |
| Live-Screen und Musik | vorhanden | Ziehungsbühne vorhanden, Automatik/Musik offen | teilweise |
| Hauptpreis-Gewinner | einfache Ziehung | Losnummer, Käufer, E-Mail und Zeitstempel gespeichert abrufbar | lokal umgesetzt, Firestore offen |
| Datenexport/-import | lokales JSON | noch nicht neu umgesetzt | offen |
| Rechtstexte | eingebettete Entwürfe | Businessplan nennt Pflicht; Seiten fehlen | offen |
| Mandantentrennung | nicht belastbar | Zielarchitektur dokumentiert | vor Livebetrieb umzusetzen |

Die alte Version bleibt als Referenz erhalten. Funktionen mit Zahlungs-, Personen- oder Veranstaltungsdaten werden nicht blind kopiert, sondern mit Rollen, Mandantentrennung und Serverprüfung neu aufgebaut.
