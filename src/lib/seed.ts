// SAMPLE DATA for demo mode. Names and phone numbers are placeholders — replace with real, verified entries.
import type { Shop, Deal, Helper, Review, Idea, CollabPost } from "./types";

const inDays = (n: number) => {
  const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10);
};
const ph = (n: number) => `90000${String(n).padStart(5, "0")}`;

export const seedShops: Shop[] = [
  { id: "s1", name: "Annapoorna Fresh Mart", category: "Grocery", area: "Sidedahalli", address: "Near Bus Stop, Hesaraghatta Main Rd", phone: ph(101), whatsapp: ph(101), distance_km: 0.6, emoji: "🛒", about: "Daily groceries, fresh veggies and dairy. Free home delivery above ₹500.", active: true },
  { id: "s2", name: "Trendy Threads", category: "Clothing", area: "Bagalagunte", address: "MEI Layout Main Rd", phone: ph(102), whatsapp: ph(102), distance_km: 2.1, emoji: "👗", about: "Ethnic & casual wear for the whole family.", active: true },
  { id: "s3", name: "Udupi Ruchi Café", category: "Restaurant", area: "Nagasandra", address: "Opp. Nagasandra Metro", phone: ph(103), whatsapp: ph(103), distance_km: 2.8, emoji: "🍛", about: "Pure veg South Indian breakfast & meals.", active: true },
  { id: "s4", name: "Iyengar's Oven Fresh", category: "Bakery", area: "Shettihalli", address: "Shettihalli Main Rd", phone: ph(104), whatsapp: ph(104), distance_km: 1.4, emoji: "🥐", about: "Fresh bakes daily. Custom cakes on order.", active: true },
  { id: "s5", name: "Glow Unisex Salon", category: "Salon", area: "Chikkasandra", address: "Chikkasandra Circle", phone: ph(105), whatsapp: ph(105), distance_km: 1.9, emoji: "💇", about: "Haircut, facials, bridal packages.", active: true },
  { id: "s6", name: "Mobile World", category: "Electronics", area: "T Dasarahalli", address: "Tumkur Rd, near 8th Mile", phone: ph(106), whatsapp: ph(106), distance_km: 4.3, emoji: "📱", about: "Phones, accessories and quick repairs.", active: true },
  { id: "s7", name: "Sri Sai Medicals", category: "Pharmacy", area: "Sidedahalli", address: "Hesaraghatta Main Rd", phone: ph(107), whatsapp: ph(107), distance_km: 0.4, emoji: "💊", about: "Medicines, health products. Open till 11 PM.", active: true },
  { id: "s8", name: "Power House Gym", category: "Fitness", area: "Abbigere", address: "Abbigere Main Rd", phone: ph(108), whatsapp: ph(108), distance_km: 3.2, emoji: "🏋️", about: "Gym with trainer support. Ladies batch available.", active: true },
  { id: "s9", name: "Balaji Hardware & Paints", category: "Home & Hardware", area: "Chikkabanavara", address: "Station Rd", phone: ph(109), whatsapp: ph(109), distance_km: 5.6, emoji: "🔧", about: "Hardware, sanitary, paints and tools.", active: true },
];

