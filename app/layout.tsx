import type { Metadata } from "next";
import "./globals.css";
import ErrorBoundary from "./components/ErrorBoundary";

export const metadata: Metadata = {
  title: "MediQueue — Smart Patient Registration",
  description: "Streamlined OPD patient registration and queue management",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
