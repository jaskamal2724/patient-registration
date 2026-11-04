import type { Metadata, Viewport } from "next";
import "./globals.css";
import ErrorBoundary from "./components/ErrorBoundary";
import { LanguageProvider } from "@/lib/LanguageContext";
import BottomNavigation from "./components/BottomNavigation";

export const metadata: Metadata = {
  title: "Doc Care — Smart Patient Registration",
  description: "Streamlined OPD patient registration and queue management",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Doc Care",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1D68F3",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Capture beforeinstallprompt ASAP before React hydrates & register SW */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.__deferredPrompt = null;
              window.addEventListener('beforeinstallprompt', function(e) {
                e.preventDefault();
                window.__deferredPrompt = e;
              });
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(e) {
                    console.debug('SW registration skipped:', e);
                  });
                });
              }
            `,
          }}
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Doc Care" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icon-512x512.png" />
      </head>
      <body>
        <ErrorBoundary>
          <LanguageProvider>
            {children}
            <BottomNavigation />
          </LanguageProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}

