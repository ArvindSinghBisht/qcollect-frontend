"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState, SkeletonLines } from "@/components/common/State";
import { deleteNotification, getNotifications, markAllNotificationsRead, markNotificationRead } from "@/services/notification.service";
import { getErrorMessage, unwrapApiData } from "@/lib/api-response";

interface NotificationItem { id: string; title?: string; message?: string; type?: string; read?: boolean; createdAt?: string; }

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadNotifications(); }, []);

  async function loadNotifications() {
    try {
      setLoading(true);
      const response = await getNotifications();
      setItems(unwrapApiData<NotificationItem[]>(response, []));
    } catch (error) {
      toast.info("Notifications API returned no data yet");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  async function markRead(id: string) {
    try { await markNotificationRead(id); toast.success("Marked as read"); loadNotifications(); } catch (error) { toast.error(getErrorMessage(error, "Failed to mark read")); }
  }
  async function markAll() {
    try { await markAllNotificationsRead(); toast.success("All marked read"); loadNotifications(); } catch (error) { toast.error(getErrorMessage(error, "Failed to mark all read")); }
  }
  async function remove(id: string) {
    try { await deleteNotification(id); toast.success("Notification deleted"); loadNotifications(); } catch (error) { toast.error(getErrorMessage(error, "Failed to delete")); }
  }

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Alerts" title="Notifications" description="Unread badge, mark read and notification list for operational updates.">
        <Button variant="outline" className="rounded-lg" onClick={markAll}><CheckCheck className="h-4 w-4" />Mark all read</Button>
      </PageHeader>
      <Card className="rounded-xl">
        <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-teal-600" />Notification Center</CardTitle></CardHeader>
        <CardContent>
          {loading ? <SkeletonLines count={5} /> : items.length ? (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className={`rounded-xl border p-4 ${item.read ? "bg-white dark:bg-slate-900" : "bg-teal-50 dark:bg-teal-500/10"}`}>
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div><p className="font-semibold">{item.title || item.type || "Notification"}</p><p className="mt-1 text-sm text-slate-500">{item.message || "No message"}</p></div>
                    <div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => markRead(item.id)}>Read</Button><Button variant="destructive" size="sm" onClick={() => remove(item.id)}><Trash2 className="h-4 w-4" /></Button></div>
                  </div>
                </div>
              ))}
            </div>
          ) : <EmptyState title="No notifications" description="New system notifications will appear here." />}
        </CardContent>
      </Card>
    </div>
  );
}
