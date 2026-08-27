import type { APIRoute } from "astro";
import { absoluteUrl, markdownResponse } from "@/lib/markdown";

export const GET: APIRoute = () => markdownResponse(`# MultiPass Rank Evidence Metadata License 1.0

Effective 20 August 2026.

## Licensed material

MultiPass Rank's original evidence metadata—including normalized country codes, source identifiers, source-review dates, structured stay metadata, conditional-evidence classifications, timeline summaries, and original annotations—is available under the [Creative Commons Attribution 4.0 International license](https://creativecommons.org/licenses/by/4.0/).

Suggested attribution: “MultiPass Rank passport-access evidence metadata, multipassrank.com, version and access date.”

## Excluded material

Government publications, legal instruments, third-party source documents, passport imagery, and the upstream access snapshot remain subject to their respective owners' terms. Linking or citing a source does not transfer copyright or grant additional reuse rights.

## Accuracy

This dataset is an informational comparison and research aid, not legal advice or permission to travel. Verify current requirements with the linked official destination authority.

[Open the HTML license page](${absoluteUrl("/data-license")})`, "/data-license");
