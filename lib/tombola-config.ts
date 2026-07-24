export type TombolaConfig = {
  associationName: string;
  purpose: string;
  eventName: string;
  eventDate: string;
  drawTime: string;
  ticketPrice: number;
  totalTickets: number;
  primaryColor: string;
  accentColor: string;
  logoDataUrl: string;
  prizes: Array<{ title: string; value: string }>;
  sponsors: Array<{ name: string; logoUrl: string }>;
};

export const CONFIG_STORAGE_KEY = "vereinsglueck-config-v1";

export const defaultConfig: TombolaConfig = {
  associationName: "Beispielverein e. V.",
  purpose: "unsere Jugendarbeit",
  eventName: "Großes Vereinsfest",
  eventDate: "Sonntag",
  drawTime: "18:00 Uhr",
  ticketPrice: 2.5,
  totalTickets: 100,
  primaryColor: "#1c594a",
  accentColor: "#e97856",
  logoDataUrl: "",
  prizes: [
    { title: "Familien-Erlebnistag", value: "Wert 250 €" },
    { title: "Genusskorb aus der Region", value: "Wert 120 €" },
    { title: "Vereins-Fanpaket", value: "Wert 75 €" },
    { title: "Restaurant-Gutschein", value: "Wert 60 €" },
    { title: "Freizeit-Gutschein", value: "Wert 40 €" },
    { title: "Überraschungspaket", value: "Wert 25 €" },
  ],
  sponsors: [
    { name: "Regionale Partner", logoUrl: "" },
    { name: "Freunde des Vereins", logoUrl: "" },
  ],
};

export function readConfig(): TombolaConfig {
  if (typeof window === "undefined") return defaultConfig;
  try {
    const saved = JSON.parse(window.localStorage.getItem(CONFIG_STORAGE_KEY) || "");
    const savedPrizes = Array.isArray(saved.prizes) ? saved.prizes.slice(0, 12) : [];
    const normalizedPrizes = [...savedPrizes];
    while (normalizedPrizes.length < 6) normalizedPrizes.push(defaultConfig.prizes[normalizedPrizes.length]);
    return {
      ...defaultConfig,
      ...saved,
      prizes: normalizedPrizes,
      sponsors: Array.isArray(saved.sponsors) ? saved.sponsors.slice(0, 20) : defaultConfig.sponsors,
    };
  } catch {
    return defaultConfig;
  }
}

export function saveConfig(config: TombolaConfig) {
  window.localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  window.dispatchEvent(new Event("vereinsglueck-config"));
}