export const seedDeals: Deal[] = [
  { id: "d1", shop_id: "s1", shop_name: "Annapoorna Fresh Mart", area: "Sidedahalli", title: "10% off on monthly groceries", description: "Valid on bills above ₹1,500. Show code at billing.", discount_label: "10% OFF", code: "PWORLD10", category: "Grocery", valid_till: inDays(20), status: "approved" },
  { id: "d2", shop_id: "s2", shop_name: "Trendy Threads", area: "Bagalagunte", title: "Festive sale – Buy 2 Get 1", description: "On all kurtis and shirts.", discount_label: "B2G1", code: "PWFEST", category: "Clothing", valid_till: inDays(12), status: "approved" },
  { id: "d3", shop_id: "s3", shop_name: "Udupi Ruchi Café", area: "Nagasandra", title: "Free filter coffee with breakfast", description: "Weekdays 7–10 AM.", discount_label: "FREE", code: "PWCOFFEE", category: "Restaurant", valid_till: inDays(30), status: "approved" },
  { id: "d4", shop_id: "s4", shop_name: "Iyengar's Oven Fresh", area: "Shettihalli", title: "₹100 off on 1 kg cakes", description: "Pre-order 24 hrs in advance.", discount_label: "₹100 OFF", code: "PWCAKE", category: "Bakery", valid_till: inDays(25), status: "approved" },
  { id: "d5", shop_id: "s5", shop_name: "Glow Unisex Salon", area: "Chikkasandra", title: "First visit 20% off", description: "Any service, first-time customers.", discount_label: "20% OFF", code: "PWGLOW", category: "Salon", valid_till: inDays(15), status: "approved" },
  { id: "d6", shop_id: "s6", shop_name: "Mobile World", area: "T Dasarahalli", title: "Free tempered glass with any cover", discount_label: "FREE", code: "PWMOBILE", category: "Electronics", valid_till: inDays(10), status: "approved" },
  { id: "d7", shop_id: "s8", shop_name: "Power House Gym", area: "Abbigere", title: "No joining fee this month", description: "Save ₹1,000 on admission.", discount_label: "₹1000 OFF", code: "PWFIT", category: "Fitness", valid_till: inDays(8), status: "approved" },
  { id: "d8", shop_id: "s7", shop_name: "Sri Sai Medicals", area: "Sidedahalli", title: "15% off on all medicines", description: "Senior citizens, every Sunday.", discount_label: "15% OFF", code: "PWCARE", category: "Pharmacy", valid_till: inDays(40), status: "approved" },
  { id: "d9", shop_id: null, shop_name: "Green Leaf Organics", shop_phone: ph(110), area: "Nagasandra", title: "Organic veggie box ₹299/week", description: "Submitted by vendor — waiting for your approval.", discount_label: "₹299", category: "Grocery", valid_till: inDays(30), status: "pending" },
];

export const seedHelpers: Helper[] = [
  { id: "h1", name: "Ramesh K", category: "Plumber", phone: ph(201), whatsapp: ph(201), area: "Sidedahalli", experience_years: 12, rate_note: "Visit ₹200", verified: true, languages: "Kannada, Hindi", about: "Leak fixing, motor & tank fitting, bathroom work.", active: true },
  { id: "h2", name: "Manjunath", category: "Plumber", phone: ph(202), area: "Bagalagunte", experience_years: 6, rate_note: "Visit ₹150", verified: false, languages: "Kannada", active: true },
  { id: "h3", name: "Suresh Electricals", category: "Electrician", phone: ph(203), whatsapp: ph(203), area: "Shettihalli", experience_years: 15, rate_note: "Visit ₹250", verified: true, languages: "Kannada, Tamil, English", about: "Wiring, inverter, fan & light fitting.", active: true },
  { id: "h4", name: "Imran", category: "Electrician", phone: ph(204), whatsapp: ph(204), area: "Nagasandra", experience_years: 8, verified: true, languages: "Hindi, Kannada, Urdu", active: true },
  { id: "h5", name: "Venkatesh Wood Works", category: "Carpenter", phone: ph(205), whatsapp: ph(205), area: "Chikkasandra", experience_years: 20, rate_note: "Quote after visit", verified: true, languages: "Kannada, Telugu", about: "Modular kitchen, wardrobes, door repairs.", active: true },
  { id: "h6", name: "Raju Painter", category: "Painter", phone: ph(206), area: "Abbigere", experience_years: 10, rate_note: "₹14/sq ft", verified: false, languages: "Kannada", active: true },
  { id: "h7", name: "CoolCare Services", category: "AC & Appliance Repair", phone: ph(207), whatsapp: ph(207), area: "T Dasarahalli", experience_years: 7, rate_note: "Service ₹499", verified: true, languages: "Kannada, English", about: "AC, fridge, washing machine repair.", active: true },
  { id: "h8", name: "Lakshmi", category: "House Cleaning", phone: ph(208), area: "Sidedahalli", experience_years: 5, rate_note: "Deep clean from ₹1,500", verified: true, languages: "Kannada", active: true },
  { id: "h9", name: "Shanthamma", category: "Cook", phone: ph(209), area: "Sidedahalli", experience_years: 9, rate_note: "₹4,000/month (1 time)", verified: true, languages: "Kannada", about: "South Indian home food, veg.", active: true },
  { id: "h10", name: "SafeHome Pest Control", category: "Pest Control", phone: ph(210), whatsapp: ph(210), area: "Jalahalli", experience_years: 6, rate_note: "2BHK ₹1,200", verified: false, languages: "Kannada, English", active: true },
  { id: "h11", name: "Ganga Water Supply", category: "Water Can Supply", phone: ph(211), whatsapp: ph(211), area: "Sidedahalli", rate_note: "20L can ₹40", verified: true, languages: "Kannada", active: true },
  { id: "h12", name: "Asha Tailors", category: "Tailor", phone: ph(212), area: "Bagalagunte", experience_years: 14, rate_note: "Blouse ₹350", verified: true, languages: "Kannada, Hindi", active: true },
];

