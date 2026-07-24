"use client";

import { useMemo, useState } from "react";

const prizes = [
  { place: "Hauptgewinn", title: "Familien-Erlebnistag", value: "Wert 250 €", tone: "gold" },
  { place: "2. Preis", title: "Genusskorb aus der Region", value: "Wert 120 €", tone: "coral" },
  { place: "3. Preis", title: "Vereins-Fanpaket", value: "Wert 75 €", tone: "blue" },
];

const sold = new Set([1, 2, 5, 8, 11, 14, 17, 21, 26, 31, 34, 38, 41, 44, 47, 53, 57, 62]);

function Icon({ name }: { name: "ticket" | "shield" | "heart" | "arrow" | "check" }) {
  const paths = {
    ticket: <path d="M3 7.5A2.5 2.5 0 0 0 5.5 10 2.5 2.5 0 0 0 3 12.5V16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3.5a2.5 2.5 0 0 1 0-5V4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3.5Z"/>,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Zm-3-10 2 2 4-5"/>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/>,
    arrow: <path d="m9 18 6-6-6-6"/>,
    check: <path d="m5 12 4 4L19 6"/>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24">{paths[name]}</svg>;
}

export default function Home() {
  const [selected, setSelected] = useState<number[]>([7, 23]);
  const [showAll, setShowAll] = useState(false);
  const ticketNumbers = useMemo(() => Array.from({ length: showAll ? 100 : 64 }, (_, index) => index + 1), [showAll]);
  const total = selected.length * 2.5;

  function toggleTicket(number: number) {
    if (sold.has(number)) return;
    setSelected((current) =>
      current.includes(number) ? current.filter((item) => item !== number) : [...current, number].sort((a, b) => a - b)
    );
  }

  return (
    <main>
      <header className="nav">
        <a className="brand" href="#" aria-label="Vereinsglück Startseite">
          <span className="brand-mark"><Icon name="ticket" /></span>
          <span>Vereins<span>glück</span></span>
        </a>
        <nav aria-label="Hauptnavigation">
          <a href="#preise">Gewinne</a>
          <a href="#lose">Lose</a>
          <a href="#so-gehts">So geht&apos;s</a>
        </nav>
        <a className="nav-cta" href="#lose">Lose wählen <Icon name="arrow" /></a>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Digitale Vereinstombola · Live-Demo</span>
          <h1>Ein Los.<br />Viel <em>Vereinsglück.</em></h1>
          <p>Mit jedem Los unterstützt du direkt die Jugendarbeit des Beispielvereins – und sicherst dir deine Chance auf tolle regionale Gewinne.</p>
          <div className="hero-actions">
            <a className="primary-button" href="#lose"><Icon name="ticket" /> Jetzt Lose sichern</a>
            <span><strong>2,50 €</strong><small>pro Los</small></span>
          </div>
          <div className="trust-row">
            <span><Icon name="shield" /> Sicher bezahlen</span>
            <span><Icon name="heart" /> Direkt für den Verein</span>
          </div>
        </div>
        <div className="hero-art" aria-label="Illustration einer Tombola-Lostrommel">
          <div className="sun" />
          <div className="confetti c1" /><div className="confetti c2" /><div className="confetti c3" />
          <div className="drum">
            <div className="drum-glass">
              <span>17</span><span>42</span><span>8</span><span>31</span><span>23</span>
            </div>
            <div className="drum-axis" />
            <div className="drum-leg left" /><div className="drum-leg right" />
          </div>
          <div className="event-card">
            <span>Nächste Ziehung</span>
            <strong>Sonntag, 18:00 Uhr</strong>
            <small>Live beim Vereinsfest</small>
          </div>
        </div>
      </section>

      <section className="stats" aria-label="Aktueller Tombolastand">
        <div><strong>1.284 €</strong><span>für den Verein gesammelt</span></div>
        <div><strong>514</strong><span>verkaufte Lose</span></div>
        <div><strong>86</strong><span>Lose noch verfügbar</span></div>
        <div className="progress-wrap"><span><b style={{ width: "86%" }} /></span><small>86 % verkauft</small></div>
      </section>

      <section className="section prizes" id="preise">
        <div className="section-heading">
          <div><span className="eyebrow">Das kannst du gewinnen</span><h2>Preise, die Freude machen.</h2></div>
          <p>Von regionalen Partnern gestiftet. Damit möglichst viel vom Erlös dort ankommt, wo es gebraucht wird.</p>
        </div>
        <div className="prize-grid">
          {prizes.map((prize, index) => (
            <article className={`prize-card ${prize.tone}`} key={prize.title}>
              <span className="prize-number">0{index + 1}</span>
              <div className="prize-visual">{index === 0 ? "✦" : index === 1 ? "◒" : "◆"}</div>
              <span>{prize.place}</span>
              <h3>{prize.title}</h3>
              <small>{prize.value}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="ticket-section" id="lose">
        <div className="ticket-shell">
          <div className="ticket-intro">
            <span className="eyebrow">Deine Glückszahlen</span>
            <h2>Lose auswählen.<br />Verein unterstützen.</h2>
            <p>Wähle deine Lieblingsnummern. Bereits vergebene Lose sind grau markiert. Dein Los wird während der Zahlung kurz reserviert.</p>
            <ul>
              <li><Icon name="check" /> Digitale Bestätigung direkt nach Zahlung</li>
              <li><Icon name="check" /> Gewinner werden persönlich informiert</li>
              <li><Icon name="check" /> Einnahmen gehen direkt an den Verein</li>
            </ul>
          </div>
          <div className="picker-card">
            <div className="picker-head"><strong>Wähle deine Lose</strong><span>{selected.length} ausgewählt</span></div>
            <div className="ticket-grid">
              {ticketNumbers.map((number) => (
                <button
                  className={`${sold.has(number) ? "sold" : ""} ${selected.includes(number) ? "selected" : ""}`}
                  disabled={sold.has(number)}
                  aria-label={`Los ${number}${sold.has(number) ? " vergeben" : ""}`}
                  aria-pressed={selected.includes(number)}
                  onClick={() => toggleTicket(number)}
                  key={number}
                >
                  {number}
                </button>
              ))}
            </div>
            <button className="show-more" onClick={() => setShowAll((value) => !value)}>{showAll ? "Weniger anzeigen" : "Alle 100 Lose anzeigen"}</button>
            <div className="checkout">
              <div><span>{selected.length} Lose</span><strong>{total.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}</strong></div>
              <button disabled={!selected.length}>Weiter zur Zahlung <Icon name="arrow" /></button>
            </div>
            <p className="demo-note">Demo: Die echte Zahlung wird erst nach Einrichtung des Vereinskontos aktiviert.</p>
          </div>
        </div>
      </section>

      <section className="section steps" id="so-gehts">
        <span className="eyebrow">Einfach für Gäste und Verein</span>
        <h2>In drei Schritten zum Glückslos.</h2>
        <div>
          <article><b>1</b><h3>Lose wählen</h3><p>Freie Nummern antippen und Auswahl prüfen.</p></article>
          <article><b>2</b><h3>Sicher bezahlen</h3><p>Über das eigene Zahlungskonto des Vereins.</p></article>
          <article><b>3</b><h3>Mitfiebern</h3><p>Bestätigung erhalten und bei der Ziehung dabei sein.</p></article>
        </div>
      </section>

      <footer>
        <a className="brand" href="#"><span className="brand-mark"><Icon name="ticket" /></span><span>Vereins<span>glück</span></span></a>
        <p>Die digitale Tombola für Vereine, Feste und gute Zwecke.</p>
        <div><a href="#">Impressum</a><a href="#">Datenschutz</a><a href="#">Teilnahmebedingungen</a></div>
      </footer>
    </main>
  );
}
