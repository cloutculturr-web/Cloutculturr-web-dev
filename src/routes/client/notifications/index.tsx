import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { RefreshCw, AlertCircle, CheckCheck } from "lucide-react";
import { useNotifications } from "@/hooks/useClientAPI";
import { notificationsAPI } from "@/services/api";

export const Route = createFileRoute("/client/notifications/")({
  component: ClientNotifications,
});

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function ClientNotifications() {
  const { data, loading, error, refetch } = useNotifications(true);
  const notifications = Array.isArray(data) ? data : [];
  const [actionError, setActionError] = useState<string | null>(null);

  const handleMarkRead = async (id: string) => {
    try {
      setActionError(null);
      await notificationsAPI.markAsRead(id);
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to mark as read");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setActionError(null);
      await notificationsAPI.markAllAsRead();
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to mark all as read");
    }
  };

  const unreadCount = notifications.filter((n: any) => n.status === "unread").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-1">{unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => refetch()} disabled={loading} className="p-2 hover:bg-card rounded-lg border border-border disabled:opacity-50">
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm hover:bg-background">
              <CheckCheck className="w-4 h-4" /> Mark all as read
            </button>
          )}
        </div>
      </div>

      {actionError && <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-sm text-red-500">{actionError}</div>}

      {loading && !data && (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading notifications...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-500">Unable to load notifications</p>
            <p className="text-sm text-red-500/80">{error}</p>
          </div>
        </div>
      )}

      {data && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {notifications.length > 0 ? (
            <div className="divide-y divide-border">
              {notifications.map((n: any) => (
                <div key={n._id} className={`p-4 flex items-start gap-3 ${n.status === "unread" ? "bg-primary/5" : ""}`}>
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${n.status === "unread" ? "bg-primary" : "bg-transparent"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-sm text-muted-foreground">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                  {n.status === "unread" && (
                    <button onClick={() => handleMarkRead(n._id)} className="text-xs text-primary hover:underline flex-shrink-0">
                      Mark as read
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-muted-foreground">No notifications yet.</div>
          )}
        </div>
      )}
    </div>
  );
}
