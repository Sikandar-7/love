```
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
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200">
          <div className="text-sm text-indigo-600 font-medium mb-1">Total Customers</div>
          <div className="text-3xl font-bold text-indigo-900">{stats.totalCustomers}</div>
          <div className="text-xs text-indigo-600 mt-2">All time</div>
        </div>

        {/* New This Month */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <div className="text-sm text-green-600 font-medium mb-1">New (Last 30 Days)</div>
          <div className="text-3xl font-bold text-green-900">{stats.newThisMonth}</div>
          <div className="text-xs text-green-600 mt-2">Real-time data</div>
        </div>
      </div>

      {/* Recent Customers */}
      {stats.recentCustomers.length > 0 && (
        <div className="mt-6 bg-white border rounded-lg p-4">
          <h3 className="font-semibold mb-3">Recent Customers</h3>
          <div className="space-y-2">
            {stats.recentCustomers.map((customer: any, index: number) => (
              <div key={customer.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold">
                    {customer.first_name?.[0] || customer.email?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <div className="font-medium">
                      {customer.first_name && customer.last_name 
                        ? `${ customer.first_name } ${ customer.last_name } `
                        : customer.email}
                    </div>
                    <div className="text-sm text-gray-600">
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
        <div className="mt-6 bg-gray-50 border rounded-lg p-6 text-center">
          <div className="text-4xl mb-2">👥</div>
          <div className="text-gray-600">No customers yet. They will appear here when created.</div>
        </div>
      )}
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "customer.list.before",
})

export default CustomerInsightsWidget
```
