import type { Listing } from "../features/listings/types";
const imgs = [
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
];
export const fallbackListings: Listing[] = Array.from(
  { length: 50 },
  (_, i) => ({
    id: i + 1,
    title:
      [
        "Modern Kigali Apartment",
        "Lake View Villa",
        "Cozy Mountain Cabin",
        "City Studio",
      ][i % 4] + ` ${i + 1}`,
    description:
      "Comfortable stay with WiFi, parking, kitchen and friendly host support.",
    location: ["Kigali", "Musanze", "Rubavu", "Huye"][i % 4],
    price: [45, 95, 180, 340][i % 4],
    rating: 4.5 + (i % 45) / 100,
    superhost: i % 3 === 0,
    available: i % 5 !== 0,
    availableFrom: new Date(2026, i % 12, (i % 25) + 1).toISOString(),
    img: imgs[i % 4],
    category: ["city", "countryside", "mountain", "beach"][
      i % 4
    ] as Listing["category"],
    type: ["APARTMENT", "HOUSE", "CABIN", "VILLA"][i % 4] as Listing["type"],
    guests: (i % 6) + 1,
    amenities: ["wifi", "parking", "kitchen"],
  }),
);
