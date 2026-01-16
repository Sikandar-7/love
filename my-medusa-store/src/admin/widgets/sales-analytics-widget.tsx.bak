import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Badge } from "@medusajs/ui"
import { useState, useEffect } from "react"

interface AnalyticsData {
  today: {
    revenue: number
    orders: number
  }
  revenueChart: Array<{
    date: string
    revenue: number
    orders: number
  }>
}

const SalesAnalyticsWidget = () => {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch("/admin/custom/analytics")
      const result = await response.json()
      
      // Always set data, even if empty, to prevent white screen
      setData({
        today: result.today || { revenue: 0, orders: 0 },
        revenueChart: result.revenueChart || [],
      })
      setError(null)
    } catch (err) {
      console.error("Analytics fetch error:", err)
      // Set empty data instead of error to show something
      setData({
        today: { revenue: 0, orders: 0 },
        revenueChart: [],
      })
      setError(null) // Don't show error, just show empty state
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

  if (loading) {
    return (
      <Container className="p-6">
        <div className="flex items-center justify-center py-8">
          <Text className="text-ui-fg-subtle">Loading analytics...</Text>
        </div>
      </Container>
    )
  }

  if (error) {
    return (
      <Container className="p-6">
        <div className="flex items-center justify-center py-8">
          <Text className="text-ui-fg-danger">Error: {error}</Text>
        </div>
      </Container>
    )
  }

  if (!data) return null

  const maxRevenue = Math.max(...data.revenueChart.map((d) => d.revenue), 1)

  return (
    <Container className="p-6">
      <div className="flex items-center justify-between mb-6">
        <Heading level="h2">Sales Analytics</Heading>
        <button
          onClick={fetchAnalytics}
          className="text-ui-fg-subtle hover:text-ui-fg-base text-sm"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-ui-bg-subtle p-4 rounded-lg">
          <Text className="text-ui-fg-subtle text-sm mb-1">Today's Revenue</Text>
          <Text className="text-2xl font-semibold">
            {formatCurrency(data.today.revenue)}
          </Text>
        </div>
        <div className="bg-ui-bg-subtle p-4 rounded-lg">
          <Text className="text-ui-fg-subtle text-sm mb-1">Today's Orders</Text>
          <Text className="text-2xl font-semibold">{data.today.orders}</Text>
        </div>
      </div>

      <div className="mb-4">
        <Text className="text-ui-fg-subtle text-sm mb-3">Revenue (Last 7 Days)</Text>
        <div className="space-y-2">
          {data.revenueChart.map((day, index) => {
            const percentage = (day.revenue / maxRevenue) * 100
            return (
              <div key={index} className="flex items-center gap-3">
                <Text className="text-xs text-ui-fg-subtle w-20">
                  {new Date(day.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
                <div className="flex-1 bg-ui-bg-subtle rounded-full h-6 relative overflow-hidden">
                  <div
                    className="bg-ui-fg-interactive h-full rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Text className="text-xs font-medium">
                      {formatCurrency(day.revenue)}
                    </Text>
                  </div>
                </div>
                <Badge size="2xsmall" className="w-16 justify-center">
                  {day.orders} orders
                </Badge>
              </div>
            )
          })}
        </div>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "home.before",
})

export default SalesAnalyticsWidget
