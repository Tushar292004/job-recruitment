"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { Bell, X } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface NotificationsProps {
  userRole: "jobseeker" | "recruiter" | null
  userId: string
}

interface Notification {
  id: string
  user_id: string
  message: string
  read: boolean
  created_at: string
  related_id?: string
  type: string
}

export function Notifications({ userRole, userId }: NotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    if (!userId) return

    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20)

      if (error) {
        console.error("Error fetching notifications:", error)
        return
      }

      setNotifications(data || [])
      setUnreadCount(data?.filter((n) => !n.read).length || 0)
    }

    fetchNotifications()

    // Set up real-time subscription for new notifications
    const subscription = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification
          setNotifications((prev) => [newNotification, ...prev])
          setUnreadCount((prev) => prev + 1)

          // Show toast for new notification
          toast({
            title: "New Notification",
            description: newNotification.message,
          })
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [userId, supabase, toast])

  const handleReadNotification = async (id: string) => {
    // Mark notification as read
    const { error } = await supabase.from("notifications").update({ read: true }).eq("id", id)

    if (error) {
      console.error("Error marking notification as read:", error)
      return
    }

    // Update local state
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  const handleDeleteNotification = async (id: string) => {
    // Delete notification
    const { error } = await supabase.from("notifications").delete().eq("id", id)

    if (error) {
      console.error("Error deleting notification:", error)
      return
    }

    // Update local state
    const notificationToDelete = notifications.find((n) => n.id === id)
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    if (notificationToDelete && !notificationToDelete.read) {
      setUnreadCount((prev) => Math.max(0, prev - 1))
    }
  }

  const handleMarkAllAsRead = async () => {
    // Mark all notifications as read
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId)
      .eq("read", false)

    if (error) {
      console.error("Error marking all notifications as read:", error)
      return
    }

    // Update local state
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  if (!userRole) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-4 pb-2">
          <h2 className="font-semibold">Notifications</h2>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} className="text-xs h-8">
              Mark all as read
            </Button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-6 text-center text-muted-foreground">No notifications yet</div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`relative border-b p-4 ${!notification.read ? "bg-muted/50" : ""} hover:bg-muted/20`}
                onClick={() => !notification.read && handleReadNotification(notification.id)}
              >
                <p className="pr-6 text-sm">{notification.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(notification.created_at).toLocaleString()}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteNotification(notification.id)
                  }}
                  className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

