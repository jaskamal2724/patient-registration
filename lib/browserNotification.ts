/**
 * Browser Notification Helper
 * Provides client-side and Service Worker notification capabilities
 * for Doctor Delay alerts and Queue Turn milestones.
 */

export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (!isNotificationSupported()) return "unsupported";
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (!isNotificationSupported()) return "unsupported";
  try {
    // Proactively register Service Worker in background while permission prompt displays
    if ("serviceWorker" in navigator) {
      getServiceWorkerRegistration().catch(() => {});
    }
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return Notification.permission;
  }
}

/**
 * Safely retrieves or registers a ServiceWorkerRegistration and ensures an ACTIVE worker is present.
 * W3C specification strictly requires registration.active !== null to call showNotification().
 */
export async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }

  try {
    let registration = await navigator.serviceWorker.getRegistration();

    // Check if current registration is dead (no active, installing, or waiting worker)
    // This happens if a previous worker crashed or failed to install
    if (registration && !registration.active && !registration.installing && !registration.waiting) {
      try {
        await registration.unregister();
        registration = undefined;
      } catch {}
    }

    if (!registration) {
      registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    }

    // If already has an active and activated worker, return immediately
    if (registration && registration.active && registration.active.state === "activated") {
      return registration;
    }

    // Prompt an update check to pick up the clean sw.js
    if (registration) {
      try {
        await registration.update();
      } catch {}
    }

    // Poll every 100ms for up to 3000ms until registration.active is activated
    const startTime = Date.now();
    while (Date.now() - startTime < 3000) {
      const current = await navigator.serviceWorker.getRegistration();
      if (current && current.active && current.active.state === "activated") {
        return current;
      }
      if (registration?.active && registration.active.state === "activated") {
        return registration;
      }
      await new Promise((res) => setTimeout(res, 100));
    }

    // Final fallback check on navigator.serviceWorker.ready
    const readyRegistration = await Promise.race<ServiceWorkerRegistration | null>([
      navigator.serviceWorker.ready.then((reg) => (reg.active ? reg : null)),
      new Promise<null>((res) => setTimeout(() => res(null), 1000)),
    ]);

    if (readyRegistration && readyRegistration.active) {
      return readyRegistration;
    }

    const latest = await navigator.serviceWorker.getRegistration();
    return latest && latest.active ? latest : null;
  } catch (swErr) {
    console.warn("ServiceWorker registration/lookup failed:", swErr);
    return null;
  }
}

export const NOTIFICATION_STORAGE_KEY = "doccare_notifications_enabled";

export function isNotificationEnabledInApp(): boolean {
  if (!isNotificationSupported()) return false;
  if (Notification.permission !== "granted") return false;

  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    if (stored !== null) {
      return stored === "true";
    }
  }
  return true; // Default to enabled once permission is granted
}

export function setNotificationEnabledInApp(enabled: boolean): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, enabled ? "true" : "false");
    window.dispatchEvent(
      new CustomEvent("doccare-notification-change", { detail: { enabled } })
    );
  }
}

interface NotificationPayload {
  title: string;
  body: string;
  tag?: string;
  url?: string;
  icon?: string;
  badge?: string;
  data?: Record<string, unknown>;
}

export async function sendBrowserNotification({
  title,
  body,
  tag,
  url = "/",
  icon = "/icon-192x192.png",
  badge = "/apple-touch-icon.png",
  data = {},
}: NotificationPayload): Promise<boolean> {
  if (!isNotificationSupported()) {
    console.warn("sendBrowserNotification: Notification API not supported");
    return false;
  }
  if (Notification.permission !== "granted") {
    console.warn("sendBrowserNotification: Notification.permission is not granted (current:", Notification.permission, ")");
    return false;
  }
  if (!isNotificationEnabledInApp()) {
    console.warn("sendBrowserNotification: Notifications are toggled off in app settings");
    return false;
  }

  // Resolve absolute URLs for icon/badge so mobile ServiceWorkers fetch cleanly across domains/ngrok
  const resolvedIcon =
    typeof window !== "undefined" && icon ? new URL(icon, window.location.href).href : icon;
  const resolvedBadge =
    typeof window !== "undefined" && badge ? new URL(badge, window.location.href).href : badge;

  const notificationOptions = {
    body,
    icon: resolvedIcon,
    badge: resolvedBadge,
    tag: tag || `doccare-${Date.now()}`,
    renotify: true,
    data: { url, ...data },
    vibrate: [200, 100, 200],
  } as unknown as NotificationOptions;

  try {
    // 1. Primary: Use Service Worker registration with an ACTIVE worker
    // Required on Chrome for Android, PWAs, and works seamlessly across modern browsers
    if ("serviceWorker" in navigator) {
      try {
        const registration = await getServiceWorkerRegistration();
        // Guard: Only execute showNotification if registration and an active worker exist
        if (registration && registration.active && typeof registration.showNotification === "function") {
          await registration.showNotification(title, notificationOptions);
          console.log("✅ Browser notification displayed via ServiceWorker:", title);
          return true;
        } else {
          console.warn("ServiceWorker active registration not ready yet. Registration state:", registration);
        }
      } catch (swErr) {
        console.warn("ServiceWorker showNotification failed, attempting fallback:", swErr);
      }
    }

    // 2. Secondary fallback: Direct Notification constructor (Desktop Safari, older desktop browsers)
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      try {
        const notification = new Notification(title, notificationOptions);
        notification.onclick = () => {
          window.focus();
          notification.close();
        };
        console.log("✅ Browser notification displayed via direct Notification constructor:", title);
        return true;
      } catch (constructorErr) {
        // On Android Chrome & some mobile browsers, new Notification() is forbidden
        console.warn(
          "Direct Notification constructor unsupported on this platform (Android requires active ServiceWorker):",
          constructorErr
        );
        return false;
      }
    }
    return false;
  } catch (error) {
    console.error("Failed to display notification:", error);
    return false;
  }
}

