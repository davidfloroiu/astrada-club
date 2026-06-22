import type { WhopElementsOptions } from "@whop/embedded-components-vanilla-js/types";

type Appearance = NonNullable<WhopElementsOptions["appearance"]>;

/**
 * Theme the Whop embedded chat/DMs to match the app: follow light/dark, use a
 * navy-ish accent + slate grays, and set the surface to our paper color so the
 * embed reads as in-app instead of a bright white card pasted in.
 */
export function whopAppearance(mode: "light" | "dark"): Appearance {
  const surface = mode === "dark" ? "#0f1828" : "#fbfaf6";
  return {
    theme: {
      appearance: mode,
      accentColor: "indigo",
      grayColor: "slate",
    },
    // Best-effort surface overrides (Radix-style vars the embed may expose).
    variables: {
      "--color-background": surface,
      "--color-panel-solid": surface,
      "--color-panel-translucent": surface,
    },
  };
}
