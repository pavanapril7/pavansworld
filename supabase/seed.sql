-- Pavan's World: SAMPLE DATA for testing.
-- Paste into Supabase -> SQL Editor -> Run. Safe to run more than once.
-- All names and phone numbers are placeholders. Remove with the DELETE block at the bottom before launch.

-- Shops
insert into shops (id, name, category, area, address, phone, whatsapp, distance_km, emoji, about, active) values
  ('s1', 'Annapoorna Fresh Mart', 'Grocery', 'Sidedahalli', 'Near Bus Stop, Hesaraghatta Main Rd', '9000000101', '9000000101', 0.6, '🛒', 'Daily groceries, fresh veggies and dairy. Free home delivery above ₹500.', true),
  ('s2', 'Trendy Threads', 'Clothing', 'Bagalagunte', 'MEI Layout Main Rd', '9000000102', '9000000102', 2.1, '👗', 'Ethnic & casual wear for the whole family.', true),
  ('s3', 'Udupi Ruchi Café', 'Restaurant', 'Nagasandra', 'Opp. Nagasandra Metro', '9000000103', '9000000103', 2.8, '🍛', 'Pure veg South Indian breakfast & meals.', true),
  ('s4', 'Iyengar''s Oven Fresh', 'Bakery', 'Shettihalli', 'Shettihalli Main Rd', '9000000104', '9000000104', 1.4, '🥐', 'Fresh bakes daily. Custom cakes on order.', true),
  ('s5', 'Glow Unisex Salon', 'Salon', 'Chikkasandra', 'Chikkasandra Circle', '9000000105', '9000000105', 1.9, '💇', 'Haircut, facials, bridal packages.', true),
  ('s6', 'Mobile World', 'Electronics', 'T Dasarahalli', 'Tumkur Rd, near 8th Mile', '9000000106', '9000000106', 4.3, '📱', 'Phones, accessories and quick repairs.', true),
  ('s7', 'Sri Sai Medicals', 'Pharmacy', 'Sidedahalli', 'Hesaraghatta Main Rd', '9000000107', '9000000107', 0.4, '💊', 'Medicines, health products. Open till 11 PM.', true),
  ('s8', 'Power House Gym', 'Fitness', 'Abbigere', 'Abbigere Main Rd', '9000000108', '9000000108', 3.2, '🏋️', 'Gym with trainer support. Ladies batch available.', true),
  ('s9', 'Balaji Hardware & Paints', 'Home & Hardware', 'Chikkabanavara', 'Station Rd', '9000000109', '9000000109', 5.6, '🔧', 'Hardware, sanitary, paints and tools.', true)
on conflict (id) do nothing;

-- Deals (one is "pending" so you can test approval in Admin)
insert into deals (id, shop_id, shop_name, shop_phone, area, title, description, discount_label, code, category, valid_till, status) values
  ('d1', 's1', 'Annapoorna Fresh Mart', null, 'Sidedahalli', '10% off on monthly groceries', 'Valid on bills above ₹1,500. Show code at billing.', '10% OFF', 'PWORLD10', 'Grocery', current_date + 20, 'approved'),
  ('d2', 's2', 'Trendy Threads', null, 'Bagalagunte', 'Festive sale – Buy 2 Get 1', 'On all kurtis and shirts.', 'B2G1', 'PWFEST', 'Clothing', current_date + 12, 'approved'),
  ('d3', 's3', 'Udupi Ruchi Café', null, 'Nagasandra', 'Free filter coffee with breakfast', 'Weekdays 7–10 AM.', 'FREE', 'PWCOFFEE', 'Restaurant', current_date + 30, 'approved'),
  ('d4', 's4', 'Iyengar''s Oven Fresh', null, 'Shettihalli', '₹100 off on 1 kg cakes', 'Pre-order 24 hrs in advance.', '₹100 OFF', 'PWCAKE', 'Bakery', current_date + 25, 'approved'),
  ('d5', 's5', 'Glow Unisex Salon', null, 'Chikkasandra', 'First visit 20% off', 'Any service, first-time customers.', '20% OFF', 'PWGLOW', 'Salon', current_date + 15, 'approved'),
  ('d6', 's6', 'Mobile World', null, 'T Dasarahalli', 'Free tempered glass with any cover', null, 'FREE', 'PWMOBILE', 'Electronics', current_date + 10, 'approved'),
  ('d7', 's8', 'Power House Gym', null, 'Abbigere', 'No joining fee this month', 'Save ₹1,000 on admission.', '₹1000 OFF', 'PWFIT', 'Fitness', current_date + 8, 'approved'),
  ('d8', 's7', 'Sri Sai Medicals', null, 'Sidedahalli', '15% off on all medicines', 'Senior citizens, every Sunday.', '15% OFF', 'PWCARE', 'Pharmacy', current_date + 40, 'approved'),
  ('d9', null, 'Green Leaf Organics', '9000000110', 'Nagasandra', 'Organic veggie box ₹299/week', 'Submitted by vendor — waiting for your approval.', '₹299', null, 'Grocery', current_date + 30, 'pending')
