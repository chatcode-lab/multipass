import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  if (context.url.hostname === "www.multipassrank.com") {
    const canonical = new URL(context.url);
    canonical.hostname = "multipassrank.com";
    return Response.redirect(canonical, 308);
  }

  const response = await next();
  const headers = new Headers(response.headers);
  const cacheControl = headers.get("Cache-Control");
  if (cacheControl?.includes("public") && !headers.has("Cloudflare-CDN-Cache-Control")) {
    const edgeTtl = cacheControl.match(/s-maxage=(\d+)/)?.[1] ?? cacheControl.match(/max-age=(\d+)/)?.[1] ?? "300";
    const staleTtl = cacheControl.match(/stale-while-revalidate=(\d+)/)?.[1] ?? "86400";
    headers.set("Cloudflare-CDN-Cache-Control", `public, max-age=${edgeTtl}, stale-while-revalidate=${staleTtl}`);
    headers.set("Cache-Tag", "multipass-public");
  }
  headers.set("Content-Security-Policy", "default-src 'self'; img-src 'self' data:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
});
