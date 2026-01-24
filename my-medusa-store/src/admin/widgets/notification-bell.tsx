import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { BellAlert, ShoppingCart, ExclamationCircle } from "@medusajs/icons"
import { Container, Heading, Text, Badge } from "@medusajs/ui"
import { useState, useEffect } from "react"

// Types
interface Notification {
    id: string
    title: string
    description: string
    type: "order" | "inventory" | "system"
    isRead: boolean
    timestamp: Date
}

const NotificationBellWidget = () => {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        // Mock fetching notifications
        // In a real app, this would come from a websocket or polling API
        const mockNotifications: Notification[] = [
            {
                id: "1",
                title: "New Order",
                description: "Order #1024 was placed by Ali Khan",
                type: "order",
                isRead: false,
                timestamp: new Date()
            },
            {
                id: "2",
                title: "Low Stock Alert",
                description: "Premium Cotton Shirt (L) is running low",
                type: "inventory",
                isRead: false,
                timestamp: new Date(Date.now() - 3600000)
            },
            {
                id: "3",
                title: "System Update",
                description: "Deployment successful at 2:00 PM",
                type: "system",
                isRead: true,
                timestamp: new Date(Date.now() - 86400000)
            }
        ]
        setNotifications(mockNotifications)
    }, [])

    useEffect(() => {
        setUnreadCount(notifications.filter(n => !n.isRead).length)
    }, [notifications])

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n =>
            n.id === id ? { ...n, isRead: true } : n
        ))
    }

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    }

    const getIcon = (type: string) => {
        switch (type) {
            case "order": return <ShoppingCart className="text-blue-500" />
            case "inventory": return <ExclamationCircle className="text-orange-500" />
            default: return <BellAlert className="text-gray-500" />
        }
    }

    return (
        <Container className="p-4 mb-4 bg-ui-bg-subtle border border-ui-border-base flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="p-2 bg-ui-bg-base rounded-full shadow-sm relative">
                    <BellAlert className="text-ui-fg-base" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                            {unreadCount}
                        </span>
                    )}
                </div>
                <div>
                    <Heading level="h3" className="text-sm font-semibold text-ui-fg-base">
                        Recent Notifications
                    </Heading>
                    <Text className="text-xs text-ui-fg-subtle">
                        {unreadCount} unread alerts
                    </Text>
                </div>
            </div>

            <div className="flex gap-2">
                {notifications.slice(0, 2).map(n => (
                    <div
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer transition-colors ${n.isRead
                            ? "bg-ui-bg-base border-ui-border-transparent opacity-60"
                            : "bg-blue-50 border-blue-200"
                            }`}
                    >
                        {getIcon(n.type)}
                        <span className={`text-xs ${n.isRead ? "text-ui-fg-subtle" : "text-blue-700 font-medium"}`}>
                            {n.title}
                        </span>
                    </div>
                ))}
                {notifications.length > 2 && (
                    <Badge color="grey" className="cursor-pointer">+{notifications.length - 2} more</Badge>
                )}
            </div>
        </Container>
    )
}

export const config = defineWidgetConfig({
    zone: "order.list.before",
})

export default NotificationBellWidget
