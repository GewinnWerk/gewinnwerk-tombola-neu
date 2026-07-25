#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const automationDir = dirname(fileURLToPath(import.meta.url));
const defaultConfig = resolve(automationDir, "config.json");
const reportsDir = resolve(automationDir, "reports");

const allowedModes = new Set(["all", "event-check", "draw-simulation", "research-report"]);
const forbiddenActionTerms = [
  "price", "preis", "fee", "gebühr", "listing", "publish", "veröffentlich",
  "sale", "verkauf", "payment", "zahlung", "discount", "rabatt", "advert",
  "werbung", "payout", "auszahlung", "refund", "erstattung", "contact",
  "kontakt", "email", "live-draw", "live-auslosung"
];

function parseArgs(argv) {
  const result = { mode: "all", config: defaultConfig };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--mode") result.mode = argv[++index];
    else if (value === "--config") result.config = resolve(argv[++index]);
    else if (value === "--help") result.help = true;
    else throw new Error(`Unbekanntes Argument: ${value}`);
  }
  return result;
}

function help() {
  return [
    "Tombola Prepare-only Runner",
    "",
    "Aufruf:",
    "  node automation/tombola-runner.mjs --mode all --config automation/config.json",
    "",
    "Modi:",
    "  event-check       Event-Setup und Freigaben prüfen",
    "  draw-simulation   ausschließlich Testlose deterministisch simulieren",
    "  research-report   gespeicherte offizielle Quellen auf Aktualität prüfen",
    "  all               alle sicheren Prüfungen ausführen",
    "",
    "Der Runner verkauft keine Lose, kontaktiert niemanden und führt keine finanzielle oder Live-Aktion aus."
  ].join("\n");
}

function isoStamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function containsForbiddenIntent(config) {
  const actions = Array.isArray(config.requestedActions) ? config.requestedActions : [];
  const matches = actions.filter((action) => {
    const text = JSON.stringify(action).toLowerCase();
    return forbiddenActionTerms.some((term) => text.includes(term));
  });
  if (config.environment === "live") matches.push("environment=live");
  if (config.draftOutreach?.enabled) matches.push("draftOutreach.enabled=true");
  return matches;
}

function eventCheck(config) {
  const event = config.event || {};
  const required = ["id", "club", "venue", "eventDate", "salesEnd", "drawTime", "ticketPrice", "ticketCount"];
  const missing = required.filter((key) => event[key] === null || event[key] === undefined || event[key] === "");
  const blockers = [];

  if (config.policy !== "prepare_only") blockers.push("policy muss prepare_only sein");
  if (event.authorityStatus !== "approved") blockers.push("Behörden-/Anzeigeprüfung nicht als approved dokumentiert");
  if (event.mollieMode !== "test") blockers.push("Nur Mollie-Testmodus ist für Automation zulässig");
  if (event.privacyMode !== "ticket_number_only") blockers.push("Öffentliche Anzeige muss standardmäßig nur Losnummern verwenden");
  if (!["projector", "monitor", "videowall", "none"].includes(event.screenMode)) blockers.push("Unbekannter Hallenscreen-Modus");

  return { missing, blockers };
}

function simulateDraw(config) {
  const simulation = config.simulation || {};
  const tickets = [...new Set((simulation.tickets || []).map(Number).filter(Number.isInteger))].sort((a, b) => a - b);
  if (!tickets.length) return { error: "Keine Testlose für die Simulation vorhanden." };
  if (tickets.length > 10000) return { error: "Simulation auf maximal 10.000 Testlose begrenzt." };
  const seed = String(simulation.seed || "");
  if (!seed) return { error: "Simulations-Seed fehlt." };
  const digest = createHash("sha256").update(`${seed}:${tickets.join(",")}`).digest("hex");
  const index = Number.parseInt(digest.slice(0, 12), 16) % tickets.length;
  return {
    label: "SIMULATION – KEINE LIVE-AUSLOSUNG",
    candidateCount: tickets.length,
    candidateHash: createHash("sha256").update(tickets.join(",")).digest("hex"),
    seedHash: createHash("sha256").update(seed).digest("hex"),
    simulatedTicket: tickets[index]
  };
}

