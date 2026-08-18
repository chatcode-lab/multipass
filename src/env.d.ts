/// <reference types="astro/client" />
/// <reference types="@cloudflare/workers-types" />

declare global {
  namespace Cloudflare {
    interface Env {
      PASSPORT_DATA?: KVNamespace;
      ASSETS?: Fetcher;
    }
  }
}

export {};
