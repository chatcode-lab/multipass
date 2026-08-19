import type { APIRoute } from "astro";
import { absoluteUrl, markdownResponse } from "@/lib/markdown";

export const GET: APIRoute = () => markdownResponse(`# eVisa vs ETA: what is the difference?

Both are requested online before travel, but they are different permissions:

- An **ETA (electronic travel authorisation)** is generally advance permission to travel under a visa-exemption programme.
- An **eVisa (electronic visa)** is a visa whose application and issuance happen electronically.

## At a glance

| | ETA | eVisa |
| --- | --- | --- |
| Legal category | Usually visa-exempt travel | A visa |
| Process | Short online pre-screening | Online visa application and review |
| Result | Permission to travel, often linked to the passport | An electronic visa or downloadable visa document |
| MultiPass Rank mobility score | Counts | Does not count |

## Why MultiPass Rank treats them differently

The mobility score counts destinations accessible without obtaining a visa before departure: visa-free, visa-on-arrival, and ETA destinations. An eVisa remains a visa requiring prior approval, so it appears in detailed access results but does not add to the score.

Government terminology is not perfectly standardised. Always verify the classification and current requirements for your passport, route, and travel purpose with the destination authority.

## Official examples

- [United Kingdom ETA rules](https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-electronic-travel-authorisation)
- [Government of Canada eTA](https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/eta.html)
- [Azerbaijan ASAN eVisa conditions](https://www.evisa.gov.az/en/conditions)

[Compare passports](${absoluteUrl("/compare")}) · [Read the scoring methodology](${absoluteUrl("/methodology")})`, "/evisa-vs-eta");
