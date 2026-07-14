import React, { useState, useEffect } from "react";
import {
  Send,
  Calendar,
  Save,
  Eye,
  Copy,
  Users,
  Shield,
  FileText,
  Clock,
  TrendingUp,
  Mail,
  Smartphone,
  CheckCircle,
  AlertTriangle,
  Play
} from "lucide-react";
import {
  executeNotificationCampaign,
  getCampaignHistory,
  triggerBrowserNotification
} from "../../services/notificationService";
import { getAllUsers, logAuditAction } from "../../services/dbService";

export default function NotificationCenterTab() {
  const [usersList, setUsersList] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [drafts, setDrafts] = useState<any[]>([]);

  // Composer Form States
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("System");
  const [priority, setPriority] = useState<"low" | "normal" | "high" | "critical">("normal");
  const [targetType, setTargetType] = useState<any>("all");
  const [targetValue, setTargetValue] = useState("");
  const [deepLink, setDeepLink] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [immediateSend, setImmediateSend] = useState(true);

  // Status Alerts
  const [sentSuccessAlert, setSentSuccessAlert] = useState<{ count: number } | null>(null);
  const [draftSuccessAlert, setDraftSuccessAlert] = useState(false);

  useEffect(() => {
    // Load directories
    getAllUsers().then(setUsersList).catch(err => console.error("Error loading users:", err));
    setHistory(getCampaignHistory());
    
    const savedDrafts = localStorage.getItem("sim_campaign_drafts");
    if (savedDrafts) setDrafts(JSON.parse(savedDrafts));
  }, []);

  const handleSendNow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      alert("Please enter title and description!");
      return;
    }

    const payload = {
      title,
      subtitle,
      description,
      category,
      priority,
      targetType,
      targetValue: targetType === "selected_user" ? targetValue : targetValue,
      deepLink,
      imageUrl,
      scheduleTime: immediateSend ? undefined : scheduleTime,
      immediateSend
    };

    const res = await executeNotificationCampaign(payload);
    setSentSuccessAlert({ count: res.sentCount });
    setHistory(getCampaignHistory());
    
    // Reset composer form
    setTitle("");
    setSubtitle("");
    setDescription("");
    setDeepLink("");
    setImageUrl("");
    setTimeout(() => setSentSuccessAlert(null), 4000);
  };

  const handleSaveDraft = () => {
    if (!title) return;
    const newDraft = {
      id: "draft-" + Math.random().toString(36).substring(2, 9),
      title,
      subtitle,
      description,
      category,
      priority,
      targetType,
      targetValue,
      deepLink,
      imageUrl,
      createdAt: new Date().toISOString()
    };
    const updatedDrafts = [newDraft, ...drafts];
    setDrafts(updatedDrafts);
    localStorage.setItem("sim_campaign_drafts", JSON.stringify(updatedDrafts));
    
    setDraftSuccessAlert(true);
    setTimeout(() => setDraftSuccessAlert(false), 3000);
  };

  const handleLoadDraft = (draft: any) => {
    setTitle(draft.title || "");
    setSubtitle(draft.subtitle || "");
    setDescription(draft.description || "");
    setCategory(draft.category || "System");
    setPriority(draft.priority || "normal");
    setTargetType(draft.targetType || "all");
    setTargetValue(draft.targetValue || "");
    setDeepLink(draft.deepLink || "");
    setImageUrl(draft.imageUrl || "");
  };

  const handleDeleteDraft = (id: string) => {
    const updated = drafts.filter(d => d.id !== id);
    setDrafts(updated);
    localStorage.setItem("sim_campaign_drafts", JSON.stringify(updated));
  };

  const handlePreview = () => {
    triggerBrowserNotification(
      `[Preview] ${title || "Notification Title"}`,
      description || "Enter description to preview the full HTML push card.",
      imageUrl,
      deepLink
    );
  };

  const handleDuplicate = (camp: any) => {
    setTitle(camp.title || "");
    setSubtitle(camp.subtitle || "");
    setDescription(camp.description || "");
    setCategory(camp.category || "System");
    setPriority(camp.priority || "normal");
    setTargetType(camp.targetType || "all");
    setTargetValue(camp.targetValue || "");
    setDeepLink(camp.deepLink || "");
    setImageUrl(camp.imageUrl || "");
  };

  // Stats calculation
  const totalSentCount = history.reduce((sum, item) => sum + item.sentCount, 0);

  return (
    <div className="space-y-6">
      
      {/* Analytics widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-gray-100 rounded-3xl shadow-sm">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Total Force Broadcasts</span>
          <div className="text-2xl font-black text-dark leading-none">{history.length}</div>
        </div>
        <div className="p-5 bg-white border border-gray-100 rounded-3xl shadow-sm">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Total Alerts Delivered</span>
          <div className="text-2xl font-black text-dark leading-none">{totalSentCount}</div>
        </div>
        <div className="p-5 bg-white border border-gray-100 rounded-3xl shadow-sm">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Delivered Rate</span>
          <div className="text-2xl font-black text-emerald-500 leading-none">99.8%</div>
        </div>
        <div className="p-5 bg-white border border-gray-100 rounded-3xl shadow-sm">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Average CTR (CTR)</span>
          <div className="text-2xl font-black text-primary leading-none">21%</div>
        </div>
      </div>

      {/* Composer Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Force Composer form */}
        <form onSubmit={handleSendNow} className="lg:col-span-8 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-5">
          <h3 className="font-heading font-extrabold text-dark text-base flex items-center gap-2">
            <Send size={18} className="text-primary" />
            Notification Campaign Composer
          </h3>

          {sentSuccessAlert && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl text-xs font-bold flex items-center gap-2">
              <CheckCircle size={16} />
              <span>Broadcast dispatched successfully to {sentSuccessAlert.count} matching targets!</span>
            </div>
          )}

          {draftSuccessAlert && (
            <div className="p-4 bg-blue-50 border border-blue-100 text-primary rounded-2xl text-xs font-bold flex items-center gap-2">
              <Save size={16} />
              <span>Composer settings saved successfully to local drafts registry!</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Target Audience Segment */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Target Audience Segment</label>
              <div className="flex flex-col md:flex-row gap-2">
                <select
                  value={targetType}
                  onChange={(e) => setTargetType(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 font-semibold text-dark text-xs focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer w-full md:w-64"
                >
                  <option value="all">All Registered Users</option>
                  <option value="customers">All Customers (role=customer)</option>
                  <option value="employees">Detailing Crew (role=staff)</option>
                  <option value="admins">System Admins (role=admin)</option>
                  <option value="city">Users by City</option>
                  <option value="state">Users by State</option>
                  <option value="membership">Users by Membership Tier</option>
                  <option value="selected_user">Selected Specific User</option>
                </select>

                {/* Sub value depending on selection */}
                {targetType === "selected_user" && (
                  <select
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    required
                    className="bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 font-semibold text-dark text-xs focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer flex-1"
                  >
                    <option value="">Select a user...</option>
                    {usersList.map((u) => (
                      <option key={u.id} value={u.id}>{u.name || u.email} ({u.role || "customer"})</option>
                    ))}
                  </select>
                )}

                {(targetType === "city" || targetType === "state" || targetType === "membership") && (
                  <input
                    type="text"
                    required
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    placeholder={`Enter targeted ${targetType}...`}
                    className="bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 font-semibold text-dark text-xs focus:outline-none focus:ring-2 focus:ring-primary flex-1"
                  />
                )}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Notification Title (Emojis supported 🚀)</label>
              <input
                type="text"
                required
                placeholder="e.g. ⚡ Limited Time Detailing Discount!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 font-semibold text-dark text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
              />
            </div>

            {/* Subtitle */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Subtitle / Short description</label>
              <input
                type="text"
                placeholder="e.g. Save flat 20% off today only"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 font-semibold text-dark text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Category Tag</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 font-semibold text-dark text-xs focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              >
                <option value="System">System Announcements</option>
                <option value="Booking">Booking Alerts</option>
                <option value="Payments">Payments & Billing</option>
                <option value="Offers">Promotional Offers</option>
                <option value="Emergency">Emergency Broadcasts</option>
                <option value="Security">Security & Access</option>
              </select>
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Delivery Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 font-semibold text-dark text-xs focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              >
                <option value="low">Low (Silent delivery)</option>
                <option value="normal">Normal (Standard Push card)</option>
                <option value="high">High (Immediate pop-up)</option>
                <option value="critical">Critical (🚨 Bypasses silent filters)</option>
              </select>
            </div>

            {/* Banner Image URL */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Large Image Banner URL (Optional)</label>
              <input
                type="url"
                placeholder="e.g. https://images.unsplash.com/photo-example"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 font-semibold text-dark text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all font-mono"
              />
            </div>

            {/* Deep Link URL */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Deep Link URL (On Click Action)</label>
              <input
                type="text"
                placeholder="e.g. /account or /book?service=foam-wash"
                value={deepLink}
                onChange={(e) => setDeepLink(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 font-semibold text-dark text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all font-mono"
              />
            </div>

            {/* Message Description */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Alert Message Description (Rich Text/Emojis supported)</label>
              <textarea
                required
                rows={3}
                placeholder="Write the full notification description content here..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 font-semibold text-dark text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all resize-none"
              />
            </div>

            {/* Timing options */}
            <div className="space-y-3 md:col-span-2 border-t border-gray-100 pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    checked={immediateSend}
                    onChange={() => setImmediateSend(true)}
                    className="accent-primary"
                  />
                  Send Now (Immediate Broadcast)
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    checked={!immediateSend}
                    onChange={() => setImmediateSend(false)}
                    className="accent-primary"
                  />
                  Schedule Campaign
                </label>
              </div>

              {!immediateSend && (
                <input
                  type="datetime-local"
                  required
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-2 font-semibold text-dark text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                />
              )}
            </div>

          </div>

          <div className="flex flex-wrap gap-2.5 pt-4 border-t border-gray-100">
            <button
              type="submit"
              className="bg-primary hover:bg-[#0b327b] text-white font-bold py-2.5 px-5 rounded-xl text-xs uppercase tracking-wider shadow cursor-pointer transition-all flex items-center gap-1.5"
            >
              <Play size={13} />
              {immediateSend ? "Dispatch Now" : "Schedule Campaign"}
            </button>
            <button
              type="button"
              onClick={handleSaveDraft}
              className="border border-gray-200 text-gray-500 hover:bg-gray-50 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Save size={13} />
              Save Draft
            </button>
            <button
              type="button"
              onClick={handlePreview}
              className="border border-gray-200 text-gray-500 hover:bg-gray-50 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Eye size={13} />
              Send Live Test
            </button>
          </div>
        </form>

        {/* Drafts Sidebar */}
        <div className="lg:col-span-4 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm h-fit space-y-4">
          <h4 className="font-heading font-extrabold text-dark text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-3">
            <FileText size={14} className="text-gray-400" />
            Saved drafts ({drafts.length})
          </h4>

          {drafts.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No campaign drafts saved yet.</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {drafts.map((d) => (
                <div key={d.id} className="p-3.5 border border-gray-100 bg-gray-50/20 rounded-xl space-y-2 hover:border-primary/20 transition-all text-xs font-semibold text-gray-600">
                  <div className="flex justify-between items-start">
                    <h5 className="font-bold text-dark truncate max-w-[120px]">{d.title}</h5>
                    <div className="flex gap-1.5 text-[10px]">
                      <button
                        onClick={() => handleLoadDraft(d)}
                        className="text-primary hover:underline cursor-pointer"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => handleDeleteDraft(d.id)}
                        className="text-rose-500 hover:underline cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed">{d.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Campaigns History */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-5">
        <h3 className="font-heading font-extrabold text-dark text-base flex items-center gap-2">
          <Clock size={18} className="text-[#F4B400]" />
          Campaign Dispatch History
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-500 border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                <th className="pb-3 pr-4">Sent Time</th>
                <th className="pb-3 pr-4">Campaign Title</th>
                <th className="pb-3 pr-4">Category</th>
                <th className="pb-3 pr-4">Audience Segment</th>
                <th className="pb-3 pr-4">Audience Size</th>
                <th className="pb-3 pr-4">Read Rate</th>
                <th className="pb-3 pr-4">CTR</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {history.map((camp, idx) => (
                <tr key={camp.id || idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 pr-4 font-mono text-gray-400">
                    {new Date(camp.sentTime).toLocaleString()}
                  </td>
                  <td className="py-4 pr-4 text-dark font-extrabold">{camp.title}</td>
                  <td className="py-4 pr-4">
                    <span className="bg-gray-100 text-gray-500 py-0.5 px-2.5 rounded-full text-[9px] font-bold uppercase">
                      {camp.category}
                    </span>
                  </td>
                  <td className="py-4 pr-4 font-bold text-gray-600 uppercase tracking-wider">{camp.targetType}</td>
                  <td className="py-4 pr-4 font-mono font-bold text-dark">{camp.sentCount}</td>
                  <td className="py-4 pr-4 font-mono text-emerald-500 font-extrabold">{camp.readRate}</td>
                  <td className="py-4 pr-4 font-mono text-primary font-extrabold">{camp.ctr}</td>
                  <td className="py-4">
                    <button
                      onClick={() => handleDuplicate(camp)}
                      className="text-primary hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                    >
                      <Copy size={12} />
                      Clone
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
