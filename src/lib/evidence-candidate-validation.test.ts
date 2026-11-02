import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { promisify } from "node:util";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const run = promisify(execFile);
const script = resolve("scripts/validate-evidence-candidate.ts");
const approved = resolve("research/visa-evidence/pass419-anguilla-taiwan-2026.candidate.json");
let directory: string;
let incomplete: string;

beforeAll(async () => {
  directory = await mkdtemp(join(tmpdir(), "multipass-exact-validation-"));
  incomplete = join(directory, "unassigned-candidate.json");
  const candidate = JSON.parse(await readFile(approved, "utf8"));
  candidate.policies = [];
  candidate.unresolved = [];
  await writeFile(incomplete, JSON.stringify(candidate));
});

afterAll(async () => {
  if (directory) await rm(directory, { recursive: true, force: true });
});

describe("exact candidate assignment at the CLI boundary", () => {
  it("rejects a well-shaped candidate that silently omits its assigned passport", async () => {
    await expect(run(process.execPath, ["--import", "tsx", script, incomplete, "--exact"]))
      .rejects.toThrow("Queued pair TW:AI is neither supported nor unresolved");
  });

  it("accepts the reviewed complete one-pair assignment", async () => {
    const result = await run(process.execPath, ["--import", "tsx", script, approved, "--exact"]);
    expect(result.stdout).toContain("Validated pass419-anguilla-taiwan-2026");
  });

  it("retains partial discovery validation when exact assignment was not requested", async () => {
    const result = await run(process.execPath, ["--import", "tsx", script, incomplete]);
    expect(result.stdout).toContain("0 policies");
  });
});
