/**
 * Canonical Google Maps URL for the clinic.
 * Uses the official Google Maps Search universal URL which works seamlessly across all platforms
 * (iOS Safari, Android, Desktop, and installed PWAs) without the redirect failures of shortened
 * maps.app.goo.gl links on iPhone.
 */
export const CLINIC_ADDRESS =
  "610, Sector 10A, Gurugram, Haryana 122001, India";

export const CLINIC_MAP_URL =
  "https://www.google.com/maps/search/?api=1&query=28.4428974,77.0055494&query_place_id=ChIJDRLPTosXDTkRS80Q53yAx2Y";

/**
 * Handles clicking a map link reliably across all devices, specifically fixing iPhone & iOS PWA issues.
 * On iOS, WebKit standalone PWAs block `<a target="_blank">` and fail to resolve shortened dynamic links.
 * Directly dispatching navigation ensures iOS opens Google Maps or Safari.
 */
export function handleClinicMapClick(e?: React.MouseEvent<HTMLAnchorElement>) {
  if (typeof window === "undefined") return;

  const ua = window.navigator.userAgent || "";
  const isIOS =
    (/iPad|iPhone|iPod/.test(ua) ||
      (window.navigator.platform === "MacIntel" &&
        window.navigator.maxTouchPoints > 1)) &&
    !(window as any).MSStream;

  if (isIOS) {
    if (e) {
      e.preventDefault();
    }
    // On iOS (both Safari and standalone PWA), window.location.href ensures iOS hands off
    // to Google Maps app if installed, or cleanly opens Safari without target="_blank" blocking.
    window.location.href = CLINIC_MAP_URL;
  }
}
