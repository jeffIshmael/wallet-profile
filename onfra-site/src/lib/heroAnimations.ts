import type { ComponentType } from "react";
import { CoffeePour } from "@/components/hero-animations/CoffeePour";
import { ConveyorBelt } from "@/components/hero-animations/ConveyorBelt";
import { Funnel } from "@/components/hero-animations/Funnel";
import { Hourglass } from "@/components/hero-animations/Hourglass";
import { MiningPan } from "@/components/hero-animations/MiningPan";
import { PostalSorting } from "@/components/hero-animations/PostalSorting";
import { TeaStrainer } from "@/components/hero-animations/TeaStrainer";

export type HeroAnimationId =
  | "conveyor"
  | "funnel"
  | "mining-pan"
  | "postal"
  | "coffee"
  | "tea"
  | "hourglass";

export type HeroAnimationMeta = {
  id: HeroAnimationId;
  label: string;
  note: string;
  Component: ComponentType<{ compact?: boolean }>;
};

export const HERO_ANIMATIONS: HeroAnimationMeta[] = [
  {
    id: "conveyor",
    label: "Conveyor belt",
    note: "Address rolls in · sorted packages out",
    Component: ConveyorBelt
  },
  {
    id: "funnel",
    label: "Funnel filter",
    note: "Pour in · jars fill below",
    Component: Funnel
  },
  {
    id: "mining-pan",
    label: "Mining pan",
    note: "Rough gravel in · gold nuggets out",
    Component: MiningPan
  },
  {
    id: "postal",
    label: "Postal sorting",
    note: "Envelope in · stamped trays out",
    Component: PostalSorting
  },
  {
    id: "coffee",
    label: "Coffee pour",
    note: "Drip filter · cups fill",
    Component: CoffeePour
  },
  {
    id: "tea",
    label: "Tea strainer",
    note: "Teapot pour · strainer · cups",
    Component: TeaStrainer
  },
  {
    id: "hourglass",
    label: "Hourglass",
    note: "Sand falls · layered reputation",
    Component: Hourglass
  }
];

export const DEFAULT_HERO_ANIMATION_ID: HeroAnimationId = "conveyor";

export const HERO_ANIMATION_STORAGE_KEY = "onfra-hero-animation-v1";

export function getHeroAnimation(id: HeroAnimationId): HeroAnimationMeta {
  return (
    HERO_ANIMATIONS.find((a) => a.id === id) ??
    HERO_ANIMATIONS.find((a) => a.id === DEFAULT_HERO_ANIMATION_ID) ??
    HERO_ANIMATIONS[0]
  );
}
