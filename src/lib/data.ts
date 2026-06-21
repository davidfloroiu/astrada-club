import type {
  Member,
  ClubEvent,
  Perk,
  FaqItem,
  Benefit,
  LevelDef,
  Archetype,
} from "./types";

/* ── Honest founding facts (no inflated numbers) ────────────── */
export const founding = {
  cohortName: "Founding Circle",
  cohortCap: 100,
  launchYear: 2026,
};

/* ── What we're building — membership pillars ───────────────── */
export const benefits: Benefit[] = [
  {
    icon: "Users",
    title: "The Member Directory",
    description:
      "A private directory of every member — who they are, what they're building, and a way to ask for a warm introduction. It grows as the circle does.",
  },
  {
    icon: "UtensilsCrossed",
    title: "Founder Dinners",
    description:
      "Intimate, off-the-record dinners of a handful of founders. No pitching, no panels — the first ones will be small, in the cities where founding members are.",
  },
  {
    icon: "MessagesSquare",
    title: "A Private Room",
    description:
      "A members-only space to think out loud, ask the questions you can't ask publicly, and get honest answers from people who've been there.",
  },
  {
    icon: "Handshake",
    title: "Curated Introductions",
    description:
      "Tell us who you need to meet — a co-investor, a first hire, a customer, a peer in the trenches — and we'll make the introduction by hand.",
  },
  {
    icon: "Tags",
    title: "Member Perks",
    description:
      "Perks on the tools founders actually use. We're lining these up now and will only ever list partnerships once they're real.",
  },
  {
    icon: "Compass",
    title: "Earned Standing",
    description:
      "Reputation you can't fake. Members earn standing through documented outcomes, so an Astrada introduction always means something.",
  },
];

/* ── Who Astrada is for (archetypes, not real people) ───────── */
export const archetypes: Archetype[] = [
  {
    icon: "Rocket",
    title: "The early operator",
    description:
      "You've shipped something real and have customers paying for it. You're past the idea stage and into the hard, unglamorous middle.",
  },
  {
    icon: "TrendingUp",
    title: "The scaler",
    description:
      "You've found product-market fit and you're growing a team. The problems are bigger now, and the people who can relate are fewer.",
  },
  {
    icon: "Anchor",
    title: "The repeat founder",
    description:
      "You've built before — maybe sold, maybe not — and you're doing it again with scar tissue and conviction.",
  },
];

/* ── Membership levels (earned, not bought) ─────────────────── */
export const levels: LevelDef[] = [
  { level: 1, name: "Founder", requirement: "A member with a live, revenue-generating company." },
  { level: 2, name: "Operator", requirement: "Meaningful revenue, or a priced funding round." },
  { level: 3, name: "Builder", requirement: "Significant scale — revenue, a notable exit, or a real team." },
  { level: 4, name: "Architect", requirement: "Category-defining traction or a significant exit." },
  { level: 5, name: "Luminary", requirement: "Generational outcomes. By member nomination only." },
];

/* ── Sample members (illustrative — labeled as such in the app) ─ */
export const members: Member[] = [];

/* ── Sample events (illustrative — labeled in the app) ──────── */
export const events: ClubEvent[] = [];

/* ── Perks we're lining up (no fake partners, nothing live yet) ─ */
export const perks: Perk[] = [
  {
    id: "cloud",
    title: "Cloud infrastructure credits",
    category: "Infrastructure",
    status: "Lining up",
    description: "Compute, storage, and database credits with leading cloud providers for early-stage teams.",
    monogram: "☁",
  },
  {
    id: "payments",
    title: "Payments & billing",
    category: "Payments",
    status: "Lining up",
    description: "Reduced processing rates and priority onboarding with modern payments platforms.",
    monogram: "₽",
  },
  {
    id: "design",
    title: "Design & prototyping tools",
    category: "Design",
    status: "Lining up",
    description: "Extended trials and member rates on the design and prototyping tools founders rely on.",
    monogram: "✦",
  },
  {
    id: "payroll",
    title: "Global payroll & hiring",
    category: "HR & Payroll",
    status: "Lining up",
    description: "Member pricing on platforms for hiring and paying a distributed team.",
    monogram: "⊞",
  },
  {
    id: "banking",
    title: "Business banking",
    category: "Banking",
    status: "Lining up",
    description: "Fast-tracked onboarding and founder perks with startup-friendly banking partners.",
    monogram: "$",
  },
  {
    id: "equity",
    title: "Equity & cap table",
    category: "Legal & Equity",
    status: "Lining up",
    description: "Member rates on cap-table management and staying fundraise-ready.",
    monogram: "%",
  },
  {
    id: "ai",
    title: "AI model credits",
    category: "AI",
    status: "Lining up",
    description: "Credits across frontier and open models to build AI into your product.",
    monogram: "◆",
  },
  {
    id: "travel",
    title: "Travel & stays",
    category: "Travel",
    status: "Lining up",
    description: "Member rates on stays and lounge access for founders who live on the road.",
    monogram: "✈",
  },
  {
    id: "productivity",
    title: "Productivity suite",
    category: "Productivity",
    status: "Lining up",
    description: "Extended access and member rates on the docs, email, and project tools teams run on.",
    monogram: "▤",
  },
];

/* ── FAQ — honest about being new ───────────────────────────── */
export const faqs: FaqItem[] = [
  {
    q: "Is Astrada actually up and running?",
    a: "Astrada is brand new — we're forming the founding circle right now. We'd rather be honest about that than fake a community that doesn't exist yet. Founding members shape what this becomes, from the first dinners to the perks we line up.",
  },
  {
    q: "Who is Astrada for?",
    a: "Founders who are actively building a company with real traction — paying customers, funding, a team, or a meaningful exit behind them. We're industry-agnostic, but this isn't for aspiring founders, students, or service providers looking for clients.",
  },
  {
    q: "How do I join?",
    a: "Join directly through Whop — pick monthly or annual, check out securely (right here on the site), and you're in. Then sign in with Whop to enter the members' area.",
  },
  {
    q: "What does membership cost?",
    a: "$49 per month, or $400 per year — annual saves you two months. Membership runs on Whop and you can cancel anytime.",
  },
  {
    q: "What are member levels?",
    a: "Levels are earned, not bought. Every member starts as a Founder and progresses through documented outcomes — revenue, funding, exits. There's no faking your way up, which is what gives an Astrada introduction its weight.",
  },
  {
    q: "Why join now instead of waiting?",
    a: "Because the founding circle is small by design, and the earliest members have the most say in what Astrada becomes — and the most to gain from being known here first.",
  },
];
