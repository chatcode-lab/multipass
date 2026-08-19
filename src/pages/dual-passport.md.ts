import type { APIRoute } from "astro";
import { absoluteUrl, markdownResponse } from "@/lib/markdown";

export const GET: APIRoute = () => markdownResponse(`# Dual passport travel benefits and combined rankings

A second passport changes travel access when it provides an easier entry category for a destination than the first. MultiPass Rank checks every destination and keeps the best available status across the selected passports: citizenship, visa-free, ETA, visa on arrival, eVisa, or visa required.

The combined mobility score counts destinations reachable without prior visa approval. Its **rank equivalent** shows where that score would sit among current individual passport scores; it is not an official passport ranking.

## What the comparison can show

- Destinations that become visa-free with the second passport
- Differences between ETA, visa-on-arrival, eVisa, and traditional visa requirements
- Which passport supplies the best access for each destination
- A combined mobility score and individual-rank equivalent

## What it does not cover

The calculator does not evaluate residence rights, work rights, tax treatment, military obligations, or consular protection. Visa rules can change and personal circumstances matter, so verify entry requirements with official authorities.

[Calculate combined passport access](${absoluteUrl("/compare")})

[Read the scoring methodology](${absoluteUrl("/methodology")})`, "/dual-passport");