on conflict (id) do nothing;

-- Household helpers
insert into helpers (id, name, category, phone, whatsapp, area, experience_years, rate_note, verified, languages, about, active) values
  ('h1', 'Ramesh K', 'Plumber', '9000000201', '9000000201', 'Sidedahalli', 12, 'Visit ₹200', true, 'Kannada, Hindi', 'Leak fixing, motor & tank fitting, bathroom work.', true),
  ('h2', 'Manjunath', 'Plumber', '9000000202', null, 'Bagalagunte', 6, 'Visit ₹150', false, 'Kannada', null, true),
  ('h3', 'Suresh Electricals', 'Electrician', '9000000203', '9000000203', 'Shettihalli', 15, 'Visit ₹250', true, 'Kannada, Tamil, English', 'Wiring, inverter, fan & light fitting.', true),
  ('h4', 'Imran', 'Electrician', '9000000204', '9000000204', 'Nagasandra', 8, null, true, 'Hindi, Kannada, Urdu', null, true),
  ('h5', 'Venkatesh Wood Works', 'Carpenter', '9000000205', '9000000205', 'Chikkasandra', 20, 'Quote after visit', true, 'Kannada, Telugu', 'Modular kitchen, wardrobes, door repairs.', true),
  ('h6', 'Raju Painter', 'Painter', '9000000206', null, 'Abbigere', 10, '₹14/sq ft', false, 'Kannada', null, true),
  ('h7', 'CoolCare Services', 'AC & Appliance Repair', '9000000207', '9000000207', 'T Dasarahalli', 7, 'Service ₹499', true, 'Kannada, English', 'AC, fridge, washing machine repair.', true),
  ('h8', 'Lakshmi', 'House Cleaning', '9000000208', null, 'Sidedahalli', 5, 'Deep clean from ₹1,500', true, 'Kannada', null, true),
  ('h9', 'Shanthamma', 'Cook', '9000000209', null, 'Sidedahalli', 9, '₹4,000/month (1 time)', true, 'Kannada', 'South Indian home food, veg.', true),
  ('h10', 'SafeHome Pest Control', 'Pest Control', '9000000210', '9000000210', 'Jalahalli', 6, '2BHK ₹1,200', false, 'Kannada, English', null, true),
  ('h11', 'Ganga Water Supply', 'Water Can Supply', '9000000211', '9000000211', 'Sidedahalli', null, '20L can ₹40', true, 'Kannada', null, true),
  ('h12', 'Asha Tailors', 'Tailor', '9000000212', null, 'Bagalagunte', 14, 'Blouse ₹350', true, 'Kannada, Hindi', null, true)
on conflict (id) do nothing;

-- Reviews
insert into reviews (id, helper_id, user_id, user_name, rating, comment) values
  ('r1', 'h1', 'x1', 'Kavya', 5, 'Came in 30 mins, fixed the leak quickly.'),
  ('r2', 'h1', 'x2', 'Prakash', 4, 'Good work, fair price.'),
  ('r3', 'h3', 'x3', 'Deepa', 5, 'Very professional.'),
  ('r4', 'h5', 'x4', 'Arjun', 5, 'Wardrobe looks great.'),
  ('r5', 'h7', 'x5', 'Meena', 4, null),
  ('r6', 'h8', 'x6', 'Ravi', 5, 'Spotless cleaning!')
on conflict (id) do nothing;

