import { readFile, writeFile } from "node:fs/promises";

const namespaceId = process.argv[2]?.trim();
if (!namespaceId || !/^[a-f0-9]{32}$/i.test(namespaceId)) {
  throw new Error("Usage: npm run cf:set-kv -- <32-character KV namespace ID>");
}

for (const path of ["wrangler.worker.jsonc", "wrangler.jsonc"]) {
  const current = await readFile(path, "utf8");
  const next = current.replace(/REPLACE_WITH_PRODUCTION_KV_NAMESPACE_ID|[a-f0-9]{32}(?="\s*\n\s*})/i, namespaceId);
  if (next === current) throw new Error(`Could not find the KV namespace placeholder in ${path}`);
  await writeFile(path, next, "utf8");
  process.stdout.write(`Updated ${path}\n`);
}
