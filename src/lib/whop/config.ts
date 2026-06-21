/**
 * Astrada × Whop configuration.
 *
 * These IDs are public identifiers (safe to ship to the browser). Secrets
 * (API key, client secret, webhook secret, session secret) are read only inside
 * server-only modules — never here.
 */
export const whop = {
  companyId: "biz_NuaKI6q6sSHS13",
  productId: "prod_DALs8AFAIqjRx",
  plans: {
    monthly: "plan_DCZaz3V7tulXI",
    annual: "plan_r59n7PVtZU9VT",
  },
  experiences: {
    chat: "exp_HR1nHZaOHI0fiC",
    forums: "exp_MmI5S2yJJUiULX",
    events: "exp_CaariODfQCPJTu",
    announcements: "exp_CMoQ3RisaglZdL",
  },
  /**
   * Chat *feed* id for the embedded chat — the ChatElement needs the channel id,
   * not the experience id. Resolved from the "Astrada Chat" experience
   * (exp_HR1nHZaOHI0fiC) via the Whop API.
   */
  chatChannelId: "chat_feed_1CcFztZ32cr6r7RDX1QsK6",
  /** The hosted Whop checkout / community page. */
  pageUrl: "https://whop.com/astrada-club",
  /** OAuth app client id (app_…), from the Whop dashboard. Public. */
  appId: process.env.NEXT_PUBLIC_WHOP_APP_ID ?? "",
} as const;

/** Pricing surfaced on the marketing site — must match the Whop plans above. */
export const plans = [
  {
    key: "annual" as const,
    name: "Annual",
    planId: whop.plans.annual,
    price: "$400",
    interval: "/year",
    note: "Best value — two months free",
    featured: true,
  },
  {
    key: "monthly" as const,
    name: "Monthly",
    planId: whop.plans.monthly,
    price: "$49",
    interval: "/month",
    note: "Flexible, cancel anytime",
    featured: false,
  },
];

export type PlanKey = (typeof plans)[number]["key"];
