import type { APIRoute } from "astro";
import { markdownResponse } from "@/lib/markdown";
import { howManyPassportsCanYouHaveMarkdown } from "@/lib/research-content";

export const GET: APIRoute = () => markdownResponse(
  howManyPassportsCanYouHaveMarkdown(),
  "/how-many-passports-can-you-have",
);
