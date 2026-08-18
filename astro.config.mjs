import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import { defineConfig } from "astro/config";
import { URL } from "node:url";

export default defineConfig({
  site: "https://multipassrank.com",
  output: "server",
  session: false,
  adapter: cloudflare({
    configPath: "./wrangler.jsonc",
    imageService: "passthrough",
    persistState: true,
  }),
  integrations: [react()],
  vite: {
    resolve: {
      alias: {
        "@": new URL("./src", import.meta.url).pathname,
      },
    },
  },
});
