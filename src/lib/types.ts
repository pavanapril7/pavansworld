export type Role = "member" | "admin";

export interface Profile { id: string; phone: string; name: string; area?: string; role: Role; created_at?: string }

export interface Shop {
  id: string; name: string; category: string; area: string; address: string; phone: string;
  whatsapp?: string; distance_km: number; maps_url?: string; about?: string; emoji?: string; active: boolean;
}

export interface Deal {
  id: string; shop_id?: string | null; shop_name: string; shop_phone?: string; area?: string;
  title: string; description?: string; discount_label: string; code?: string; category: string;
  valid_till: string; status: "pending" | "approved" | "rejected"; submitted_by?: string; created_at?: string;
}

export interface Helper {
  id: string; name: string; category: string; phone: string; whatsapp?: string; area: string;
  experience_years?: number; rate_note?: string; verified: boolean; languages?: string; about?: string; active: boolean;
}

export interface Review { id: string; helper_id: string; user_id: string; user_name: string; rating: number; comment?: string; created_at?: string }

export interface Idea {
  id: string; kind: "startup" | "franchise" | "content"; title: string; category: string; summary: string;
  budget_min?: number; budget_max?: number; space?: string; monthly_earning?: string;
  difficulty?: "Easy" | "Medium" | "Hard"; steps?: string[]; tags?: string[]; created_at?: string;
}

export interface Interest { id: string; idea_id: string; idea_title: string; user_id: string; user_name: string; phone: string; note?: string; created_at?: string }

export interface CollabPost {
  id: string; user_id: string; user_name: string; type: "looking" | "offering"; title: string; body: string;
  skills?: string; contact: string; status: "open" | "closed"; created_at?: string;
}

export interface FitnessProfile {
  id: string; // = user id
  name?: string; phone?: string;
  goal: string; level: "Beginner" | "Intermediate" | "Advanced"; minutes: number; conditions: string[];
  age?: number; weight_start?: number; preferred_time?: string; coaching: "free" | "requested" | "active"; created_at?: string;
}

export interface Checkin {
  id: string; user_id: string; date: string; completed: string[]; mood?: number; energy?: number;
  sleep_hours?: number; weight?: number; note?: string; created_at?: string;
}

export interface Lead {
  id: string; user_id?: string; name: string; phone: string; kind: "coaching" | "shop" | "helper" | "other";
  message?: string; status: "new" | "contacted" | "done"; created_at?: string;
}

export type TableName =
  | "profiles" | "shops" | "deals" | "helpers" | "reviews" | "ideas" | "interests"
  | "collab_posts" | "fitness_profiles" | "checkins" | "leads";
