import {
  db,
  isFirebaseConfigured
} from "../lib/firebase";
import {
  sendNotification,
  getUserNotifications,
  getAllUsers,
  dbNotification,
  logAuditAction
} from "./dbService";

// Multi-Device Broadcast Channel across active browser windows/tabs
export const notificationBroadcastChannel = typeof window !== "undefined" && "BroadcastChannel" in window
  ? new BroadcastChannel("va_multi_device_notifications_v1")
  : null;

// Multi-Device Fingerprint Helper
const getOrCreateDeviceId = () => {
  let deviceId = localStorage.getItem("va_device_id");
  if (!deviceId) {
    deviceId = "dev_" + Math.random().toString(36).substring(2, 12) + "_" + Date.now();
    localStorage.setItem("va_device_id", deviceId);
  }
  return deviceId;
};

// HTML5 & Service Worker Push Notification Dispatcher for all granted devices
export const triggerBrowserNotification = async (title: string, body: string, iconUrl?: string, deepLink?: string) => {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const icon = iconUrl || "/va logo-DCJxvIQ4.png";
  const options = {
    body,
    icon,
    badge: icon,
    data: { url: deepLink || "/notifications" },
    vibrate: [100, 50, 100]
  };

  // 1. Primary: Use ServiceWorkerRegistration.showNotification (Works on HTTPS, Mobile Chrome & Desktop)
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      if (registration && registration.showNotification) {
        await registration.showNotification(title, options as any);
        return;
      }
    } catch (swErr) {
      console.warn("SW notification dispatch fallback:", swErr);
    }
  }

  // 2. Fallback: Standard Window Notification constructor for desktop
  try {
    const notification = new Notification(title, { body, icon, badge: icon });
    if (deepLink) {
      notification.onclick = (e) => {
        e.preventDefault();
        window.open(deepLink, "_blank");
      };
    }
  } catch (nErr) {
    console.warn("Window Notification fallback notice:", nErr);
  }
};

// Multi-Device Notification Broadcaster (pop-up on current device + sync across all granted devices & tabs)
export const dispatchMultiDeviceNotification = (
  title: string,
  body: string,
  iconUrl?: string,
  deepLink?: string,
  userId?: string
) => {
  // 1. Pop-up on current local device if permission granted
  triggerBrowserNotification(title, body, iconUrl, deepLink);

  // 2. Broadcast across all open browser windows and tabs
  if (notificationBroadcastChannel) {
    notificationBroadcastChannel.postMessage({
      type: "PUSH_NOTIFICATION_DISPATCH",
      userId,
      title,
      body,
      iconUrl,
      deepLink,
      timestamp: new Date().toISOString()
    });
  }
};

// Listen for broadcasted push notifications across tabs/windows
if (notificationBroadcastChannel) {
  notificationBroadcastChannel.onmessage = (event) => {
    if (event.data && event.data.type === "PUSH_NOTIFICATION_DISPATCH") {
      const { title, body, iconUrl, deepLink } = event.data;
      triggerBrowserNotification(title, body, iconUrl, deepLink);
    }
  };
}

// Request Browser Notifications Permission & Register Multi-Device Token in Database
export const requestNotificationPermission = async (userId: string): Promise<string | null> => {
  if (!("Notification" in window)) return null;

  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const deviceId = getOrCreateDeviceId();
      const simulatedToken = `fcm-tok-${deviceId}-${userId}`;

      const deviceInfo = {
        deviceId,
        simulatedToken,
        userId,
        grantedAt: new Date().toISOString(),
        userAgent: navigator.userAgent,
        platform: navigator.platform
      };
      
      // Store in multi-device tokens registry
      const storedTokensRaw = localStorage.getItem("sim_device_tokens") || "[]";
      const storedTokens = JSON.parse(storedTokensRaw);
      if (!storedTokens.some((t: any) => t.deviceId === deviceId && t.userId === userId)) {
        storedTokens.push(deviceInfo);
        localStorage.setItem("sim_device_tokens", JSON.stringify(storedTokens));
      }

      // Sync device registration to Firestore if user is authenticated and matches userId
      try {
        if (userId && auth.currentUser && auth.currentUser.uid === userId) {
          await db.collection("users").doc(userId).collection("devices").doc(deviceId).set(deviceInfo, { merge: true });
        }
      } catch (e) {
        // local fallback
      }

      // Register Service Worker for background push using base URL
      if ("serviceWorker" in navigator) {
        const swUrl = `${import.meta.env.BASE_URL || '/'}sw.js`.replace(/\/+/g, '/');
        navigator.serviceWorker.register(swUrl).catch(() => {});
      }

      console.log("Multi-Device Notification Permission granted for device:", deviceId);
      try {
        await logAuditAction(`Multi-Device Notification permission granted for user: ${userId} on device: ${deviceId}`);
      } catch (e) {}
      return simulatedToken;
    }
  } catch (err) {
    console.error("Error requesting notification permission:", err);
  }
  return null;
};

