import { z } from "zod";

const date = z.iso.date();
const sourceSchema = z.object({
  id: z.string().min(1), publisher: z.string().min(1), title: z.string().min(1),
  url: z.url().refine((value) => value.startsWith("https://")),
  language: z.string().min(2), retrievedAt: date,
}).strict();

export const countryFactSchema = z.object({
  id: z.string().min(1), label: z.string().min(1), text: z.string().min(1),
  state: z.enum(["documented", "conditional", "not_established"]),
  sourceIds: z.array(z.string()).min(1), locator: z.string().min(1),
  // A structured constraint is additive; its qualifications always travel with it.
  constraint: z.object({
    value: z.number().nonnegative(), unit: z.enum(["years", "days"]),
    basis: z.enum(["legal_residence", "permanent_residence", "physical_presence"]),
    withinYears: z.number().positive().optional(), cohort: z.string().min(1),
  }).strict().optional(),
  language: z.object({ framework: z.string(), level: z.string(), skills: z.array(z.string()).min(1) }).strict().optional(),
  effectiveFrom: date.optional(),
}).strict().superRefine((fact, ctx) => {
  if (fact.state === "not_established" && (fact.constraint || fact.language)) {
    ctx.addIssue({ code: "custom", message: "An unresolved requirement cannot have an asserted numeric value or language level." });
  }
});

export const countryTopicSchema = z.object({
  code: z.string().regex(/^[A-Z]{2}$/), topic: z.enum(["citizenship", "taxes"]),
  title: z.string().min(1).max(52), summary: z.string().min(40),
  scope: z.string().min(20), jurisdiction: z.string().min(1),
  routeId: z.string().optional(), routeType: z.enum(["naturalisation", "exceptional"]).optional(),
  facts: z.array(countryFactSchema).min(4), limits: z.array(z.string()).min(1),
}).strict();

export const countryProfileCandidateSchema = z.object({
  schemaVersion: z.literal(1), researcher: z.string().min(1), retrievedAt: date,
  sources: z.array(sourceSchema).min(1), topics: z.array(countryTopicSchema).min(1),
}).strict().superRefine((data, ctx) => {
  const sources = new Set(data.sources.map((source) => source.id));
  const ids = data.topics.map((topic) => `${topic.code}/${topic.topic}`);
  if (sources.size !== data.sources.length || new Set(ids).size !== ids.length) {
    ctx.addIssue({ code: "custom", message: "Duplicate source or topic identity." });
  }
  for (const topic of data.topics) {
    if (new Set(topic.facts.map((fact) => fact.id)).size !== topic.facts.length) {
      ctx.addIssue({ code: "custom", message: `Duplicate fact in ${topic.code}/${topic.topic}` });
    }
    for (const fact of topic.facts) {
      if (fact.sourceIds.some((id) => !sources.has(id))) {
        ctx.addIssue({ code: "custom", message: `Missing source for ${topic.code}/${fact.id}` });
      }
    }
  }
});

export const countryProfileReviewSchema = z.object({
  decision: z.literal("approved"), reviewer: z.string().min(1), reviewedAt: date, recheckBy: date,
  candidateSha256: z.string().regex(/^[a-f0-9]{64}$/), notes: z.string().min(20),
}).strict();

export type CountryTopic = z.infer<typeof countryTopicSchema>;
export type CountryProfileCandidate = z.infer<typeof countryProfileCandidateSchema>;
