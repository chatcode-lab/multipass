import type { APIRoute } from "astro";
import { absoluteUrl, markdownResponse } from "@/lib/markdown";

export const GET: APIRoute = () => markdownResponse(`# How MultiPass Rank works

MultiPass Rank answers one practical question: how many destinations can a passport reach without obtaining a government-approved visa before departure?

## Individual passport score

Visa-free, visa-on-arrival, and ETA destinations each add one point. eVisas and traditional visas require approval before travel, while entry restrictions provide no ordinary visitor route, so none adds a point. Equal scores share a dense rank. [Learn how an eVisa differs from an ETA](${absoluteUrl("/evisa-vs-eta")}).

## Combined passport score

For each destination, the calculator keeps the easiest access available across every passport in a set. Citizenship is strongest, followed by visa-free, ETA, visa on arrival, eVisa, visa required, and entry restricted. A restriction is used only when current official evidence shows ordinary visitor entry is prohibited or suspended. One home destination is subtracted so a single-passport combination matches that passport's individual score.

A combined result is a **rank equivalent**, not an official passport rank.

## Comparison table

Every row is a destination and every column is one passport set. “Differences only” hides a row when all visible options have the same best access category.

## Limitations

Data is published as complete server-side snapshots. Entry rules can change sooner than any index can update, and individual circumstances may affect entry. Confirm requirements with official destination authorities before travel.

[Open the passport ranking](${absoluteUrl("/")})`, "/methodology");
