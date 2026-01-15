import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Badge } from "@medusajs/ui"
import { useState, useEffect } from "react"

interface RecentCustomer {
  id: string
  email: string
  created_at: string
}

const CustomerActivityWidget = () => {
  const [customers, setCustomers] = useState<RecentCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCustomerActivity()
  }, [])

  const fetchCustomerActivity = async () => {
    try {
      setLoading(true)
      const response = await fetch("/admin/custom/analytics")
      const result = await response.json()
      setCustomers(result.recentCustomers || [])
      setError(null)
    } catch (err) {
      console.error("Customer activity fetch error:", err)
      setCustomers([]) // Show empty state instead of error
      setError(null)
    } finally {
      setLoading(false)
    }
  }

  const getTimeAgo = (date: string) => {
    const now = new Date()
    const past = new Date(date)
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)

    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
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
        <Heading level="h2">Customer Activity</Heading>
        <Badge size="small">{customers.length} recent</Badge>
      </div>

      <div className="space-y-2">
        {customers.length === 0 ? (
          <div className="bg-ui-bg-subtle p-4 rounded-lg text-center">
            <Text className="text-ui-fg-subtle">No recent customer activity</Text>
          </div>
        ) : (
          customers.slice(0, 5).map((customer) => (
            <div
              key={customer.id}
              className="flex items-center justify-between p-3 bg-ui-bg-subtle rounded-lg hover:bg-ui-bg-subtle-hover transition-colors cursor-pointer"
              onClick={() => (window.location.href = `/customers/${customer.id}`)}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-ui-fg-interactive flex items-center justify-center text-white text-xs font-bold">
                  {customer.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <Text className="font-medium text-sm">{customer.email}</Text>
                  <Text className="text-ui-fg-subtle text-xs">
                    {getTimeAgo(customer.created_at)}
                  </Text>
                </div>
              </div>
              <Badge size="2xsmall" className="bg-ui-tag-blue-bg text-ui-tag-blue-text">
                New
              </Badge>
            </div>
          ))
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "home.after",
})

export default CustomerActivityWidget
