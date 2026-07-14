"use client";

import type { ComponentType } from "react";
import { Auth } from "@/components/showcases/Auth";
import { Banners } from "@/components/showcases/Banners";
import { Dotfiles } from "@/components/showcases/Dotfiles";
import { Mail } from "@/components/showcases/Mail";
import { Pulse } from "@/components/showcases/Pulse";

/**
 * Backend projects have no interface to screenshot, so each gets a small
 * running visual instead. Keyed by `showcase` in data/profile.json; an unknown
 * key renders nothing rather than breaking the card.
 */
type ShowcaseProps = { repos: number; stars: number };

// Only Banners needs the stats; the rest ignore the props.
const REGISTRY: Record<string, ComponentType<ShowcaseProps>> = {
  pulse: Pulse as ComponentType<ShowcaseProps>,
  mail: Mail as ComponentType<ShowcaseProps>,
  auth: Auth as ComponentType<ShowcaseProps>,
  dotfiles: Dotfiles as ComponentType<ShowcaseProps>,
  banners: Banners,
};

export function Showcase({
  name,
  repos,
  stars,
}: {
  name: string;
  repos: number;
  stars: number;
}) {
  const Component = REGISTRY[name];
  if (!Component) return null;
  return <Component repos={repos} stars={stars} />;
}