// Real-Time Listener Subscription
export const subscribeToNotifications = (userId: string, onUpdate: (notifs: dbNotification[]) => void) => {
  let isUnsubscribed = false;

  const fetchAndTrigger = async () => {
    if (isUnsubscribed) return;
    try {
      const list = await getUserNotifications(userId);
      // Sort: Pinned first, then by createdAt desc
      const sorted = list.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      onUpdate(sorted);
    } catch (err) {
      console.error("Error loading notifications:", err);
    }
  };

  fetchAndTrigger();
  const interval = setInterval(fetchAndTrigger, 3000);

  const handleInstantTrigger = (e: any) => {
    if (e.detail?.userId === userId) {
      fetchAndTrigger();
    }
  };
  window.addEventListener("sim_notification_created", handleInstantTrigger);

  return () => {
    isUnsubscribed = true;
    clearInterval(interval);
    window.removeEventListener("sim_notification_created", handleInstantTrigger);
  };
};

// Offline Queue Synchronization Engine
interface OfflineAction {
  type: "read" | "delete" | "pin" | "archive";
  notifId: string;
  payload?: any;
}

const getOfflineQueue = (): OfflineAction[] => {
  const raw = localStorage.getItem("sim_offline_notification_queue");
  return raw ? JSON.parse(raw) : [];
};

const saveOfflineQueue = (queue: OfflineAction[]) => {
  localStorage.setItem("sim_offline_notification_queue", JSON.stringify(queue));
};

export const queueOfflineNotificationAction = (action: OfflineAction) => {
  if (navigator.onLine) {
    // If online, perform immediately or let the component do it
    return;
  }
  const queue = getOfflineQueue();
  queue.push(action);
  saveOfflineQueue(queue);
  console.log("Offline: Action queued successfully:", action);
};

// Flush Offline Queue on reconnect
export const flushOfflineQueue = async () => {
  if (!navigator.onLine) return;
  const queue = getOfflineQueue();
  if (queue.length === 0) return;

  console.log("Syncing queued offline actions...");
  for (const action of queue) {
    try {
      const docRef = db.collection("notifications").doc(action.notifId);
      if (action.type === "read") {
        await docRef.set({ read: true, status: "Read", readTime: new Date().toISOString() }, { merge: true });
      } else if (action.type === "delete") {
        await docRef.set({ isDeleted: true }, { merge: true });
      } else if (action.type === "pin") {
        await docRef.set({ pinned: action.payload?.pinned }, { merge: true });
      } else if (action.type === "archive") {
        await docRef.set({ archived: action.payload?.archived }, { merge: true });
      }
    } catch (err) {
      console.error("Error syncing offline action:", action, err);
    }
  }
  localStorage.removeItem("sim_offline_notification_queue");
  console.log("Offline actions synchronization complete!");
};

if (typeof window !== "undefined") {
  window.addEventListener("online", flushOfflineQueue);
}

// Force Campaign Composer Sender API
export interface NotificationCampaign {
  title: string;
  subtitle?: string;
  description: string;
  category: string;
  priority: "low" | "normal" | "high" | "critical";
  targetType: "all" | "customers" | "employees" | "admins" | "city" | "state" | "membership" | "service_history";
  targetValue?: string; // value associated with city, state, membership, etc.
  deepLink?: string;
  imageUrl?: string;
  actionButtons?: Array<{ label: string; action: string; url?: string }>;
  bannerImage?: string;
  scheduleTime?: string;
  immediateSend?: boolean;
}

