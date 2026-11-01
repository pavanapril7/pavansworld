import type { FitnessProfile } from "./types";

export type Phase = "warmup" | "main" | "cooldown";
export interface Exercise {
  id: string; name: string; alt?: string; emoji: string; phase: Phase; kind: "Yoga" | "Workout" | "Breathing";
  minutes: number; level: 1 | 2 | 3; goals: string[]; avoid: string[]; benefit: string; steps: string[]; reps?: string;
}

export const GOALS = ["Weight loss", "Flexibility", "Strength", "Stress relief", "Back & posture", "General fitness"];
export const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;
export const CONDITIONS = ["Back pain", "Knee pain", "Neck pain", "High BP", "Diabetes", "Heart condition", "Pregnancy"];
export const MINUTES = [15, 30, 45];

const ALL = GOALS;

export const EXERCISES: Exercise[] = [
  // Warm-ups
  { id: "neck-rolls", name: "Neck & Shoulder Rolls", emoji: "🔄", phase: "warmup", kind: "Workout", minutes: 2, level: 1, goals: ALL, avoid: [], benefit: "Releases stiffness from neck and shoulders.", steps: ["Sit or stand tall", "Slowly roll shoulders back 10 times, then forward 10 times", "Gently tilt head side to side, 5 each side", "Do not force any movement"] },
  { id: "march", name: "Spot Marching", emoji: "🚶", phase: "warmup", kind: "Workout", minutes: 3, level: 1, goals: ALL, avoid: [], benefit: "Raises heart rate gently and warms the body.", steps: ["Stand tall", "March on the spot lifting knees to hip height", "Swing arms naturally", "Keep breathing steady"] },
  { id: "surya-slow", name: "Sun Salutation (slow)", alt: "Surya Namaskar", emoji: "☀️", phase: "warmup", kind: "Yoga", minutes: 5, level: 1, goals: ALL, avoid: ["Pregnancy", "High BP", "Heart condition"], benefit: "Full-body warm-up that links breath and movement.", steps: ["Stand in prayer pose", "Inhale, raise arms up", "Exhale, fold forward", "Step back to plank, lower down", "Inhale into cobra, exhale to downward dog", "Step forward, rise up. Repeat 3–5 rounds slowly"] },
  { id: "cat-cow", name: "Cat–Cow Stretch", alt: "Marjariasana", emoji: "🐈", phase: "warmup", kind: "Yoga", minutes: 3, level: 1, goals: ["Flexibility", "Back & posture", "Stress relief", "General fitness"], avoid: [], benefit: "Mobilises the spine; great for back stiffness.", steps: ["Come on hands and knees", "Inhale, drop belly and lift head (cow)", "Exhale, round the back and tuck chin (cat)", "Repeat 10 slow rounds"] },

  // Main – yoga
  { id: "tadasana", name: "Mountain Pose", alt: "Tadasana", emoji: "🏔️", phase: "main", kind: "Yoga", minutes: 3, level: 1, goals: ["Back & posture", "General fitness", "Flexibility"], avoid: [], benefit: "Improves posture and balance.", steps: ["Stand with feet together", "Raise arms overhead, interlock fingers", "Rise on toes if comfortable", "Hold 30 sec, breathe; repeat 3 times"] },
  { id: "vrikshasana", name: "Tree Pose", alt: "Vrikshasana", emoji: "🌳", phase: "main", kind: "Yoga", minutes: 3, level: 1, goals: ["Flexibility", "General fitness", "Stress relief"], avoid: [], benefit: "Builds balance, focus and leg strength.", steps: ["Stand on left leg", "Place right foot on inner left thigh or calf (not knee)", "Hands in prayer", "Hold 30 sec each side, twice"] },
  { id: "trikonasana", name: "Triangle Pose", alt: "Trikonasana", emoji: "📐", phase: "main", kind: "Yoga", minutes: 4, level: 1, goals: ["Flexibility", "Weight loss", "General fitness"], avoid: ["Neck pain"], benefit: "Stretches sides and hamstrings; aids digestion.", steps: ["Feet wide apart, right foot out", "Reach right hand to shin, left arm up", "Look up (or forward if neck hurts)", "Hold 30 sec each side, twice"] },
  { id: "bhujangasana", name: "Cobra Pose", alt: "Bhujangasana", emoji: "🐍", phase: "main", kind: "Yoga", minutes: 3, level: 1, goals: ["Back & posture", "Flexibility", "General fitness"], avoid: ["Pregnancy"], benefit: "Strengthens lower back, opens the chest.", steps: ["Lie on stomach, palms under shoulders", "Inhale, lift chest using back muscles", "Keep elbows slightly bent", "Hold 20 sec, repeat 4 times"] },
  { id: "setu", name: "Bridge Pose", alt: "Setu Bandhasana", emoji: "🌉", phase: "main", kind: "Yoga", minutes: 3, level: 1, goals: ["Back & posture", "Strength", "Weight loss"], avoid: ["Neck pain", "Pregnancy"], benefit: "Strengthens glutes and back; relieves fatigue.", steps: ["Lie on back, knees bent, feet hip-width", "Press feet and lift hips", "Hold 20–30 sec", "Lower slowly. Repeat 5 times"] },
  { id: "virabhadra", name: "Warrior II", alt: "Virabhadrasana II", emoji: "🗡️", phase: "main", kind: "Yoga", minutes: 4, level: 2, goals: ["Strength", "Weight loss", "General fitness"], avoid: ["Knee pain"], benefit: "Builds leg strength and stamina.", steps: ["Feet wide, turn right foot out", "Bend right knee over ankle", "Arms out at shoulder height", "Hold 30–45 sec each side, twice"] },
  { id: "naukasana", name: "Boat Pose", alt: "Naukasana", emoji: "⛵", phase: "main", kind: "Yoga", minutes: 3, level: 2, goals: ["Strength", "Weight loss"], avoid: ["Back pain", "Pregnancy", "Heart condition", "High BP"], benefit: "Strengthens core and abdominal muscles.", steps: ["Sit with knees bent", "Lean back, lift feet off floor", "Arms forward parallel to floor", "Hold 15–30 sec, repeat 4 times"] },
  { id: "paschimottanasana", name: "Seated Forward Bend", alt: "Paschimottanasana", emoji: "🙇", phase: "main", kind: "Yoga", minutes: 3, level: 1, goals: ["Flexibility", "Stress relief", "Weight loss"], avoid: ["Back pain", "Pregnancy"], benefit: "Stretches hamstrings, calms the mind.", steps: ["Sit with legs straight", "Inhale, raise arms", "Exhale, fold forward from hips", "Hold toes/shins, 30 sec × 3"] },
  { id: "balasana", name: "Child's Pose", alt: "Balasana", emoji: "🧎", phase: "main", kind: "Yoga", minutes: 2, level: 1, goals: ["Stress relief", "Back & posture", "Flexibility"], avoid: ["Knee pain"], benefit: "Relaxes back and relieves stress.", steps: ["Kneel and sit on heels", "Fold forward, forehead to floor", "Arms forward or beside body", "Breathe deeply for 1–2 min"] },

  // Main – workouts
  { id: "squats", name: "Bodyweight Squats", emoji: "🦵", phase: "main", kind: "Workout", minutes: 4, level: 1, goals: ["Strength", "Weight loss", "General fitness"], avoid: ["Knee pain"], reps: "3 × 12", benefit: "Strengthens legs and burns calories.", steps: ["Feet shoulder-width apart", "Sit back as if on a chair, chest up", "Go only as low as comfortable", "Stand up pushing through heels"] },
  { id: "wall-pushups", name: "Wall / Knee Push-ups", emoji: "💪", phase: "main", kind: "Workout", minutes: 3, level: 1, goals: ["Strength", "General fitness"], avoid: [], reps: "3 × 10", benefit: "Builds chest, shoulder and arm strength safely.", steps: ["Hands on wall (or floor on knees)", "Body in straight line", "Lower chest slowly", "Push back up"] },
  { id: "pushups", name: "Push-ups", emoji: "🏋️", phase: "main", kind: "Workout", minutes: 4, level: 2, goals: ["Strength", "Weight loss"], avoid: ["Heart condition", "Pregnancy"], reps: "3 × 10–15", benefit: "Upper body and core strength.", steps: ["Plank position, hands under shoulders", "Lower chest near floor", "Push up keeping body straight", "Rest 30 sec between sets"] },
  { id: "plank", name: "Plank Hold", emoji: "🧱", phase: "main", kind: "Workout", minutes: 3, level: 2, goals: ["Strength", "Weight loss", "Back & posture"], avoid: ["High BP", "Pregnancy", "Heart condition"], reps: "3 × 30 sec", benefit: "Strengthens the whole core.", steps: ["Forearms on floor, elbows under shoulders", "Lift hips to straight line", "Squeeze stomach, breathe normally", "Rest 30 sec between holds"] },
  { id: "jacks", name: "Jumping Jacks", emoji: "⭐", phase: "main", kind: "Workout", minutes: 3, level: 2, goals: ["Weight loss", "General fitness"], avoid: ["Knee pain", "Heart condition", "Pregnancy", "High BP"], reps: "3 × 30 sec", benefit: "Cardio that burns fat quickly.", steps: ["Jump feet out, arms overhead", "Jump back together", "Land softly", "Low-impact: step side to side instead"] },
  { id: "lunges", name: "Alternating Lunges", emoji: "🚶‍♂️", phase: "main", kind: "Workout", minutes: 4, level: 2, goals: ["Strength", "Weight loss"], avoid: ["Knee pain"], reps: "3 × 10 each leg", benefit: "Leg strength and balance.", steps: ["Step forward with right leg", "Lower until both knees ~90°", "Push back to start", "Alternate legs"] },
  { id: "burpees", name: "Burpees", emoji: "🔥", phase: "main", kind: "Workout", minutes: 4, level: 3, goals: ["Weight loss", "Strength"], avoid: ["Knee pain", "Back pain", "Heart condition", "High BP", "Pregnancy"], reps: "4 × 8", benefit: "High-intensity full-body fat burner.", steps: ["Squat, hands to floor", "Jump feet back to plank", "Jump feet in", "Jump up with arms overhead"] },
  { id: "brisk-walk", name: "Brisk Walk (indoor/terrace)", emoji: "👟", phase: "main", kind: "Workout", minutes: 10, level: 1, goals: ["Weight loss", "General fitness", "Stress relief"], avoid: [], benefit: "Safe cardio for everyone, improves heart health and sugar control.", steps: ["Walk at a pace where you can talk but not sing", "Swing arms", "Keep posture upright", "Increase time each week"] },

  // Cool-down / breathing
  { id: "anulom", name: "Alternate Nostril Breathing", alt: "Anulom Vilom", emoji: "🌬️", phase: "cooldown", kind: "Breathing", minutes: 5, level: 1, goals: ALL, avoid: [], benefit: "Calms the nervous system, helps BP and stress.", steps: ["Sit comfortably, spine straight", "Close right nostril, inhale left", "Close left, exhale right", "Inhale right, exhale left. Continue 5 min"] },
  { id: "bhramari", name: "Humming Bee Breath", alt: "Bhramari", emoji: "🐝", phase: "cooldown", kind: "Breathing", minutes: 3, level: 1, goals: ["Stress relief", "General fitness", "Flexibility"], avoid: [], benefit: "Reduces anxiety and improves sleep.", steps: ["Sit comfortably, close eyes", "Inhale deeply", "Exhale making a soft humming sound", "Repeat 7–10 times"] },
  { id: "shavasana", name: "Relaxation", alt: "Shavasana", emoji: "😌", phase: "cooldown", kind: "Yoga", minutes: 4, level: 1, goals: ALL, avoid: [], benefit: "Lets the body absorb the practice and relax fully.", steps: ["Lie on back, arms by sides", "Close eyes, relax each body part from toes to head", "Breathe naturally", "Rest 3–5 min"] },
];