export const seedReviews: Review[] = [
  { id: "r1", helper_id: "h1", user_id: "x1", user_name: "Kavya", rating: 5, comment: "Came in 30 mins, fixed the leak quickly." },
  { id: "r2", helper_id: "h1", user_id: "x2", user_name: "Prakash", rating: 4, comment: "Good work, fair price." },
  { id: "r3", helper_id: "h3", user_id: "x3", user_name: "Deepa", rating: 5, comment: "Very professional." },
  { id: "r4", helper_id: "h5", user_id: "x4", user_name: "Arjun", rating: 5, comment: "Wardrobe looks great." },
  { id: "r5", helper_id: "h7", user_id: "x5", user_name: "Meena", rating: 4 },
  { id: "r6", helper_id: "h8", user_id: "x6", user_name: "Ravi", rating: 5, comment: "Spotless cleaning!" },
];

export const seedIdeas: Idea[] = [
  { id: "i1", kind: "startup", title: "Home Tiffin Service", category: "Food", summary: "Healthy home-cooked lunch boxes for office goers and students nearby.", budget_min: 20000, budget_max: 60000, space: "Home kitchen", monthly_earning: "₹25k–₹70k", difficulty: "Easy", steps: ["Get FSSAI basic registration", "Start with 10 subscribers from your apartment/street", "Fix a weekly menu & price", "Use WhatsApp for daily orders", "Add delivery partner when >30 boxes"], tags: ["food", "home-based"] },
  { id: "i2", kind: "startup", title: "Kids Activity & Tuition Centre", category: "Education", summary: "After-school tuition, abacus, drawing and spoken English for kids.", budget_min: 50000, budget_max: 200000, space: "200–400 sq ft", monthly_earning: "₹40k–₹1L", difficulty: "Medium", steps: ["Pick 2–3 subjects you or a partner can teach", "Rent a small room or use home", "Run a free demo week", "Collect monthly fees upfront"], tags: ["education"] },
  { id: "i3", kind: "startup", title: "Laundry & Ironing Pickup", category: "Services", summary: "Doorstep pickup/drop ironing and wash service for apartments.", budget_min: 30000, budget_max: 150000, space: "Small shop / garage", monthly_earning: "₹30k–₹80k", difficulty: "Easy", steps: ["Tie up with 2–3 ironing vendors", "Start with one apartment complex", "Fixed per-piece pricing", "Weekly subscription plans"], tags: ["services"] },
  { id: "i4", kind: "startup", title: "Pet Grooming at Home", category: "Services", summary: "Bath, grooming and nail trimming for pets at the owner's home.", budget_min: 40000, budget_max: 120000, space: "Mobile (two-wheeler)", monthly_earning: "₹30k–₹90k", difficulty: "Medium", tags: ["pets"] },
  { id: "f1", kind: "franchise", title: "Tea & Snacks Café Kiosk", category: "Food & Beverage", summary: "Tea, coffee and snacks kiosk under a known tea-café brand. High footfall near metro / bus stops.", budget_min: 300000, budget_max: 800000, space: "100–200 sq ft", monthly_earning: "₹50k–₹1.5L", difficulty: "Medium", steps: ["Shortlist 3 tea-café franchise brands", "Visit 2 existing outlets & talk to owners", "Check location footfall for 1 week", "Compare franchise fee, royalty & margins", "Sign only after reading agreement with a lawyer"], tags: ["franchise", "food"] },
  { id: "f2", kind: "franchise", title: "Cloud Kitchen Brand", category: "Food & Beverage", summary: "Delivery-only kitchen for an established biryani/meals brand on Swiggy & Zomato.", budget_min: 500000, budget_max: 1500000, space: "300–500 sq ft", monthly_earning: "₹80k–₹2.5L", difficulty: "Hard", tags: ["franchise", "food"] },
  { id: "f3", kind: "franchise", title: "Dry Cleaning Franchise", category: "Services", summary: "Branded laundry & dry-clean store with central processing.", budget_min: 400000, budget_max: 1200000, space: "200–300 sq ft", monthly_earning: "₹60k–₹1.5L", difficulty: "Medium", tags: ["franchise", "services"] },
  { id: "f4", kind: "franchise", title: "Kids Abacus / Brain Development", category: "Education", summary: "Franchise of an abacus & mental-maths program. Training and material provided.", budget_min: 75000, budget_max: 250000, space: "Home / 200 sq ft", monthly_earning: "₹30k–₹1L", difficulty: "Easy", tags: ["franchise", "education"] },
  { id: "f5", kind: "franchise", title: "Organic & Millet Store", category: "Retail", summary: "Healthy food store selling millets, cold-pressed oils and organic produce.", budget_min: 600000, budget_max: 1500000, space: "300–600 sq ft", monthly_earning: "₹50k–₹1.2L", difficulty: "Medium", tags: ["franchise", "retail", "health"] },
  { id: "c1", kind: "content", title: "Hidden food spots of North Bangalore", category: "Food", summary: "Weekly reel series reviewing small eateries within 5 km — with prices.", difficulty: "Easy", steps: ["Shoot 3 short clips per spot", "Mention price & location on screen", "Tag the shop — they'll reshare", "Post same time every week"], tags: ["reels", "local"] },
  { id: "c2", kind: "content", title: "10-minute morning yoga for desk workers", category: "Fitness", summary: "Short follow-along yoga videos for neck, back and eye strain.", difficulty: "Easy", tags: ["yoga", "youtube"] },
  { id: "c3", kind: "content", title: "Meet the makers of our area", category: "Community", summary: "Interview local vendors, artisans and helpers — their story in 60 seconds.", difficulty: "Medium", tags: ["stories", "local"] },
  { id: "c4", kind: "content", title: "Kannada learning for newcomers", category: "Education", summary: "Daily useful Kannada phrases for auto, shop and neighbours.", difficulty: "Easy", tags: ["language", "reels"] },
  { id: "c5", kind: "content", title: "Budget home makeover under ₹5,000", category: "Lifestyle", summary: "Before/after videos using local hardware and décor shops.", difficulty: "Medium", tags: ["home", "diy"] },
];

export const seedCollab: CollabPost[] = [
  { id: "p1", user_id: "x7", user_name: "Sneha", type: "looking", title: "Need a video editor for food reels", body: "I post 3 reels/week on local food. Looking for someone to edit on a per-reel basis.", skills: "Reels editing, CapCut", contact: ph(301), status: "open", created_at: new Date(Date.now() - 864e5).toISOString() },
  { id: "p2", user_id: "x8", user_name: "Kiran", type: "offering", title: "Photographer available on weekends", body: "Can shoot product photos for local shops and portfolio shoots. Own camera & lights.", skills: "Photography, Lightroom", contact: ph(302), status: "open", created_at: new Date(Date.now() - 2 * 864e5).toISOString() },
  { id: "p3", user_id: "x9", user_name: "Ananya", type: "looking", title: "Collab partner for fitness YouTube channel", body: "Starting a Kannada home-workout channel. Looking for a co-host.", skills: "On camera, fitness", contact: ph(303), status: "open", created_at: new Date(Date.now() - 3 * 864e5).toISOString() },
];