function researchCheck(config) {
  const sources = Array.isArray(config.sources) ? config.sources : [];
  const now = Date.now();
  return sources.map((source) => {
    const reviewed = Date.parse(source.reviewedAt || "");
    const ageDays = Number.isFinite(reviewed) ? Math.floor((now - reviewed) / 86400000) : null;
    return {
      name: source.name || "Unbenannte Quelle",
      url: source.url || "",
      status: source.status || "needs_review",
      ageDays,
      needsRefresh: ageDays === null || ageDays > 30 || source.status !== "reviewed"
    };
  });
}

function renderReport({ args, configPath, stopped, forbidden, checks, simulation, sources }) {
  const lines = [
    "# Tombola-Automationsbericht",
    "",
    `Erstellt: ${new Date().toISOString()}`,
    `Modus: \`${args.mode}\``,
    `Konfiguration: \`${configPath}\``,
    "",
    "## Sicherheitsstatus",
    "",
    stopped
      ? "**STOPP:** Eine finanzielle, externe oder Live-Aktion wurde angefordert. Der Runner hat keine Aktion ausgeführt."
      : "**OK:** Nur vorbereitende Prüfungen und Simulationen wurden ausgeführt.",
    ""
  ];

  if (forbidden.length) {
    lines.push("Erkannte Stop-Gründe:", "", ...forbidden.map((item) => `- ${JSON.stringify(item)}`), "");
  }

  if (checks) {
    lines.push(
      "## Event-Setup",
      "",
      `Fehlende Entscheidungen: ${checks.missing.length}`,
      ...checks.missing.map((item) => `- ${item}`),
      "",
      `Blocker: ${checks.blockers.length}`,
      ...checks.blockers.map((item) => `- ${item}`),
      ""
    );
  }

  if (simulation) {
    lines.push("## Auslosungs-Simulation", "");
    if (simulation.error) lines.push(`- Fehler: ${simulation.error}`, "");
    else lines.push(
      `- Kennzeichnung: ${simulation.label}`,
      `- Testlose: ${simulation.candidateCount}`,
      `- Kandidaten-Hash: \`${simulation.candidateHash}\``,
      `- Seed-Hash: \`${simulation.seedHash}\``,
      `- Simuliertes Los: **${simulation.simulatedTicket}**`,
      ""
    );
  }

  if (sources) {
    lines.push("## Quellen- und Recherchemonitor", "");
    if (!sources.length) lines.push("- Keine Quellen hinterlegt.", "");
    else for (const source of sources) {
      lines.push(`- ${source.name}: ${source.needsRefresh ? "needs_review" : "aktuell geprüft"} · ${source.url}`);
    }
    lines.push("");
  }

  lines.push(
    "## Manuelle nächste Schritte",
    "",
    "- Preise, Gebühren und Losparameter durch den Nutzer entscheiden und freigeben.",
    "- Behörden-, Rechts-, Steuer- und Datenschutzfreigaben manuell bestätigen.",
    "- Kontakte, Veröffentlichungen, Verkäufe, Zahlungen, Werbung und Auszahlungen ausschließlich manuell auslösen.",
    "- Eine echte Ziehung niemals mit diesem Runner durchführen.",
    ""
  );
  return lines.join("\n");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    process.stdout.write(`${help()}\n`);
    return;
  }
  if (!allowedModes.has(args.mode)) throw new Error(`Unzulässiger Modus: ${args.mode}`);

  const raw = await readFile(args.config, "utf8");
  const config = JSON.parse(raw);
  const forbidden = containsForbiddenIntent(config);
  const stopped = forbidden.length > 0;

  const runEvent = !stopped && ["all", "event-check"].includes(args.mode);
  const runSimulation = !stopped && ["all", "draw-simulation"].includes(args.mode);
  const runResearch = !stopped && ["all", "research-report"].includes(args.mode);

  const report = renderReport({
    args,
    configPath: args.config,
    stopped,
    forbidden,
    checks: runEvent ? eventCheck(config) : null,
    simulation: runSimulation ? simulateDraw(config) : null,
    sources: runResearch ? researchCheck(config) : null
  });

  await mkdir(reportsDir, { recursive: true });
  const output = resolve(reportsDir, `${isoStamp()}-${basename(args.mode)}.md`);
  await writeFile(output, report, "utf8");
  process.stdout.write(`${output}\n`);
  if (stopped) process.exitCode = 2;
}

main().catch((error) => {
  process.stderr.write(`Runner-Fehler: ${error.message}\n`);
  process.exitCode = 1;
});
