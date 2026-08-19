import type { APIRoute } from "astro";
import { agentGuideMarkdown } from "@/lib/ai-guide";
import { markdownResponse } from "@/lib/markdown";

export const GET: APIRoute = async () => markdownResponse(agentGuideMarkdown(), "/ai");
