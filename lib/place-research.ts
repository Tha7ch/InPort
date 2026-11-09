import type { OperatingHours, Restaurant } from "@/types";
import type { DrinkProfile } from "./drink-profile";
import { getVenueStatus, type VenueStatus } from "./venue";

export interface PlaceResearch {
  checkedAt: string;
  sourceUrl: string;
  additionalSources?: Array<{ label: string; url: string }>;
  note: string;
  drinksMenu: "confirmed" | "unconfirmed";
  profile?: DrinkProfile;
  priceNotes?: Partial<Record<"beer" | "wine" | "cocktails", string>>;
  drinkHours?: OperatingHours;
  hoursSourceUrl?: string;
  hoursNote?: string;
  hoursUnconfirmed?: string;
  offers?: Array<{ description: string; sourceUrl: string }>;
  closure?: { label: string; until: string };
}
const CHECKED = "2026-11-09";
const daily = (open: string, close: string): OperatingHours => Object.fromEntries(
  ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map(day => [day, { open, close }])
);
const profile = (sourceUrl: string, coverage: string, prices: Pick<DrinkProfile, "beer" | "wine" | "cocktails">): DrinkProfile => ({ ...prices, sourceUrl, checkedAt: CHECKED, coverage });
const entries: Array<{ names: string[]; data: PlaceResearch }> = [
  { names: ["Michael's Harborside", "Michaels Harborside"], data: {
    checkedAt: CHECKED, sourceUrl: "https://michaelsharborside.com/wp-content/uploads/2026/10/MHS-52745_fall_drink_menu_CR-0.pdf", drinksMenu: "confirmed",
    note: "October 2026 drink menu. Seasonal beer is unpriced.",
    offers: [{ description: "10 food items for $10 each: Mon–Fri 3–6 PM and after 8 PM in Main Floor Bar and Second Floor Pub; all day Sun/Mon/Tue in Second Floor Pub. Dine-in through April 1, 2027.", sourceUrl: "https://michaelsharborside.com/wp-content/uploads/2026/10/MHS-52810-10-for-10-Menu_Flyer_CR-2.pdf" }],
    profile: profile("https://michaelsharborside.com/wp-content/uploads/2026/10/MHS-52745_fall_drink_menu_CR-0.pdf", "October 2026 menu; seasonal beer unpriced. Wine is by the glass.", { beer: { min: 6, max: 12 }, wine: { min: 10, max: 16 }, cocktails: { min: 13, max: 19 } }),
  } },
  { names: ["Smoke on the Water", "Smoke on Water", "Smoke on the Water Salisbury"], data: {
    checkedAt: CHECKED, sourceUrl: "https://www.lovethatsmoke.com/on-the-menu", drinksMenu: "confirmed",
    note: "Salisbury restaurant; May 2026 menus. Beer includes 16 oz and 21 oz drafts.",
    profile: profile("https://www.lovethatsmoke.com/on-the-menu", "May 2026 menus for Salisbury; beer includes 16 oz and 21 oz drafts. Wine is by the glass.", { beer: { min: 6, max: 11 }, wine: { min: 13, max: 13 }, cocktails: { min: 13, max: 16 } }),
  } },
  { names: ["Port Vida", "Port Vida A Mexican Cantina"], data: {
    checkedAt: CHECKED, sourceUrl: "https://portvidaamexicancantina.com/newburyport-port-vida-a-mexican-cantina-drink-menu", drinksMenu: "confirmed",
    priceNotes: { wine: "Serving unclear" }, note: "Regular drink menu. Wines are listed at $10 but the serving size is not stated; not treated as a glass price.",
    profile: profile("https://portvidaamexicancantina.com/newburyport-port-vida-a-mexican-cantina-drink-menu", "Regular menu; seasonal online drinks and flavor additions excluded. Wine serving size is not stated.", { beer: { min: 5, max: 7 }, cocktails: { min: 10, max: 14 } }),
  } },
  { names: ["The Goat", "Goat"], data: {
    checkedAt: CHECKED, sourceUrl: "https://goatbarnation.com/menus/cocktails/", drinksMenu: "confirmed",
    additionalSources: [{ label: "Wine menu", url: "https://goatbarnation.com/menus/wine/" }, { label: "Brunch drinks", url: "https://goatbarnation.com/menus/brunch-drinks/" }], note: "Published signature cocktails $16–18; brunch Bloody Mary starts at $12. Shared wine list has single prices $10–14 without bottle sizes. Food page lists a conflicting frappe price; beer prices are not confirmed.",
    profile: profile("https://goatbarnation.com/menus/cocktails/", "Shared Goat menu: signature cocktails $16–18; brunch Bloody Mary starts at $12 before upgrades. Frappe is $18 here but $16 on the food page. Wine glass serving is inferred from the shared list's single prices; bottle sizes are not stated.", { wine: { min: 10, max: 14 }, cocktails: { min: 12, max: 18 } }),
    drinkHours: { ...daily("11:00", "01:00"), saturday: { open: "08:00", close: "01:00" }, sunday: { open: "08:00", close: "01:00" } },
    offers: [{ description: "Mon/Tue two-for-one burgers; Wednesday 25-cent wings; weekdays 4–7 PM half-price bacon buckets. Dine-in and beverage purchase required; no combining offers. Burger/wing time window is not stated.", sourceUrl: "https://goatbarnation.com/newburyport/specials/" }],
    hoursSourceUrl: "https://goatbarnation.com/newburyport/", hoursNote: "Published Newburyport opening hours; kitchen may finish earlier.",
  } },
  { names: ["Park Lunch"], data: {
    checkedAt: CHECKED, sourceUrl: "https://parklunch.com/menu.html", drinksMenu: "confirmed",
    note: "Online menu does not list drink prices.",
    drinkHours: daily("11:00", "01:00"), hoursSourceUrl: "https://parklunch.com/hours.html", hoursNote: "The official hours page says the bar closes every night at 1 AM. Kitchen hours end earlier.",
  } },
  { names: ["Anchor Stone Deck Pizza", "Anchor Stone Deck Pizzeria"], data: {
    checkedAt: CHECKED, sourceUrl: "https://anchorpizzeria.com/", drinksMenu: "confirmed", note: "Beer and wine are advertised, but their prices are absent from the linked menu.",
  } },
  { names: ["Metzy's", "Metzys", "Metzy's Cantina"], data: {
    checkedAt: CHECKED, sourceUrl: "https://metzys.com/dine-in/", drinksMenu: "confirmed", note: "Full bar confirmed. The current food PDF and online ordering list do not publish alcohol prices. Published closing times conflict.",
  } },
  { names: ["The Grog", "Grog"], data: { checkedAt: CHECKED, sourceUrl: "https://www.thegrog.com/", drinksMenu: "confirmed", note: "October 2026 drink/dessert PDF; beer prices are not listed. Wine glasses exclude sparkling splits and bottles.", profile: profile("https://www.thegrog.com/wp-content/uploads/2026/10/Drink-and-Dessert-Menu_The-Grog.pdf", "October 2026 PDF; beer not listed. Wine glasses only, excluding sparkling splits and bottles.", { wine: { min: 10, max: 16 }, cocktails: { min: 12, max: 16 } }) } },
  { names: ["Tuscan Sea Grill", "Tuscan Sea Grill & Bar", "Tuscan Sea Grill and Bar"], data: { checkedAt: CHECKED, sourceUrl: "https://www.tuscanseagrillbar.com/", drinksMenu: "confirmed", note: "Current linked beverage PDF has a 2025 filename. Excludes sake, alcohol-free drinks, seltzer, cider, pitchers and the separate bottle list.", profile: profile("https://images.getbento.com/accounts/2d008110fd08c7e884f9fa5184af7b80/media/5HGHPq0lRmmE2KNq5oL3_TuscanSeaGrill_Main_Menu_11x17_2025_BEV.pdf", "Current linked PDF has a 2025 filename. Individual beer and cocktails; wine single servings inferred from this list versus the separate bottle list. Excludes pitchers and sake.", { beer: { min: 7, max: 14 }, wine: { min: 12, max: 26 }, cocktails: { min: 14, max: 17 } }) } },
  { names: ["The Thirsty Whale", "Thirsty Whale"], data: { checkedAt: CHECKED, sourceUrl: "https://www.facebook.com/Thethirstywhalemarketsquare/", drinksMenu: "confirmed", note: "Pub confirmed at 24 Market Square. Linked website has no drink prices and is marked a design concept; it is not reliable price evidence.", hoursUnconfirmed: "Published hours conflict with the weekday appetizer offer; closing time needs confirmation.", offers: [{ description: "Half-price appetizers Monday–Wednesday 1–3 PM, advertised in the September 28 post. No expiry stated.", sourceUrl: "https://www.facebook.com/Thethirstywhalemarketsquare/" }] } },
  { names: ["The Poynt", "Poynt"], data: { checkedAt: CHECKED, sourceUrl: "https://poyntnewburyport.com/menus", drinksMenu: "confirmed", note: "Priced cans/bottles and wine glasses; draft beer and market-price Sancerre excluded." } },
  { names: ["The Paddle Inn", "Paddle Inn"], data: { checkedAt: CHECKED, sourceUrl: "https://www.paddleinnsurf.com/paddle-out", drinksMenu: "confirmed", note: "Current dinner and brunch images. Wine is market price; rotating taps and one cocktail are unpriced.", offers: [{ description: "$5 Taco Tuesday on the linked dinner and brunch menus; time window not stated.", sourceUrl: "https://www.paddleinnsurf.com/paddle-out" }], priceNotes: { wine: "Market price" }, profile: profile("https://www.paddleinnsurf.com/paddle-out", "Dinner and brunch menus; standard beers only. Excludes the 40 oz beer, unpriced taps, market-price cocktails and shared drinks. Wine is market price.", { beer: { min: 5, max: 10 }, cocktails: { min: 12, max: 16 } }), drinkHours: { monday: { open: "17:00", close: "00:00" }, tuesday: { open: "17:00", close: "00:00" }, wednesday: { open: "17:00", close: "00:00" }, thursday: { open: "17:00", close: "00:00" }, friday: { open: "12:00", close: "01:00" }, saturday: { open: "12:00", close: "01:00" } }, hoursSourceUrl: "https://www.paddleinnsurf.com/", hoursNote: "Published bar hours Monday through Saturday. Sunday bar closing is not specified by the split dining schedule." } },
  { names: ["The Deck", "The Deck Salisbury"], data: { checkedAt: CHECKED, sourceUrl: "https://thedecksalisbury.com/", drinksMenu: "confirmed", note: "Official homepage says closed for the 2026 season; next summer's exact opening date is not published.", closure: { label: "Closed for the season · Returns next summer", until: "2027-01-01" } } },
  { names: ["Sunset Club", "The Sunset Club"], data: { checkedAt: CHECKED, sourceUrl: "https://sunsetclubpi.com/", drinksMenu: "confirmed", note: "Official homepage announces seasonal closure and April 1, 2027 reopening.", closure: { label: "Closed for the season · Reopens April 1, 2027", until: "2027-04-01" } } },
  { names: ["Dunkin", "Dunkin Donuts"], data: { checkedAt: CHECKED, sourceUrl: "https://news.dunkindonuts.com/news/dunkin-spiked", drinksMenu: "unconfirmed", note: "Dunkin states its alcoholic Spiked products are not sold at Dunkin restaurants." } },
  { names: ["Abe's Bagels", "Abraham's Bagels", "Abrahams Bagels"], data: { checkedAt: CHECKED, sourceUrl: "https://www.abrahamsbagels.com/", drinksMenu: "unconfirmed", note: "Bagel and bakery menu; no confirmed alcoholic-drink menu available online." } },
  { names: ["Angie's Food and Diner", "Angie's", "Angies"], data: { checkedAt: CHECKED, sourceUrl: "https://www.angiesfoodnbpt.com/", drinksMenu: "unconfirmed", note: "An older specials PDF mentions mimosas without prices; no current priced alcohol menu found.", offers: [{ description: "10% off first online order and $5 off every $100 spent online. Account required; expiry not stated.", sourceUrl: "https://www.angiesfoodnbpt.com/" }] } },
  { names: ["Morning Buzz Cafe", "Morning Buzz"], data: { checkedAt: CHECKED, sourceUrl: "https://morningbuzzcafe.com/drink-menu", drinksMenu: "unconfirmed", note: "Current online drinks menu is coffee, tea and soft drinks. This cafe is at 37 Friend Street, Amesbury." } },
  { names: ["Stone Crust Pizza", "Stone Crust"], data: { checkedAt: CHECKED, sourceUrl: "https://stonecrustpizza.com/newburyport-stone-crust-drink-menu", drinksMenu: "unconfirmed", note: "The official drinks menu lists soda and water only; alcohol service is not confirmed." } },
  { names: ["Nick's Pizza", "Nicks Pizza"], data: { checkedAt: CHECKED, sourceUrl: "https://nickspizzanewburyport.com/menu/", drinksMenu: "unconfirmed", note: "Linked menu and specials are dated January 2023; no current alcoholic-drink menu found." } },
];

function normalize(name: string) { return name.toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9]+/g, " ").trim(); }
const byName = new Map(entries.flatMap(({ names, data }) => names.map(name => [normalize(name), data] as const)));
export function getPlaceResearch(restaurant: Pick<Restaurant, "name">): PlaceResearch | undefined { return byName.get(normalize(restaurant.name)); }
export function hasConfirmedDrinksMenu(restaurant: Pick<Restaurant, "name" | "drink_profile">): boolean {
  return Boolean(restaurant.drink_profile) || getPlaceResearch(restaurant)?.drinksMenu !== "unconfirmed";
}
export function getPlaceStatus(restaurant: Restaurant, mode: "food" | "drinks", now: Date): VenueStatus {
  const research = getPlaceResearch(restaurant);
  if (research?.closure) {
    const date = new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
    if (date < research.closure.until) return { state: "closed", label: research.closure.label, closingSoon: false };
    return { state: "unknown", label: "Seasonal hours need confirmation", closingSoon: false };
  }
  if (mode === "drinks" && research?.hoursUnconfirmed) return { state: "unknown", label: "Closing time needs confirmation", closingSoon: false };
  return getVenueStatus(mode === "drinks" && research?.drinkHours ? research.drinkHours : restaurant.operating_hours, now);
}
