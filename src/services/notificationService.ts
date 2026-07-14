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

// HTML5 Notification Helper
export const triggerBrowserNotification = (title: string, body: string, iconUrl?: string, deepLink?: string) => {
  if (!("Notification" in window)) return;
  if (Notification.permission === "granted") {
    const icon = iconUrl || "/va logo-DCJxvIQ4.png";
    const notification = new Notification(title, {
      body,
      icon,
      badge: icon
    });
    if (deepLink) {
      notification.onclick = (e) => {
        e.preventDefault();
        window.open(deepLink, "_blank");
      };
    }
  }
};

// Request Browser Notifications Permission & Register Device Token
export const requestNotificationPermission = async (userId: string): Promise<string | null> => {
  if (!("Notification" in window)) return null;

  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      // Simulate/register device FCM token
      const simulatedToken = "fcm-tok-" + Math.random().toString(36).substring(2, 15) + "-" + userId;
      
      // Store in simulator device tokens registry
      const storedTokensRaw = localStorage.getItem("sim_device_tokens") || "[]";
      const storedTokens = JSON.parse(storedTokensRaw);
      if (!storedTokens.includes(simulatedToken)) {
        storedTokens.push(simulatedToken);
        localStorage.setItem("sim_device_tokens", JSON.stringify(storedTokens));
      }
      
      console.log("FCM Device Token registered successfully:", simulatedToken);
      await logAuditAction(`Device token registered for user: ${userId}`);
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
    const extraFields: Partial<dbNotification> = {
      subtitle: campaign.subtitle,
      deepLink: campaign.deepLink,
      imageUrl: campaign.imageUrl,
      actionButtons: campaign.actionButtons,
      receiverRole: targetUser.role || "customer",
      browser: currentBrowser,
      operatingSystem: currentOS,
      deviceType: "Browser Panel",
      sentTime: new Date().toISOString()
    };

    // Save locally/database
    await sendNotification(
      targetUser.id,
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

  // default seed data for dashboards
  const defaults = [
    {
      id: "camp-default-1",
      title: "Weekend Foam Wash Offer!",
      subtitle: "Get flat 20% off",
      description: "Book any detailing squad foam wash session this Saturday or Sunday and apply coupon WEEKEND20 at checkout.",
      category: "Offers",
      priority: "normal",
      targetType: "customers",
      sentCount: 22,
      sentTime: "2026-07-10T10:00:00.000Z",
      readRate: "86%",
      ctr: "24%"
    },
    {
      id: "camp-default-2",
      title: "Emergency Squad Rerouting",
      subtitle: "Severe Weather Warning",
      description: "Severe rain advisory. Detailing crews in Dwarka are advised to seek temporary shelter until 2 PM.",
      category: "Emergency",
      priority: "critical",
      targetType: "employees",
      sentCount: 3,
      sentTime: "2026-07-08T08:15:00.000Z",
      readRate: "100%",
      ctr: "66%"
    }
  ];
  localStorage.setItem("sim_campaign_history", JSON.stringify(defaults));
  return defaults;
};