-- Startup, franchise and content ideas
insert into ideas (id, kind, title, category, summary, budget_min, budget_max, space, monthly_earning, difficulty, steps, tags) values
  ('i1', 'startup', 'Home Tiffin Service', 'Food', 'Healthy home-cooked lunch boxes for office goers and students nearby.', 20000, 60000, 'Home kitchen', '₹25k–₹70k', 'Easy', array['Get FSSAI basic registration', 'Start with 10 subscribers from your apartment/street', 'Fix a weekly menu & price', 'Use WhatsApp for daily orders', 'Add delivery partner when >30 boxes'], array['food', 'home-based']),
  ('i2', 'startup', 'Kids Activity & Tuition Centre', 'Education', 'After-school tuition, abacus, drawing and spoken English for kids.', 50000, 200000, '200–400 sq ft', '₹40k–₹1L', 'Medium', array['Pick 2–3 subjects you or a partner can teach', 'Rent a small room or use home', 'Run a free demo week', 'Collect monthly fees upfront'], array['education']),
  ('i3', 'startup', 'Laundry & Ironing Pickup', 'Services', 'Doorstep pickup/drop ironing and wash service for apartments.', 30000, 150000, 'Small shop / garage', '₹30k–₹80k', 'Easy', array['Tie up with 2–3 ironing vendors', 'Start with one apartment complex', 'Fixed per-piece pricing', 'Weekly subscription plans'], array['services']),
  ('i4', 'startup', 'Pet Grooming at Home', 'Services', 'Bath, grooming and nail trimming for pets at the owner''s home.', 40000, 120000, 'Mobile (two-wheeler)', '₹30k–₹90k', 'Medium', null, array['pets']),
  ('f1', 'franchise', 'Tea & Snacks Café Kiosk', 'Food & Beverage', 'Tea, coffee and snacks kiosk under a known tea-café brand. High footfall near metro / bus stops.', 300000, 800000, '100–200 sq ft', '₹50k–₹1.5L', 'Medium', array['Shortlist 3 tea-café franchise brands', 'Visit 2 existing outlets & talk to owners', 'Check location footfall for 1 week', 'Compare franchise fee, royalty & margins', 'Sign only after reading agreement with a lawyer'], array['franchise', 'food']),
  ('f2', 'franchise', 'Cloud Kitchen Brand', 'Food & Beverage', 'Delivery-only kitchen for an established biryani/meals brand on Swiggy & Zomato.', 500000, 1500000, '300–500 sq ft', '₹80k–₹2.5L', 'Hard', null, array['franchise', 'food']),
  ('f3', 'franchise', 'Dry Cleaning Franchise', 'Services', 'Branded laundry & dry-clean store with central processing.', 400000, 1200000, '200–300 sq ft', '₹60k–₹1.5L', 'Medium', null, array['franchise', 'services']),
  ('f4', 'franchise', 'Kids Abacus / Brain Development', 'Education', 'Franchise of an abacus & mental-maths program. Training and material provided.', 75000, 250000, 'Home / 200 sq ft', '₹30k–₹1L', 'Easy', null, array['franchise', 'education']),
  ('f5', 'franchise', 'Organic & Millet Store', 'Retail', 'Healthy food store selling millets, cold-pressed oils and organic produce.', 600000, 1500000, '300–600 sq ft', '₹50k–₹1.2L', 'Medium', null, array['franchise', 'retail', 'health']),
  ('c1', 'content', 'Hidden food spots of North Bangalore', 'Food', 'Weekly reel series reviewing small eateries within 5 km — with prices.', null, null, null, null, 'Easy', array['Shoot 3 short clips per spot', 'Mention price & location on screen', 'Tag the shop — they''ll reshare', 'Post same time every week'], array['reels', 'local']),
  ('c2', 'content', '10-minute morning yoga for desk workers', 'Fitness', 'Short follow-along yoga videos for neck, back and eye strain.', null, null, null, null, 'Easy', null, array['yoga', 'youtube']),
  ('c3', 'content', 'Meet the makers of our area', 'Community', 'Interview local vendors, artisans and helpers — their story in 60 seconds.', null, null, null, null, 'Medium', null, array['stories', 'local']),
  ('c4', 'content', 'Kannada learning for newcomers', 'Education', 'Daily useful Kannada phrases for auto, shop and neighbours.', null, null, null, null, 'Easy', null, array['language', 'reels']),
  ('c5', 'content', 'Budget home makeover under ₹5,000', 'Lifestyle', 'Before/after videos using local hardware and décor shops.', null, null, null, null, 'Medium', null, array['home', 'diy'])
on conflict (id) do nothing;

-- Collab board posts
insert into collab_posts (id, user_id, user_name, type, title, body, skills, contact, status, created_at) values
  ('p1', 'x7', 'Sneha', 'looking', 'Need a video editor for food reels', 'I post 3 reels/week on local food. Looking for someone to edit on a per-reel basis.', 'Reels editing, CapCut', '9000000301', 'open', now() - interval '24 hours'),
  ('p2', 'x8', 'Kiran', 'offering', 'Photographer available on weekends', 'Can shoot product photos for local shops and portfolio shoots. Own camera & lights.', 'Photography, Lightroom', '9000000302', 'open', now() - interval '48 hours'),
  ('p3', 'x9', 'Ananya', 'looking', 'Collab partner for fitness YouTube channel', 'Starting a Kannada home-workout channel. Looking for a co-host.', 'On camera, fitness', '9000000303', 'open', now() - interval '72 hours')
on conflict (id) do nothing;

-- ============================================================
-- REMOVE ALL SAMPLE DATA (run this before launch; keeps anything you added yourself)
-- ============================================================
-- delete from reviews      where id in ('r1', 'r2', 'r3', 'r4', 'r5', 'r6');
-- delete from deals        where id in ('d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9');
-- delete from collab_posts where id in ('p1', 'p2', 'p3');
-- delete from helpers      where id in ('h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7', 'h8', 'h9', 'h10', 'h11', 'h12');
-- delete from shops        where id in ('s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9');
-- delete from ideas        where id in ('i1', 'i2', 'i3', 'i4', 'f1', 'f2', 'f3', 'f4', 'f5', 'c1', 'c2', 'c3', 'c4', 'c5');
