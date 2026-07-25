# Eigenständige Tombola-Automation

Diese Komponente ist vom Codex-Skill getrennt und läuft mit Node.js ohne geöffnetes Codex.

## Einrichtung

1. `config.example.json` als `config.json` kopieren.
2. Nur vorbereitende Veranstaltungsdaten und offizielle Quellen eintragen.
3. Ausführen:

```sh
./automation/run-tombola-checks.sh
```

Zeitplanfähig, zum Beispiel über `launchd` oder Cron:

```sh
node /ABSOLUTER/PFAD/automation/tombola-runner.mjs --mode event-check --config /ABSOLUTER/PFAD/automation/config.json
```

Berichte landen unter `automation/reports/`.

## Sicherheitsgrenze

Der Runner:

- prüft Event-Setups
- simuliert ausschließlich mit ausdrücklich hinterlegten Testlosen
- meldet veraltete offizielle Quellen
- erzeugt Berichte

Der Runner:

- kontaktiert niemanden
- verkauft keine Lose
- startet keine Zahlung oder Auszahlung
- ändert keine Preise, Gebühren oder Rabatte
- veröffentlicht keine Listings oder Werbung
- führt keine Live-Auslosung durch

Sobald eine solche Aktion angefordert wird, beendet er sich mit Statuscode 2 und erzeugt einen Stop-Bericht.