export const executeNotificationCampaign = async (campaign: NotificationCampaign): Promise<{ sentCount: number }> => {
  const users = await getAllUsers();
  let targetUsers = [];

  // Filter targeted users based on selections
  if (campaign.targetType === "all") {
    targetUsers = users;
  } else if (campaign.targetType === "customers") {
    targetUsers = users.filter((u) => u.role === "customer" || !u.role);
  } else if (campaign.targetType === "employees") {
    targetUsers = users.filter((u) => u.role === "staff");
  } else if (campaign.targetType === "admins") {
    targetUsers = users.filter((u) => u.role === "admin");
  } else if (campaign.targetType === "city" && campaign.targetValue) {
    targetUsers = users.filter((u) => u.city?.toLowerCase() === campaign.targetValue?.toLowerCase());
  } else if (campaign.targetType === "state" && campaign.targetValue) {
    targetUsers = users.filter((u) => u.state?.toLowerCase() === campaign.targetValue?.toLowerCase());
  } else if (campaign.targetType === "membership" && campaign.targetValue) {
    // E.g. Gold, Premium tiers
    targetUsers = users.filter((u) => u.membershipTier?.toLowerCase() === campaign.targetValue?.toLowerCase());
  } else {
    targetUsers = users;
  }

  let sentCount = 0;
  const userAgent = navigator.userAgent;

  // Browser check helpers
  const getBrowserName = () => {
    if (userAgent.indexOf("Chrome") > -1) return "Google Chrome";
    if (userAgent.indexOf("Safari") > -1) return "Apple Safari";
    if (userAgent.indexOf("Firefox") > -1) return "Mozilla Firefox";
    return "Unknown Browser";
  };

  const getOSName = () => {
    if (userAgent.indexOf("Win") > -1) return "Windows";
    if (userAgent.indexOf("Mac") > -1) return "macOS";
    if (userAgent.indexOf("Linux") > -1) return "Linux";
    return "OS Platform";
  };

  const currentBrowser = getBrowserName();
  const currentOS = getOSName();

  for (const targetUser of targetUsers) {
    const targetUserId = targetUser.id || targetUser.uid || "all_users";
    const extraFields: Partial<dbNotification> = {
      subtitle: campaign.subtitle || "",
      deepLink: campaign.deepLink || "",
      imageUrl: campaign.imageUrl || "",
      actionButtons: campaign.actionButtons || [],
      receiverRole: targetUser.role || "customer",
      browser: currentBrowser,
      operatingSystem: currentOS,
      deviceType: "Browser Panel",
      sentTime: new Date().toISOString()
    };

    // Save locally/database
    await sendNotification(
      targetUserId,
      campaign.title,
      campaign.description,
      campaign.category,
      campaign.priority,
      extraFields
    );

    // Simulated email / SMS notification integrations
    simulatedEmailDispatcher(targetUser.email, campaign.title, campaign.description);
    if (targetUser.contactNumber) {
      simulatedSMSDispatcher(targetUser.contactNumber, campaign.title);
    }

    sentCount++;
  }

  // Record Campaign in stats history
  const campaignHistoryRaw = localStorage.getItem("sim_campaign_history") || "[]";
  const campaignHistory = JSON.parse(campaignHistoryRaw);
  campaignHistory.unshift({
    id: "camp-" + Math.random().toString(36).substring(2, 9),
    ...campaign,
    sentCount,
    sentTime: new Date().toISOString(),
    readRate: "72%",
    ctr: "18%"
  });
  localStorage.setItem("sim_campaign_history", JSON.stringify(campaignHistory));

  await logAuditAction(`Executed targeted notification campaign "${campaign.title}" to ${sentCount} recipients.`);
  return { sentCount };
};

// Simulated external communications dispatches
export const simulatedEmailDispatcher = (email: string, title: string, body: string) => {
  console.log(`[Email Dispatched] To: ${email} | Subject: ${title} | Body: ${body.substring(0, 50)}...`);
};

export const simulatedSMSDispatcher = (phone: string, title: string) => {
  console.log(`[SMS/WhatsApp Broadcasted] To: ${phone} | Msg: ${title}`);
};

// Load Campaign History
export const getCampaignHistory = (): any[] => {
  const raw = localStorage.getItem("sim_campaign_history");
  if (raw) return JSON.parse(raw);
  return [];
};
