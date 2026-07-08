export type NudeThemeId =
  | "peachy"
  | "greige"
  | "champagne"
  | "terracotta"
  | "dusty-rose"
  | "oyster"
  | "copper";

export type NudeTheme = {
  id: NudeThemeId;
  label: string;
  note: string;
  nude: string;
  soft: string;
  dark: string;
  muted: string;
  glow: string;
};

/** Vivid palettes — boosted saturation for comparison on /themes */
export const NUDE_THEMES: NudeTheme[] = [
  {
    id: "peachy",
    label: "Peachy",
    note: "Golden apricot · warm & bright",
    nude: "#F0A848",
    soft: "#FFC868",
    dark: "#D88828",
    muted: "#E0A038",
    glow: "240, 168, 72"
  },
  {
    id: "greige",
    label: "Greige Stone",
    note: "Warm taupe · editorial",
    nude: "#C8A888",
    soft: "#E8C8A8",
    dark: "#A08060",
    muted: "#B89878",
    glow: "200, 168, 136"
  },
  {
    id: "champagne",
    label: "Champagne",
    note: "Rich gold · fintech luxury",
    nude: "#E0B848",
    soft: "#F5D878",
    dark: "#C09830",
    muted: "#D0A840",
    glow: "224, 184, 72"
  },
  {
    id: "terracotta",
    label: "Terracotta Sand",
    note: "Burnt sienna · warm Celo",
    nude: "#E07038",
    soft: "#F89858",
    dark: "#C05020",
    muted: "#D06030",
    glow: "224, 112, 56"
  },
  {
    id: "dusty-rose",
    label: "Dusty Rose",
    note: "Blush rose · bold on black",
    nude: "#E05058",
    soft: "#FF7880",
    dark: "#C03038",
    muted: "#D84850",
    glow: "224, 80, 88"
  },
  {
    id: "oyster",
    label: "Oyster Pearl",
    note: "Active brand palette",
    nude: "#B8B0C8",
    soft: "#D8D0E8",
    dark: "#9088A0",
    muted: "#A8A0B8",
    glow: "184, 176, 200"
  },
  {
    id: "copper",
    label: "Muted Copper",
    note: "Burnished bronze · bold accent",
    nude: "#E08838",
    soft: "#F8B060",
    dark: "#C06820",
    muted: "#D07828",
    glow: "224, 136, 56"
  }
];

export const DEFAULT_THEME_ID: NudeThemeId = "oyster";

export function getTheme(id: NudeThemeId): NudeTheme {
  return (
    NUDE_THEMES.find((t) => t.id === id) ??
    NUDE_THEMES.find((t) => t.id === DEFAULT_THEME_ID) ??
    NUDE_THEMES[0]
  );
}

/** Inline boot script values — keep in sync with NUDE_THEMES */
export const THEME_BOOT_MAP: Record<
  NudeThemeId,
  Pick<NudeTheme, "nude" | "soft" | "dark" | "muted" | "glow">
> = Object.fromEntries(
  NUDE_THEMES.map((t) => [
    t.id,
    { nude: t.nude, soft: t.soft, dark: t.dark, muted: t.muted, glow: t.glow }
  ])
) as Record<NudeThemeId, Pick<NudeTheme, "nude" | "soft" | "dark" | "muted" | "glow">>;

export const THEME_STORAGE_KEY = "onfra-nude-theme-v4";
