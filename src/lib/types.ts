export interface Member {
  id: string;
  name: string;
  title: string;
  company: string;
  city: string;
  country: string;
  industry: string;
  bio: string;
  building: string; // one-line "what they're building now"
  highlight: string; // a notable achievement
  tags: string[];
  joinedYear: number;
}

export type EventType = "dinner" | "run" | "summit" | "workshop" | "social";

export interface ClubEvent {
  id: string;
  title: string;
  type: EventType;
  date: string; // ISO yyyy-mm-dd
  time: string;
  city: string;
  venue: string;
  host: string;
  capacity: number;
  spotsLeft: number;
  description: string;
}

/** A member perk Astrada intends to offer — nothing here is live yet. */
export interface Perk {
  id: string;
  title: string;
  category: string;
  status: string; // honest status, e.g. "Lining up"
  description: string;
  monogram: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface Benefit {
  icon: string; // lucide icon name
  title: string;
  description: string;
}

export interface Archetype {
  icon: string;
  title: string;
  description: string;
}
