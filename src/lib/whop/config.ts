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

/**
 * Community chat rooms. Each is its own Whop chat feed (1 feed = 1 experience —
 * Whop has no sub-channels), all attached to the membership product so every
 * member can read/post. The embed just swaps `channelId`. To add a room: create
 * a Chat experience + attach it to the product, then add its `chat_feed_…` id
 * here. `channelId` is the public feed id; ids are safe to ship to the browser.
 */
export interface ChatRoom {
  slug: string; // url/switcher key
  name: string; // sidebar label
  icon?: string; // emoji
  channelId: string; // chat_feed_… id rendered by the embed
  experienceId: string; // exp_… (reference / future gating)
}

export const chatRooms: ChatRoom[] = [
  { slug: "general", name: "General", icon: "💬",
    channelId: "chat_feed_1CcFztZ32cr6r7RDX1QsK6", experienceId: "exp_HR1nHZaOHI0fiC" },
  { slug: "fintech", name: "Fintech", icon: "💳",
    channelId: "chat_feed_1CcGc8HvmS5TLC1wJoEcEX", experienceId: "exp_xxic36T4sVtais" },
  { slug: "ai", name: "AI", icon: "🤖",
    channelId: "chat_feed_1CcH9vcqnERxashxv967Ko", experienceId: "exp_UN0wH3hzMUWsGe" },
  { slug: "real-estate", name: "Real Estate", icon: "🏠",
    channelId: "chat_feed_1CcGc8L3MKLu3JqSUz6pct", experienceId: "exp_Qm7AaSf3QWnagG" },
  { slug: "social-content", name: "Social Media & Content", icon: "📱",
    channelId: "chat_feed_1CcGc8M6zUrAmWK3wE9q4L", experienceId: "exp_hdu26jcLMJtRiz" },
  { slug: "dev-apps", name: "Development & Apps", icon: "💻",
    channelId: "chat_feed_1CcH9wKXEjCQDgow6MTH5i", experienceId: "exp_cQr3GiMHY2czrM" },
  { slug: "ecom", name: "Ecom", icon: "🛒",
    channelId: "chat_feed_1CcGc8GqK7mimeVYUvN6XS", experienceId: "exp_ddIAIyFHeVsaW4" },
  { slug: "investing", name: "Investing", icon: "📈",
    channelId: "chat_feed_1CcGc8JwNNtMJcBDZic8dw", experienceId: "exp_dB0crqTTv8NHBi" },
];

export const defaultRoomSlug = "general";
export const chatRoomBySlug = (slug: string): ChatRoom | undefined =>
  chatRooms.find((r) => r.slug === slug);

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
