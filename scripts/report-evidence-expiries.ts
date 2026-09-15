/** Offline review queue only: an expiry is not proof of a replacement visa rule. */
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import {
  OFFICIAL_VISA_SOURCES,
  VISA_POLICY_EVIDENCE,
  type VisaPolicyEvidence,
} from "../src/data/visa-evidence";

const DAY_MS = 86_400_000;

export function evidenceExpiryQueue(
  policies: readonly VisaPolicyEvidence[],
  asOf = new Date().toISOString().slice(0, 10),
  windowDays = 30,
) {
  const today = Date.parse(`${asOf}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(asOf) || !Number.isFinite(today)
    || new Date(today).toISOString().slice(0, 10) !== asOf) {
    throw new Error("--as-of must be a real date in YYYY-MM-DD format");
  }
  if (!Number.isInteger(windowDays) || windowDays < 0 || windowDays > 366) {
    throw new Error("--days must be an integer between 0 and 366");
  }

  return policies.flatMap((policy) => {
    if (!policy.effectiveTo) return [];
    const daysUntilExpiry = (Date.parse(`${policy.effectiveTo}T00:00:00Z`) - today) / DAY_MS;
    if (!Number.isFinite(daysUntilExpiry) || Math.abs(daysUntilExpiry) > windowDays) return [];
    return [{
      policyId: policy.id,
      title: policy.title,
      status: policy.status,
      destinationCodes: policy.destinationCodes,
      passportCodes: policy.passportCodes ?? null,
      excludedPassportCodes: policy.excludedPassportCodes ?? [],
      effectiveFrom: policy.effectiveFrom ?? null,
      effectiveTo: policy.effectiveTo,
      daysUntilExpiry,
      state: daysUntilExpiry < 0 ? "expired" : daysUntilExpiry === 0 ? "ends_today" : "ending_soon",
      sourceIds: policy.sourceIds,
    }];
  }).sort((left, right) => left.effectiveTo.localeCompare(right.effectiveTo)
    || left.policyId.localeCompare(right.policyId));
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const args = process.argv.slice(2);
  const invalid = args.find((arg) => !arg.startsWith("--as-of=") && !arg.startsWith("--days="));
  if (invalid) throw new Error(`Unknown argument: ${invalid}`);
  const asOf = args.find((arg) => arg.startsWith("--as-of="))?.slice(8)
    ?? new Date().toISOString().slice(0, 10);
  const days = args.find((arg) => arg.startsWith("--days="))?.slice(7);
  const windowDays = days === undefined ? 30 : /^\d+$/.test(days) ? Number(days) : NaN;
  const sources = new Map(OFFICIAL_VISA_SOURCES.map((source) => [source.id, source]));
  const policies = evidenceExpiryQueue(VISA_POLICY_EVIDENCE, asOf, windowDays).map((policy) => ({
    ...policy,
    sources: policy.sourceIds.map((id) => ({
      id,
      url: sources.get(id)?.url ?? null,
      reviewedAt: sources.get(id)?.reviewedAt ?? null,
    })),
  }));
  process.stdout.write(`${JSON.stringify({
    asOf,
    windowDays,
    warning: "Review queue, not a visa decision or coverage count. End dates are inclusive. Historical policies may already have successors; check all active evidence. No sources were fetched and no review dates or access statuses were changed.",
    policies,
  }, null, 2)}\n`);
}
