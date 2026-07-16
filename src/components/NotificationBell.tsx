"use client";
import { useEffect, useState, useRef } from "react";
import { apiClient } from "@/lib/apiClient";
import { useSession } from "@/lib/useSession";

interface NotificationItem {
  id: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const session = useSession();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await apiClient.get<{ success: boolean; data: NotificationItem[] }>("/notifications");
      if (res.data && res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    if (session) {
      const timer = setTimeout(() => {
        fetchNotifications();
      }, 0);
      // Poll notifications list every 15 seconds
      const interval = setInterval(fetchNotifications, 15000);
      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }
  }, [session]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = async () => {
    const nextState = !open;
    setOpen(nextState);

    if (nextState && unreadCount > 0) {
      // Mark as read when opening dropdown
      try {
        await apiClient.post("/notifications/read");
        // Update local state to read
        setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
      } catch (err) {
        console.error("Failed to mark notifications as read:", err);
      }
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!session) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button Icon */}
      <button
        onClick={handleToggle}
        className="relative w-10 h-10 rounded-full flex items-center justify-center border border-hairline hover:shadow-airbnb hover:bg-surface-soft transition-all text-ink focus-visible:outline-none"
        aria-label="View notifications"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
        </svg>

        {/* Unread Indicator Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-rausch text-white rounded-full flex items-center justify-center text-[9px] font-extrabold animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown Menu */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-canvas border border-hairline rounded-[16px] shadow-airbnb py-2 z-50 animate-fade-up max-h-[380px] overflow-y-auto">
          <div className="px-4 py-2 border-b border-hairline-soft mb-1 flex items-center justify-between">
            <h4 className="text-xs font-bold text-ink uppercase tracking-wide">Notifications</h4>
            {unreadCount > 0 && (
              <span className="text-[10px] font-semibold text-rausch">{unreadCount} new</span>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-muted">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="mx-auto mb-2 text-muted/60"
              >
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
              </svg>
              No notifications yet.
            </div>
          ) : (
            <div className="divide-y divide-hairline-soft">
              {notifications.map((item) => (
                <div
                  key={item.id}
                  className={`px-4 py-3 text-xs transition-colors hover:bg-surface-soft ${
                    !item.read ? "bg-rausch/[0.02] font-medium" : "text-body"
                  }`}
                >
                  <p className="leading-snug">{item.content}</p>
                  <span className="text-[10px] text-muted block mt-1">
                    {new Date(item.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