const LEVEL_NUM = { Beginner: 1, Intermediate: 2, Advanced: 3 } as const;

export function dayIndex(date = new Date()) {
  return Math.floor(new Date(date.toDateString()).getTime() / 864e5);
}

/** Builds today's plan from the member's profile. Rotates daily so it stays fresh. */
export function buildPlan(p: Pick<FitnessProfile, "goal" | "level" | "minutes" | "conditions">, date = new Date()): Exercise[] {
  const lvl = LEVEL_NUM[p.level] ?? 1;
  const ok = (e: Exercise) => e.level <= lvl && !e.avoid.some((c) => p.conditions.includes(c));
  const seed = dayIndex(date);
  const rotate = <T,>(arr: T[]) => (arr.length ? arr.map((_, i) => arr[(i + seed) % arr.length]) : arr);

  const warm = rotate(EXERCISES.filter((e) => e.phase === "warmup" && ok(e)));
  const main = rotate(EXERCISES.filter((e) => e.phase === "main" && ok(e) && e.goals.includes(p.goal)));
  const mainOther = rotate(EXERCISES.filter((e) => e.phase === "main" && ok(e) && !e.goals.includes(p.goal)));
  const cool = rotate(EXERCISES.filter((e) => e.phase === "cooldown" && ok(e)));

  const plan: Exercise[] = [];
  let used = 0;
  const budget = p.minutes;
  const add = (e?: Exercise) => { if (e && !plan.includes(e)) { plan.push(e); used += e.minutes; } };

  add(warm[0]);
  if (budget >= 30) add(warm[1]);
  const coolReserve = budget >= 30 ? 8 : 4;
  for (const e of [...main, ...mainOther]) {
    if (used + e.minutes > budget - coolReserve) continue;
    add(e);
  }
  for (const e of cool) {
    if (used + e.minutes > budget + 1) continue;
    add(e);
  }
  return plan;
}

export const exerciseById = (id: string) => EXERCISES.find((e) => e.id === id);