/**
 * Sends a self-test browser notification and returns user-friendly diagnosis
 */
export async function testBrowserNotification(): Promise<{ ok: boolean; message: string }> {
  if (!isNotificationSupported()) {
    return { ok: false, message: "Browser Notifications are not supported on this device/browser." };
  }

  if (Notification.permission === "denied") {
    return {
      ok: false,
      message: "Notifications are blocked in your browser. Tap the lock/tune icon in Chrome's URL bar to allow.",
    };
  }

  if (Notification.permission === "default") {
    const res = await requestNotificationPermission();
    if (res !== "granted") {
      return { ok: false, message: "Permission was not granted." };
    }
  }

  setNotificationEnabledInApp(true);
  const success = await sendBrowserNotification({
    title: "🔔 Doc Care Live Alert Test",
    body: "Notifications are working! You will receive live alerts when your turn approaches or doctor is running late.",
    tag: `test-${Date.now()}`,
    url: window.location.pathname || "/",
  });

  if (success) {
    return {
      ok: true,
      message: "Alert dispatched! Check your phone's notification bar (pull down from top of screen).",
    };
  } else {
    return {
      ok: false,
      message:
        "Could not trigger alert. On Android, please check: Phone Settings -> Apps -> Chrome -> Notifications -> Allow notifications.",
    };
  }
}

/**
 * Triggers a Doctor Delay browser notification
 */
export async function notifyDoctorDelay(delayMinutes: number): Promise<boolean> {
  if (delayMinutes <= 0) return false;

  const hours = Math.floor(delayMinutes / 60);
  const mins = delayMinutes % 60;
  const delayStr =
    hours > 0
      ? `${hours} hr${hours > 1 ? "s" : ""}${mins > 0 ? ` ${mins} min` : ""}`
      : `${mins} mins`;

  return sendBrowserNotification({
    title: "⚠️ Doctor Running Late Alert",
    body: `Doctor is running ~${delayStr} late today. Slot timings remain the same, but consultation may experience a slight delay.`,
    tag: `doctor-delay-${delayMinutes}`,
    url: "/patient",
  });
}

/**
 * Triggers Turn Milestone browser notification for a patient
 */
export async function notifyPatientTurn(
  tokenNumber: string | number,
  stage: "called" | "next" | "approaching_5" | "approaching_10",
  aheadCount: number,
): Promise<boolean> {
  let title = "";
  let body = "";

  switch (stage) {
    case "called":
      title = `🎉 It's Your Turn! (Token #${tokenNumber})`;
      body = "Doctor is ready for your consultation. Please enter the doctor's cabin now.";
      break;
    case "next":
      title = `⚡ You Are Next in Line! (Token #${tokenNumber})`;
      body = "Only 1 patient ahead of you. Please wait right outside the doctor's cabin.";
      break;
    case "approaching_5":
      title = `📍 5 Patients Ahead (Token #${tokenNumber})`;
      body = "Your turn is coming up soon. Please arrive at the clinic waiting lobby now.";
      break;
    case "approaching_10":
      title = `🚗 10 Patients Ahead (Token #${tokenNumber})`;
      body = "You have about 30-35 mins. Please start heading towards the clinic.";
      break;
  }

  return sendBrowserNotification({
    title,
    body,
    tag: `patient-turn-${tokenNumber}-${stage}`,
    url: "/patient",
    data: { aheadCount },
  });
}
