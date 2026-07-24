"use client";
/* eslint-disable @next/next/no-img-element -- Vereins- und Sponsorenlogos können dynamische Data-URLs oder externe URLs sein. */

import Link from "next/link";
import { CSSProperties, useEffect, useMemo, useState } from "react";
import { defaultConfig, readConfig, readOrders, saveOrders, TombolaConfig, TombolaOrder } from "../lib/tombola-config";

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
  const [config, setConfig] = useState<TombolaConfig>(defaultConfig);
  const [selected, setSelected] = useState<number[]>([7, 23]);
  const [showAll, setShowAll] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [winner, setWinner] = useState<number | null>(null);
  const [rotation, setRotation] = useState(0);
  const [rollingNumber, setRollingNumber] = useState<number | null>(null);
  const [wheelNumbers, setWheelNumbers] = useState<number[]>([7, 18, 23, 31, 42, 56, 64, 71, 78, 84, 91, 99]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [customer, setCustomer] = useState({ name: "", email: "" });
  const [purchaseResult, setPurchaseResult] = useState<TombolaOrder | null>(null);
  const visibleTickets = Math.min(config.totalTickets, showAll ? config.totalTickets : 64);
  const ticketNumbers = useMemo(() => Array.from({ length: visibleTickets }, (_, index) => index + 1), [visibleTickets]);
  const total = selected.length * config.ticketPrice;
  const pageStyle = { "--green": config.primaryColor, "--coral": config.accentColor } as CSSProperties;

  useEffect(() => {
    const refresh = () => setConfig(readConfig());
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("vereinsglueck-config", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("vereinsglueck-config", refresh);
    };
  }, []);

  function toggleTicket(number: number) {
    if (sold.has(number)) return;
    setSelected((current) =>
      current.includes(number) ? current.filter((item) => item !== number) : [...current, number].sort((a, b) => a - b)
    );
  }

  function startWheel() {
    if (spinning || countdown !== null) return;
    const pool = selected.length ? selected : [7, 23, 39, 56];
    const nextWinner = pool[Math.floor(Math.random() * pool.length)];
    setWinner(null);
    setRollingNumber(null);
    setCountdown(3);
    window.setTimeout(() => setCountdown(2), 600);
    window.setTimeout(() => setCountdown(1), 1200);
    const randomTicket = () => Math.floor(Math.random() * config.totalTickets) + 1;
    const shuffleDisplay = () => {
      const numbers = new Set<number>();
      while (numbers.size < Math.min(12, config.totalTickets)) numbers.add(randomTicket());
      const nextNumbers = [...numbers];
      while (nextNumbers.length < 12) nextNumbers.push(randomTicket());
      setWheelNumbers(nextNumbers);
      setRollingNumber(nextNumbers[Math.floor(Math.random() * nextNumbers.length)]);
    };
    window.setTimeout(() => {
      setCountdown(null);
      setSpinning(true);
      shuffleDisplay();
      const numberInterval = window.setInterval(shuffleDisplay, 90);
      const alignedRotation = rotation + 1800 + ((360 - (rotation % 360)) % 360);
      setRotation(alignedRotation);
      window.setTimeout(() => {
        window.clearInterval(numberInterval);
        setWheelNumbers((current) => [nextWinner, ...current.filter((number) => number !== nextWinner)].slice(0, 12));
        setRollingNumber(nextWinner);
        setWinner(nextWinner);
        setSpinning(false);
      }, 4300);
    }, 1800);
  }

  function completeDemoPayment() {
    const name = customer.name.trim();
    const email = customer.email.trim();
    if (name.length < 2 || !email.includes("@") || !selected.length) return;
    const instantWins = selected.flatMap((ticket) => {
      const range = config.instantPrizeRanges.find((item) => ticket >= item.from && ticket <= item.to);
      return range ? [{ ticket, prize: range.prize }] : [];
    });
    const order: TombolaOrder = {
      id: `DEMO-${Date.now()}`,
      name,
      email,
      tickets: [...selected],
      amount: total,
      status: "demo_paid",
      paidAt: new Date().toISOString(),
      instantWins,
    };
    saveOrders([order, ...readOrders()]);
    setPurchaseResult(order);
    setCheckoutOpen(false);
  }

  return (
    <main style={pageStyle}>
      <header className="nav">
        <a className="brand" href="#" aria-label="Vereinsglück Startseite">
          <span className="brand-mark"><Icon name="ticket" /></span>
          {config.logoDataUrl ? <img className="customer-logo" src={config.logoDataUrl} alt={`${config.associationName} Logo`} /> : <span>Vereins<span>glück</span></span>}
        </a>
        <nav aria-label="Hauptnavigation">
          <a href="#preise">Gewinne</a>
          <a href="#lose">Lose</a>
          <a href="#so-gehts">So geht&apos;s</a>
          <a href="#ziehung">Ziehung</a>
        </nav>
        <div className="nav-actions"><Link className="admin-link" href="/admin">Admin</Link><a className="nav-cta" href="#lose">Lose wählen <Icon name="arrow" /></a></div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Digitale Vereinstombola · Live-Demo</span>
          <h1>Ein Los.<br />Viel <em>Vereinsglück.</em></h1>
          <p>Mit jedem Los unterstützt du direkt {config.purpose} von {config.associationName} – und sicherst dir deine Chance auf tolle regionale Gewinne.</p>
          <div className="hero-actions">
            <a className="primary-button" href="#lose"><Icon name="ticket" /> Jetzt Lose sichern</a>
            <span><strong>{config.ticketPrice.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}</strong><small>pro Los</small></span>
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
            <strong>{config.eventDate}, {config.drawTime}</strong>
            <small>Live bei {config.eventName}</small>
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
          {config.prizes.map((prize, index) => (
            <article className={`prize-card ${["gold", "coral", "blue"][index % 3]}`} key={`${prize.title}-${index}`}>
              <span className="prize-number">0{index + 1}</span>
              <div className="prize-visual">{["✦", "◒", "◆", "●", "◇", "✷"][index % 6]}</div>
              <span>{index === 0 ? "Hauptgewinn" : `${index + 1}. Preis`}</span>
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
            {config.totalTickets > 64 && <button className="show-more" onClick={() => setShowAll((value) => !value)}>{showAll ? "Weniger anzeigen" : `Alle ${config.totalTickets.toLocaleString("de-DE")} Lose anzeigen`}</button>}
            <div className="checkout">
              <div><span>{selected.length} Lose</span><strong>{total.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}</strong></div>
              <button disabled={!selected.length} onClick={() => setCheckoutOpen(true)}>Weiter zur Zahlung <Icon name="arrow" /></button>
            </div>
            <p className="demo-note">Demo: Die echte Zahlung wird erst nach Einrichtung des Vereinskontos aktiviert.</p>
          </div>
        </div>
      </section>

      {config.sponsors.length > 0 && <section className="sponsor-section">
        <span className="eyebrow">Mit Unterstützung von</span>
        <h2>Starke Partner für den Verein.</h2>
        <div className="sponsor-marquee"><div className="sponsor-track">
          {[...config.sponsors, ...config.sponsors].map((sponsor, index) => <div className="sponsor-logo-card" key={`${sponsor.name}-${index}`}>{sponsor.logoUrl ? <img src={sponsor.logoUrl} alt={`${sponsor.name} Logo`} /> : <strong>{sponsor.name}</strong>}</div>)}
        </div></div>
      </section>}

      <section className="draw-section" id="ziehung">
        <div className="draw-copy">
          <span className="eyebrow">Der große Gewinner-Moment</span>
          <h2>Eine Ziehung, bei der alle hinschauen.</h2>
          <p>Das Glücksrad mischt die gewählten Losnummern und setzt den Gewinner anschließend eindrucksvoll in Szene – für Beamer, Großbildschirm und Smartphone.</p>
          <div className="draw-features"><span>Live auf Großbild</span><span>Faire Zufallsauswahl</span><span>Gewinner klar sichtbar</span></div>
          <button className="draw-button" onClick={startWheel} disabled={spinning || countdown !== null}>{countdown !== null ? `Start in ${countdown} …` : spinning ? "Die Lose rasen durchs Rad …" : winner ? "Show noch einmal starten" : "Große Ziehung starten"} <Icon name="arrow" /></button>
          <small className="draw-demo-note">Vorführmodus – es wird kein echtes Gewinnerlos gespeichert.</small>
        </div>
        <div className={`draw-stage ${countdown !== null ? "is-counting" : ""} ${spinning ? "is-spinning" : ""} ${winner ? "has-winner" : ""}`}>
          <div className="stage-light light-one" /><div className="stage-light light-two" />
          <div className="show-banner"><b>LIVE</b><span>VEREINSGLÜCK · GROSSE ZIEHUNG</span></div>
          <div className="draw-status"><i /><span>{countdown !== null ? "Show startet" : spinning ? "Ziehung läuft" : winner ? "Gewinner gezogen" : "Bereit für die Ziehung"}</span></div>
          <div className="energy-ring ring-one" /><div className="energy-ring ring-two" /><div className="energy-ring ring-three" />
          {countdown !== null && <div className="countdown-overlay"><span>{countdown}</span><small>Mach dich bereit</small></div>}
          <div className="wheel-wrap">
            <div className="wheel-pointer" />
            <div className="premium-wheel" style={{ transform: `rotate(${rotation}deg)` }}>
              {wheelNumbers.map((number, index) => <span style={{ transform: `rotate(${index * 30}deg) translateY(-128px)` }} key={`${index}-${number}`}>{String(number).padStart(3, "0")}</span>)}
            </div>
            <div className="wheel-hub"><small>{spinning ? "Los läuft" : winner ? "Gewinner" : "Vereinsglück"}</small><strong>{rollingNumber ? String(rollingNumber).padStart(3, "0") : "START"}</strong></div>
          </div>
          <div className="winner-card">
            <span>Das Gewinnerlos</span>
            <strong>{winner ? String(winner).padStart(3, "0") : "— — —"}</strong>
            <small>{winner ? "Herzlichen Glückwunsch!" : "Wird gleich gezogen"}</small>
          </div>
          <div className="winner-burst"><span>GEWINNER</span></div>
          <div className="stage-particles">{Array.from({ length: 14 }, (_, index) => <i key={index} />)}</div>
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

      {checkoutOpen && <div className="checkout-modal" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
        <div className="checkout-dialog">
          <button className="modal-close" onClick={() => setCheckoutOpen(false)} aria-label="Schließen">×</button>
          <span className="eyebrow">Persönliche Losbestätigung</span>
          <h2 id="checkout-title">Fast geschafft.</h2>
          <p>Damit der Verein einen Gewinn zuordnen kann, brauchen wir Name und E‑Mail-Adresse.</p>
          <label>Name<input value={customer.name} onChange={(event) => setCustomer({ ...customer, name: event.target.value })} placeholder="Vor- und Nachname" autoComplete="name" /></label>
          <label>E‑Mail-Adresse<input type="email" value={customer.email} onChange={(event) => setCustomer({ ...customer, email: event.target.value })} placeholder="name@beispiel.de" autoComplete="email" /></label>
          <div className="checkout-summary"><span>{selected.length} Lose: {selected.map((number) => String(number).padStart(3, "0")).join(", ")}</span><strong>{total.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}</strong></div>
          <button className="demo-pay-button" disabled={customer.name.trim().length < 2 || !customer.email.includes("@")} onClick={completeDemoPayment}>Demozahlung bestätigen</button>
          <small>Demo-Modus: Es wird kein Geld abgebucht. Im Livebetrieb führt dieser Schritt zum Mollie-Konto des Vereins.</small>
        </div>
      </div>}

      {purchaseResult && <div className="checkout-modal" role="dialog" aria-modal="true" aria-labelledby="result-title">
        <div className="checkout-dialog result-dialog">
          <button className="modal-close" onClick={() => setPurchaseResult(null)} aria-label="Schließen">×</button>
          <span className="eyebrow">Zahlung bestätigt · Demo</span>
          <h2 id="result-title">{purchaseResult.instantWins.length ? "Sofort gewonnen!" : "Du bist im Lostopf."}</h2>
          {purchaseResult.instantWins.length ? <div className="instant-win-list">{purchaseResult.instantWins.map((win) => <div key={win.ticket}><b>Los {String(win.ticket).padStart(3, "0")}</b><strong>{win.prize}</strong></div>)}</div> : <p>Deine Lose haben keinen Sofortgewinn. Sie nehmen weiterhin an der Hauptpreisziehung teil.</p>}
          <div className="main-draw-note"><span>Hauptpreis</span><strong>{config.mainPrizeTitle}</strong><small>Ziehung: {config.eventDate}, {config.drawTime}</small></div>
          <p className="order-reference">Vorgang: {purchaseResult.id} · gespeichert für {purchaseResult.email}</p>
          <button className="demo-pay-button" onClick={() => setPurchaseResult(null)}>Fertig</button>
        </div>
      </div>}

      <footer>
        <a className="brand" href="#"><span className="brand-mark"><Icon name="ticket" /></span><span>Vereins<span>glück</span></span></a>
        <p>Die digitale Tombola für Vereine, Feste und gute Zwecke.</p>
        <div><a href="#">Impressum</a><a href="#">Datenschutz</a><a href="#">Teilnahmebedingungen</a></div>
      </footer>
    </main>
  );
}
