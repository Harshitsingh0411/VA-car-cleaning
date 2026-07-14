import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Bell,
  CheckCircle,
  Pin,
  Archive,
  Trash2,
  Search,
  SlidersHorizontal,
  ArrowLeft,
  Clock,
  Sparkles,
  WifiOff,
  Inbox,
  AlertTriangle,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import {
  subscribeToNotifications,
  queueOfflineNotificationAction
} from "../services/notificationService";
import {
  markNotificationRead,
  pinNotification,
  archiveNotification,
  deleteNotification,
  markAllNotificationsAsRead,
  dbNotification
} from "../services/dbService";

export default function NotificationCenter() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<dbNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "unread" | "pinned" | "archived">("all");
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    // Monitor connection status
    const updateOnlineStatus = () => setIsOffline(!navigator.onLine);
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    if (!user) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToNotifications(user.uid, (data) => {
      setNotifications(data);
      setLoading(false);
    });

    return () => {
      unsubscribe();
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, [user]);

  // Actions
  const handleMarkRead = async (id: string) => {
    if (isOffline) {
      queueOfflineNotificationAction({ type: "read", notifId: id });
      // Optimistic update
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true, status: "Read" } : n));
      return;
    }
    await markNotificationRead(id);
  };

  const handlePin = async (id: string, currentPinned: boolean) => {
    const nextPinned = !currentPinned;
    if (isOffline) {
      queueOfflineNotificationAction({ type: "pin", notifId: id, payload: { pinned: nextPinned } });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, pinned: nextPinned } : n));
      return;
    }
    await pinNotification(id, nextPinned);
  };

  const handleArchive = async (id: string, currentArchived: boolean) => {
    const nextArchived = !currentArchived;
    if (isOffline) {
      queueOfflineNotificationAction({ type: "archive", notifId: id, payload: { archived: nextArchived } });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, archived: nextArchived } : n));
      return;
    }
    await archiveNotification(id, nextArchived);
  };

  const handleDelete = async (id: string) => {
    if (isOffline) {
      queueOfflineNotificationAction({ type: "delete", notifId: id });
      setNotifications(prev => prev.filter(n => n.id !== id));
      return;
    }
    await deleteNotification(id);
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    if (isOffline) {
      alert("Marking all read is disabled when offline!");
      return;
    }
    await markAllNotificationsAsRead(user.uid);
  };

  // Filtering
  const categoriesList = ["All", ...Array.from(new Set(notifications.map(n => n.type).filter(Boolean)))];

  const filteredNotifications = notifications.filter(n => {
    // 1. Search Query
    const query = searchQuery.toLowerCase();
    const matchesSearch = n.title.toLowerCase().includes(query) || n.description.toLowerCase().includes(query);

    // 2. Category Tab
    const matchesCategory = selectedCategory === "All" || n.type === selectedCategory;

    // 3. Status Filters
    let matchesFilter = true;
    if (selectedFilter === "unread") matchesFilter = !n.read;
    else if (selectedFilter === "pinned") matchesFilter = !!n.pinned;
    else if (selectedFilter === "archived") matchesFilter = !!n.archived;
    else matchesFilter = !n.archived; // Default 'all' hides archived ones by standard usability rules!

    return matchesSearch && matchesCategory && matchesFilter;
  });

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-rose-500 text-white";
      case "high": return "bg-rose-50 text-rose-600 border border-rose-100";
      case "normal": return "bg-blue-50 text-blue-600 border border-blue-100";
      default: return "bg-gray-50 text-gray-500 border border-gray-100";
    }
  };

  return (
    <div className="pt-24 min-h-screen bg-[#F8FAFC] pb-24 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-4xl space-y-6">
        
        {/* Header toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-400 hover:text-dark cursor-pointer"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-xl font-heading font-extrabold text-dark tracking-tight">Notification Center</h1>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">VA System Dispatch Messages</p>
            </div>
          </div>

          <div className="flex gap-2 items-center">
            {isOffline && (
              <span className="bg-amber-50 text-amber-600 text-[10px] font-bold px-3 py-1.5 rounded-xl border border-amber-100 flex items-center gap-1">
                <WifiOff size={12} />
                Offline Mode
              </span>
            )}
            {notifications.filter(n => !n.read && !n.archived).length > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="bg-primary hover:bg-[#0b327b] text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
              >
                <CheckCircle size={14} />
                Mark all read
              </button>
            )}
          </div>
        </div>

        {/* Filters and search */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Search */}
          <div className="md:col-span-6 relative">
            <input
              type="text"
              placeholder="Search alerts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-100 rounded-2xl py-3 pl-10 pr-4 text-xs font-semibold text-dark focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
            />
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          {/* Type filters */}
          <div className="md:col-span-6 flex gap-1.5 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm text-xs font-bold text-gray-400">
            <button
              onClick={() => setSelectedFilter("all")}
              className={`flex-1 py-2 text-center rounded-xl cursor-pointer transition-all ${
                selectedFilter === "all" ? "bg-primary text-white" : "hover:bg-gray-50"
              }`}
            >
              Inbox
            </button>
            <button
              onClick={() => setSelectedFilter("unread")}
              className={`flex-1 py-2 text-center rounded-xl cursor-pointer transition-all ${
                selectedFilter === "unread" ? "bg-primary text-white" : "hover:bg-gray-50"
              }`}
            >
              Unread
            </button>
            <button
              onClick={() => setSelectedFilter("pinned")}
              className={`flex-1 py-2 text-center rounded-xl cursor-pointer transition-all ${
                selectedFilter === "pinned" ? "bg-primary text-white" : "hover:bg-gray-50"
              }`}
            >
              Pinned
            </button>
            <button
              onClick={() => setSelectedFilter("archived")}
              className={`flex-1 py-2 text-center rounded-xl cursor-pointer transition-all ${
                selectedFilter === "archived" ? "bg-primary text-white" : "hover:bg-gray-50"
              }`}
            >
              Archived
            </button>
          </div>
        </div>

        {/* Category horizontal scrolling tabs */}
        {categoriesList.length > 2 && (
          <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
            {categoriesList.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`py-1.5 px-4 rounded-full text-xs font-bold uppercase tracking-wider border shrink-0 transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-[#F4B400] text-dark border-[#F4B400] font-black"
                    : "bg-white text-gray-500 border-gray-100 hover:bg-gray-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Messages List Container */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm min-h-[300px] flex flex-col justify-between">
          {loading ? (
            <div className="flex justify-center items-center py-20 flex-1">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-20 flex-1 flex flex-col justify-center items-center space-y-3">
              <Inbox size={42} className="text-gray-300" />
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">No notifications found</p>
                <p className="text-[10px] text-gray-400 mt-1">Your inbox is clean of any matching messages.</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`py-5 flex gap-4 first:pt-0 last:pb-0 transition-all ${
                    !notif.read ? "bg-[#0b327b]/2 p-3 rounded-2xl border-l-2 border-primary" : ""
                  }`}
                >
                  {/* Left priority tag or icon */}
                  <div className="shrink-0">
                    <span className={`text-[8px] font-black uppercase py-1 px-2.5 rounded-full ${getPriorityStyle(notif.priority)}`}>
                      {notif.priority}
                    </span>
                  </div>

                  {/* Body details */}
                  <div className="flex-1 space-y-2">
                    <div className="space-y-1">
                      <div className="flex justify-between items-start gap-3">
                        <h3 className="font-heading font-extrabold text-dark text-sm leading-snug">{notif.title}</h3>
                        <div className="flex gap-1.5 shrink-0 text-gray-400">
                          <button
                            onClick={() => handlePin(notif.id, !!notif.pinned)}
                            className={`p-1 hover:text-primary transition-colors cursor-pointer ${
                              notif.pinned ? "text-primary fill-primary/10" : ""
                            }`}
                            title={notif.pinned ? "Unpin alert" : "Pin alert"}
                          >
                            <Pin size={13} className={notif.pinned ? "rotate-45" : ""} />
                          </button>
                          <button
                            onClick={() => handleArchive(notif.id, !!notif.archived)}
                            className={`p-1 hover:text-[#F4B400] transition-colors cursor-pointer ${
                              notif.archived ? "text-[#F4B400]" : ""
                            }`}
                            title={notif.archived ? "Unarchive alert" : "Archive alert"}
                          >
                            <Archive size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(notif.id)}
                            className="p-1 hover:text-rose-500 transition-colors cursor-pointer"
                            title="Delete alert"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                      {notif.subtitle && <h4 className="text-xs font-bold text-gray-500 leading-snug">{notif.subtitle}</h4>}
                      <p className="text-xs text-gray-500 leading-relaxed font-medium">{notif.description}</p>
                    </div>

                    {/* Image banner block */}
                    {notif.imageUrl && (
                      <div className="max-w-md rounded-2xl overflow-hidden border border-gray-100 shadow-sm max-h-40">
                        <img src={notif.imageUrl} alt="Banner" className="w-full h-full object-cover" />
                      </div>
                    )}

                    {/* Metadata & Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      <div className="flex items-center gap-3">
                        <span className="bg-gray-100 text-gray-500 py-0.5 px-2.5 rounded-full text-[9px]">
                          {notif.type}
                        </span>
                        <div className="flex items-center gap-1">
                          <Clock size={12} className="text-gray-400" />
                          <span>{new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {!notif.read && (
                          <button
                            onClick={() => handleMarkRead(notif.id)}
                            className="text-primary hover:underline cursor-pointer"
                          >
                            Mark Read
                          </button>
                        )}
                        {notif.deepLink && (
                          <a
                            href={notif.deepLink}
                            className="text-[#F4B400] hover:underline flex items-center gap-0.5"
                          >
                            Go to Link
                            <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
