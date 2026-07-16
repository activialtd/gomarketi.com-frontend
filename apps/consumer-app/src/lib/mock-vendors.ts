/**
 * Vendors near the user, Niva "activities" style — each card carries a
 * category chip and a recent-activity line.
 * TODO(backend): GET /vendors/nearby?lat&lng
 */
export type Vendor = {
  id: string;
  name: string;
  category: string;
  chipBg: string;   // soft chip fill
  chipText: string; // chip label color
  activity: string; // most recent activity line
  rating: number;
  eta: string;
};

export const VENDORS: Vendor[] = [
  {
    id: "v1",
    name: "Green Grocer",
    category: "GROCERIES",
    chipBg: "#E1F0E6",
    chipText: "#1B7A44",
    activity: "3 items · arriving 4:20 PM",
    rating: 4.8,
    eta: "15–25 min",
  },
  {
    id: "v2",
    name: "CareRx Pharmacy",
    category: "PHARMACY",
    chipBg: "#E7EFF8",
    chipText: "#2F5D8A",
    activity: "Refill ready for pickup",
    rating: 4.6,
    eta: "10–20 min",
  },
  {
    id: "v3",
    name: "Rise Bakery",
    category: "BAKERY",
    chipBg: "#F6EEDF",
    chipText: "#8A6420",
    activity: "Fresh batch at 5 PM",
    rating: 4.7,
    eta: "20–30 min",
  },
  {
    id: "v4",
    name: "Napoli Kitchen",
    category: "FOOD",
    chipBg: "#F7E8E4",
    chipText: "#A2402B",
    activity: "Popular: Margherita pizza",
    rating: 4.9,
    eta: "25–35 min",
  },
];
