export const APP_NAME = "Pavan's World";
export const HOME_AREA = "Sidedahalli";
export const SERVICE_RADIUS_KM = 10;
export const OWNER_NAME = "Pavan";
export const OWNER_WHATSAPP = process.env.NEXT_PUBLIC_OWNER_WHATSAPP || "919000000000";

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
export const DEMO_MODE = !SUPABASE_URL || !SUPABASE_ANON_KEY;

/** In demo mode, logging in with this number gives admin access. OTP is always 123456. */
export const DEMO_ADMIN_PHONE = "9999999999";
export const DEMO_OTP = "123456";

export const waLink = (phone: string, text?: string) => {
  const p = phone.replace(/\D/g, "");
  const full = p.length === 10 ? "91" + p : p;
  return `https://wa.me/${full}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
};
export const telLink = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

export const SHOP_CATEGORIES = ["Grocery", "Clothing", "Restaurant", "Bakery", "Salon", "Electronics", "Pharmacy", "Fitness", "Home & Hardware", "Other"];
export const HELPER_CATEGORIES = [
  { key: "Plumber", emoji: "🚰" }, { key: "Electrician", emoji: "💡" }, { key: "Carpenter", emoji: "🪚" },
  { key: "Painter", emoji: "🎨" }, { key: "AC & Appliance Repair", emoji: "❄️" }, { key: "House Cleaning", emoji: "🧹" },
  { key: "Cook", emoji: "🍳" }, { key: "Pest Control", emoji: "🐜" }, { key: "Water Can Supply", emoji: "💧" },
  { key: "Tailor", emoji: "🧵" }, { key: "Driver", emoji: "🚗" }, { key: "Gardener", emoji: "🌿" },
];
export const EMERGENCY = [
  { name: "Emergency (all)", phone: "112" }, { name: "Ambulance", phone: "108" }, { name: "Police", phone: "100" },
  { name: "Fire", phone: "101" }, { name: "BESCOM (power)", phone: "1912" }, { name: "BWSSB (water)", phone: "1916" },
  { name: "LPG gas leak", phone: "1906" }, { name: "Women helpline", phone: "1091" },
];
