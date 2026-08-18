export {};

const endpoint = process.env.SYNC_ENDPOINT;
const token = process.env.SYNC_TOKEN;

if (!endpoint || !token) {
  throw new Error("Set SYNC_ENDPOINT and SYNC_TOKEN in the process environment before bootstrapping");
}

for (let batch = 1; batch <= 25; batch += 1) {
  const response = await fetch(new URL("/admin/sync", endpoint), {
    method: "POST",
    headers: { authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error(`Sync batch ${batch} failed with HTTP ${response.status}`);
  const result = (await response.json()) as { published: boolean; processed: number; remaining: number; version: string };
  process.stdout.write(
    `Batch ${batch}: processed ${result.processed}, ${result.remaining} remaining (${result.version})\n`,
  );
  if (result.published) {
    process.stdout.write("Initial snapshot published.\n");
    process.exit(0);
  }
  await new Promise((resolve) => setTimeout(resolve, 500));
}

throw new Error("Bootstrap stopped before a snapshot was published");
