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
  instantPrizeRanges: Array<{ from: number; to: number; prize: string }>;
  mainPrizeTitle: string;
};

export type TombolaOrder = {
  id: string;
  name: string;
  email: string;
  tickets: number[];
  amount: number;
  status: "demo_paid" | "paid";
  paidAt: string;
  instantWins: Array<{ ticket: number; prize: string }>;
};

export type MainDrawResult = {
  ticket: number;
  prize: string;
  drawnAt: string;
  name: string;
  email: string;
};

export const CONFIG_STORAGE_KEY = "vereinsglueck-config-v1";
export const ORDER_STORAGE_KEY = "vereinsglueck-orders-v1";
export const MAIN_DRAW_STORAGE_KEY = "vereinsglueck-main-draw-v1";

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
  instantPrizeRanges: [
    { from: 10, to: 20, prize: "Restaurant-Gutschein" },
    { from: 21, to: 30, prize: "Freizeit-Gutschein" },
    { from: 31, to: 40, prize: "Überraschungspaket" },
  ],
  mainPrizeTitle: "Familien-Erlebnistag",
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
      instantPrizeRanges: Array.isArray(saved.instantPrizeRanges) ? saved.instantPrizeRanges.slice(0, 20) : defaultConfig.instantPrizeRanges,
    };
  } catch {
    return defaultConfig;
  }
}

export function saveConfig(config: TombolaConfig) {
  window.localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  window.dispatchEvent(new Event("vereinsglueck-config"));
}

export function readOrders(): TombolaOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const orders = JSON.parse(window.localStorage.getItem(ORDER_STORAGE_KEY) || "[]");
    return Array.isArray(orders) ? orders : [];
  } catch {
    return [];
  }
}

export function saveOrders(orders: TombolaOrder[]) {
  window.localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders));
  window.dispatchEvent(new Event("vereinsglueck-orders"));
}

export function readMainDraw(): MainDrawResult | null {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(window.localStorage.getItem(MAIN_DRAW_STORAGE_KEY) || "null");
  } catch {
    return null;
  }
}

export function saveMainDraw(result: MainDrawResult) {
  window.localStorage.setItem(MAIN_DRAW_STORAGE_KEY, JSON.stringify(result));
  window.dispatchEvent(new Event("vereinsglueck-orders"));
}
