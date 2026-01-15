import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Container,
  Heading,
  Text,
  Badge,
  Select,
  Button,
} from "@medusajs/ui"
import { useState, useEffect } from "react"

interface CustomerInsight {
  id: string
  email: string
  lifetimeValue: number
  orderCount: number
  averageOrderValue: number
  lastOrderDate: string
  segment: string
}

const CustomerInsightsPage = () => {
  const [customers, setCustomers] = useState<CustomerInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [segmentFilter, setSegmentFilter] = useState("all")

  useEffect(() => {
    fetchCustomerInsights()
  }, [segmentFilter])

  const fetchCustomerInsights = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/admin/custom/customers/insights?segment=${segmentFilter}`
      )
      if (!response.ok) throw new Error("Failed to fetch insights")
      const result = await response.json()
      setCustomers(result.customers || [])
    } catch (error) {
      console.error("Error fetching insights:", error)
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

  const getSegmentColor = (segment: string) => {
    const colors: Record<string, string> = {
      vip: "bg-ui-tag-purple-bg text-ui-tag-purple-text",
      high: "bg-ui-tag-green-bg text-ui-tag-green-text",
      medium: "bg-ui-tag-blue-bg text-ui-tag-blue-text",
      low: "bg-ui-tag-grey-bg text-ui-tag-grey-text",
    }
    return colors[segment] || "bg-ui-tag-grey-bg text-ui-tag-grey-text"
  }

  if (loading) {
    return (
      <Container className="p-6">
        <Text>Loading customer insights...</Text>
      </Container>
    )
  }

  return (
    <Container className="p-6">
      <div className="flex items-center justify-between mb-6">
        <Heading level="h1">Customer Insights</Heading>
        <Select value={segmentFilter} onValueChange={setSegmentFilter}>
          <option value="all">All Segments</option>
          <option value="vip">VIP</option>
          <option value="high">High Value</option>
          <option value="medium">Medium Value</option>
          <option value="low">Low Value</option>
        </Select>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-ui-bg-subtle p-4 rounded-lg">
          <Text className="text-sm text-ui-fg-subtle mb-1">Total Customers</Text>
          <Text className="text-2xl font-semibold">{customers.length}</Text>
        </div>
        <div className="bg-ui-bg-subtle p-4 rounded-lg">
          <Text className="text-sm text-ui-fg-subtle mb-1">Total LTV</Text>
          <Text className="text-2xl font-semibold">
            {formatCurrency(
              customers.reduce((sum, c) => sum + c.lifetimeValue, 0)
            )}
          </Text>
        </div>
        <div className="bg-ui-bg-subtle p-4 rounded-lg">
          <Text className="text-sm text-ui-fg-subtle mb-1">Average LTV</Text>
          <Text className="text-2xl font-semibold">
            {formatCurrency(
              customers.length > 0
                ? customers.reduce((sum, c) => sum + c.lifetimeValue, 0) /
                    customers.length
                : 0
            )}
          </Text>
        </div>
        <div className="bg-ui-bg-subtle p-4 rounded-lg">
          <Text className="text-sm text-ui-fg-subtle mb-1">Total Orders</Text>
          <Text className="text-2xl font-semibold">
            {customers.reduce((sum, c) => sum + c.orderCount, 0)}
          </Text>
        </div>
      </div>

      <div className="border border-ui-border-base rounded-lg overflow-hidden">
        <div className="bg-ui-bg-subtle px-4 py-3 border-b border-ui-border-base">
          <Text className="font-medium">Customer List</Text>
        </div>
        <div className="divide-y divide-ui-border-base">
          {customers.length === 0 ? (
            <div className="p-8 text-center">
              <Text className="text-ui-fg-subtle">No customers found</Text>
            </div>
          ) : (
            customers.map((customer) => (
              <div
                key={customer.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-ui-bg-subtle-hover cursor-pointer"
                onClick={() => (window.location.href = `/customers/${customer.id}`)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Text className="font-medium">{customer.email}</Text>
                    <Badge size="2xsmall" className={getSegmentColor(customer.segment)}>
                      {customer.segment.toUpperCase()}
                    </Badge>
                  </div>
                  <Text className="text-sm text-ui-fg-subtle">
                    {customer.orderCount} orders • Last order:{" "}
                    {new Date(customer.lastOrderDate).toLocaleDateString()}
                  </Text>
                </div>
                <div className="text-right">
                  <Text className="font-semibold">
                    {formatCurrency(customer.lifetimeValue)}
                  </Text>
                  <Text className="text-sm text-ui-fg-subtle">
                    Avg: {formatCurrency(customer.averageOrderValue)}
                  </Text>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Customer Insights",
  icon: null,
  nested: "/customers",
})

export default CustomerInsightsPage
