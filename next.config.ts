import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";
import fs from "node:fs";
import path from "node:path";

// In development, ensure public/sw.js is clean so stale production build chunks don't 404 and fail SW activation
if (process.env.NODE_ENV === "development") {
  const swPath = path.join(process.cwd(), "public", "sw.js");
  if (!fs.existsSync(swPath) || fs.readFileSync(swPath, "utf8").includes("precacheEntries")) {
    const devSw = `// Development Service Worker for Doc Care
self.addEventListener("install", (e) => { self.skipWaiting(); });
self.addEventListener("activate", (e) => { e.waitUntil(self.clients.claim()); });
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = e.notification.data?.url || "/";
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
`;
    try {
      fs.writeFileSync(swPath, devSw, "utf8");
    } catch {
      // ignore
    }
  }
}

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  devIndicators: false,
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "1mb",
    },
  },
  allowedDevOrigins: ["192.168.1.12"],
};

export default withSerwist(nextConfig);
