import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Badge } from "@medusajs/ui"
import { useEffect, useState } from "react"

const CustomerInsightsWidget = () => {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    newThisMonth: 0,
    recentCustomers: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch('/admin/customers', {
          credentials: 'include',
        })
        const data = await response.json()

        if (data.customers) {
          const customers = data.customers
          const now = new Date()
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

          // Count new customers this month
          const newCustomers = customers.filter((customer: any) => {
            const createdDate = new Date(customer.created_at)
            return createdDate >= monthAgo
          })

          // Get recent 5 customers
          const recent = customers
            .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5)

          setStats({
            totalCustomers: customers.length,
            newThisMonth: newCustomers.length,
            recentCustomers: recent
          })
        }
      } catch (error) {
        console.error('Error fetching customers:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCustomers()
  }, [])

  if (loading) {
    return (
      <Container className="p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading customer data...</p>
        </div>
      </Container>
    )
  }

  return (
    <Container className="p-6">
      <Heading level="h2" className="text-xl font-semibold mb-6">
        👥 Customer Insights (Real Data)
      </Heading>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Customers */}
        <div className="p-4 rounded-lg border border-ui-border-base bg-ui-bg-subtle shadow-elevation-card-rest">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-ui-bg-base border border-ui-border-base rounded text-ui-tag-blue-text">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </div>
            <span className="text-sm font-medium text-ui-fg-subtle">Total Customers</span>
          </div>
          <div className="text-2xl font-bold text-ui-fg-base">{stats.totalCustomers}</div>
        </div>

        {/* New This Month */}
        <div className="p-4 rounded-lg border border-ui-border-base bg-ui-bg-subtle shadow-elevation-card-rest">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-ui-bg-base border border-ui-border-base rounded text-ui-tag-green-text">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
            </div>
            <span className="text-sm font-medium text-ui-fg-subtle">New (30 Days)</span>
          </div>
          <div className="text-2xl font-bold text-ui-fg-base">{stats.newThisMonth}</div>
        </div>
      </div>

      {/* Recent Customers */}
      {stats.recentCustomers.length > 0 && (
        <div className="mt-6 bg-ui-bg-subtle border border-ui-border-base rounded-lg p-4">
          <h3 className="font-semibold mb-3 text-ui-fg-base">Recent Customers</h3>
          <div className="space-y-2">
            {stats.recentCustomers.map((customer: any, index: number) => (
              <div key={customer.id} className="flex items-center justify-between p-2 hover:bg-ui-bg-base/50 transition-colors rounded">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-ui-bg-base border border-ui-border-base rounded-full flex items-center justify-center text-ui-tag-blue-text font-semibold">
                    {customer.first_name?.[0] || customer.email?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <div className="font-medium text-ui-fg-base">
                      {customer.first_name && customer.last_name
                        ? `${customer.first_name} ${customer.last_name}`
                        : customer.email}
                    </div>
                    <div className="text-sm text-ui-fg-subtle">
                      {new Date(customer.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                {index === 0 && <Badge color="green">Latest</Badge>}
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.recentCustomers.length === 0 && (
        <div className="mt-6 bg-ui-bg-subtle border border-ui-border-base rounded-lg p-6 text-center">
          <div className="text-4xl mb-2">👥</div>
          <div className="text-ui-fg-subtle">No customers yet. They will appear here when created.</div>
        </div>
      )}
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "customer.list.before",
})

export default CustomerInsightsWidget
