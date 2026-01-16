import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Badge, Button } from "@medusajs/ui"
import { useState, useEffect } from "react"

interface RecentOrder {
  id: string
  display_id: string
  email: string | null
  total: number
  status: string
  created_at: string
  customer: {
    id: string
    email: string
  } | null
}

const RecentOrdersWidget = () => {
  const [orders, setOrders] = useState<RecentOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRecentOrders()
  }, [])

  const fetchRecentOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch("/admin/custom/analytics")
      const result = await response.json()
      setOrders(result.recentOrders || [])
      setError(null)
    } catch (err) {
      console.error("Orders fetch error:", err)
      setOrders([]) // Show empty state instead of error
      setError(null)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: "bg-ui-tag-orange-bg text-ui-tag-orange-text",
      completed: "bg-ui-tag-green-bg text-ui-tag-green-text",
      canceled: "bg-ui-tag-red-bg text-ui-tag-red-text",
      archived: "bg-ui-tag-grey-bg text-ui-tag-grey-text",
    }
    return statusColors[status] || "bg-ui-tag-blue-bg text-ui-tag-blue-text"
  }

  if (loading) {
    return (
      <Container className="p-6">
        <div className="flex items-center justify-center py-4">
          <Text className="text-ui-fg-subtle">Loading...</Text>
        </div>
      </Container>
    )
  }

  if (error) {
    return (
      <Container className="p-6">
        <div className="flex items-center justify-center py-4">
          <Text className="text-ui-fg-danger text-sm">Error: {error}</Text>
        </div>
      </Container>
    )
  }

  return (
    <Container className="p-6">
      <div className="flex items-center justify-between mb-4">
        <Heading level="h2">Recent Orders</Heading>
        <Button
          variant="transparent"
          size="small"
          onClick={() => (window.location.href = "/orders")}
        >
          View All
        </Button>
      </div>

      <div className="space-y-3">
        {orders.length === 0 ? (
          <div className="bg-ui-bg-subtle p-4 rounded-lg text-center">
            <Text className="text-ui-fg-subtle">No recent orders</Text>
          </div>
        ) : (
          orders.slice(0, 5).map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between p-3 bg-ui-bg-subtle rounded-lg hover:bg-ui-bg-subtle-hover transition-colors cursor-pointer"
              onClick={() => (window.location.href = `/orders/${order.id}`)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Text className="font-medium text-sm">
                    #{order.display_id || order.id.slice(0, 8)}
                  </Text>
                  <Badge size="2xsmall" className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </div>
                <Text className="text-ui-fg-subtle text-xs">
                  {order.customer?.email || order.email || "Guest"}
                </Text>
                <Text className="text-ui-fg-subtle text-xs">
                  {new Date(order.created_at).toLocaleString()}
                </Text>
              </div>
              <div className="text-right">
                <Text className="font-semibold">{formatCurrency(order.total)}</Text>
              </div>
            </div>
          ))
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "home.before",
})

export default RecentOrdersWidget
