/**
 * Member profile shape + option lists + completion math. No "server-only" here —
 * the onboarding form and the dashboard completion prompt (both client) import
 * these alongside the server store.
 */

export interface MemberProfile {
  industry: string;
  country: string;
  city: string;
  role: string;
  company: string;
  stage: string;
  /** What they're building — a sentence or two. */
  building: string;
  /** What they're open to (Hiring, Fundraising, …). */
  lookingFor: string[];
  /** Who they want to meet — free text, drives intro suggestions. */
  seeking: string;
  linkedin: string;
  website: string;
}

export const EMPTY_PROFILE: MemberProfile = {
  industry: "",
  country: "",
  city: "",
  role: "",
  company: "",
  stage: "",
  building: "",
  lookingFor: [],
  seeking: "",
  linkedin: "",
  website: "",
};

export const INDUSTRIES = [
  "Fintech",
  "AI / ML",
  "SaaS",
  "E-commerce",
  "Real Estate",
  "Healthcare",
  "Consumer",
  "Crypto / Web3",
  "Hardware",
  "Media & Content",
  "Marketplace",
  "Dev Tools",
  "Other",
] as const;

export const STAGES = [
  "Idea",
  "Pre-seed",
  "Seed",
  "Series A",
  "Series B+",
  "Bootstrapped",
  "Profitable",
] as const;

export const LOOKING_FOR = [
  "Hiring",
  "Fundraising",
  "Advice",
  "Partnerships",
  "Customers",
  "Co-founder",
  "Investing",
] as const;

/** Fields that count toward the completion meter (links are bonus, not counted). */
const COMPLETION_FIELDS: (keyof MemberProfile)[] = [
  "industry",
  "country",
  "role",
  "company",
  "stage",
  "building",
  "lookingFor",
  "seeking",
];

export function profileCompletion(p: MemberProfile): number {
  const filled = COMPLETION_FIELDS.filter((k) => {
    const v = p[k];
    return Array.isArray(v) ? v.length > 0 : Boolean(v && String(v).trim());
  }).length;
  return Math.round((filled / COMPLETION_FIELDS.length) * 100);
}

export function profileHasAny(p: MemberProfile): boolean {
  return (
    Boolean(
      p.industry ||
        p.country ||
        p.city ||
        p.role ||
        p.company ||
        p.stage ||
        p.building ||
        p.seeking ||
        p.linkedin ||
        p.website,
    ) || p.lookingFor.length > 0
  );
}
