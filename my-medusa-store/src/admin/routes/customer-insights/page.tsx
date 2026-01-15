import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Users } from "@medusajs/icons"
import { Heading, Badge } from "@medusajs/ui"
import { useEffect, useState } from "react"

interface CustomerInsightsData {
    newCustomersToday: number
    newCustomersThisWeek: number
    returningCustomersPercent: number
    totalCustomers: number
    customerSegmentation: {
        vip: { count: number; totalSpend: number }
        regular: { count: number; totalSpend: number }
        new: { count: number; totalSpend: number }
    }
    recentActivity: {
        id: string
        type: 'signup' | 'order'
        customer: string
        email: string
        amount?: number
        timestamp: string
    }[]
    geographicDistribution: {
        city: string
        count: number
        percentage: number
    }[]
    topSpenders: {
        id: string
        name: string
        email: string
        totalSpend: number
        orderCount: number
    }[]
}

const CustomerInsights = () => {
    const [insights, setInsights] = useState<CustomerInsightsData>({
        newCustomersToday: 0,
        newCustomersThisWeek: 0,
        returningCustomersPercent: 0,
        totalCustomers: 0,
        customerSegmentation: {
            vip: { count: 0, totalSpend: 0 },
            regular: { count: 0, totalSpend: 0 },
            new: { count: 0, totalSpend: 0 }
        },
        recentActivity: [],
        geographicDistribution: [],
        topSpenders: []
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchCustomerInsights = async () => {
            try {
                const [customersRes, ordersRes] = await Promise.all([
                    fetch('/admin/customers', { credentials: 'include' }),
                    fetch('/admin/orders', { credentials: 'include' })
                ])

                const customersData = await customersRes.json()
                const ordersData = await ordersRes.json()

                const customers = customersData.customers || []
                const orders = ordersData.orders || []

                // Calculate New Customers
                const today = new Date()
                today.setHours(0, 0, 0, 0)

                const weekAgo = new Date(today)
                weekAgo.setDate(weekAgo.getDate() - 7)

                const newCustomersToday = customers.filter((c: any) => {
                    const createdDate = new Date(c.created_at)
                    createdDate.setHours(0, 0, 0, 0)
                    return createdDate.getTime() === today.getTime()
                }).length

                const newCustomersThisWeek = customers.filter((c: any) => {
                    const createdDate = new Date(c.created_at)
                    return createdDate >= weekAgo
                }).length

                // Calculate Customer Spending
                const customerSpending: { [key: string]: { orders: number; spend: number; email: string; name: string } } = {}

                orders.forEach((order: any) => {
                    const customerId = order.customer_id
                    if (customerId) {
                        if (!customerSpending[customerId]) {
                            const customer = customers.find((c: any) => c.id === customerId)
                            customerSpending[customerId] = {
                                orders: 0,
                                spend: 0,
                                email: order.email || customer?.email || 'Unknown',
                                name: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : 'Unknown'
                            }
                        }
                        customerSpending[customerId].orders += 1
                        customerSpending[customerId].spend += (order.total || 0) / 100
                    }
                })

                // Returning Customers Percentage
                const customersWithOrders = Object.keys(customerSpending).length
                const returningCustomers = Object.values(customerSpending).filter(c => c.orders > 1).length
                const returningCustomersPercent = customersWithOrders > 0
                    ? Math.round((returningCustomers / customersWithOrders) * 100)
                    : 0

                // Customer Segmentation
                // VIP: >3 orders or >50000 PKR spend
                // Regular: 1-3 orders
                // New: 0 orders
                const vipCustomers = Object.entries(customerSpending).filter(
                    ([, data]) => data.orders > 3 || data.spend > 50000
                )
                const regularCustomers = Object.entries(customerSpending).filter(
                    ([, data]) => data.orders >= 1 && data.orders <= 3 && data.spend <= 50000
                )
                const newCustomers = customers.filter((c: any) => !customerSpending[c.id])

                const customerSegmentation = {
                    vip: {
                        count: vipCustomers.length,
                        totalSpend: vipCustomers.reduce((sum, [, data]) => sum + data.spend, 0)
                    },
                    regular: {
                        count: regularCustomers.length,
                        totalSpend: regularCustomers.reduce((sum, [, data]) => sum + data.spend, 0)
                    },
                    new: {
                        count: newCustomers.length,
                        totalSpend: 0
                    }
                }

                // Recent Activity (last 20 signups and orders)
                const recentSignups = customers
                    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .slice(0, 10)
                    .map((customer: any) => ({
                        id: customer.id,
                        type: 'signup' as const,
                        customer: `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Customer',
                        email: customer.email,
                        timestamp: new Date(customer.created_at).toLocaleString()
                    }))

                const recentOrders = orders
                    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .slice(0, 10)
                    .map((order: any) => ({
                        id: order.id,
                        type: 'order' as const,
                        customer: order.customer?.first_name
                            ? `${order.customer.first_name} ${order.customer.last_name || ''}`.trim()
                            : order.email || 'Guest',
                        email: order.email || 'N/A',
                        amount: (order.total || 0) / 100,
                        timestamp: new Date(order.created_at).toLocaleString()
                    }))

                const recentActivity = [...recentSignups, ...recentOrders]
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .slice(0, 15)

                // Geographic Distribution (from shipping addresses)
                const cityCount: { [key: string]: number } = {}

                orders.forEach((order: any) => {
                    const city = order.shipping_address?.city || 'Unknown'
                    cityCount[city] = (cityCount[city] || 0) + 1
                })

                const totalOrders = orders.length
                const geographicDistribution = Object.entries(cityCount)
                    .map(([city, count]) => ({
                        city,
                        count,
                        percentage: totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0
                    }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 10)

                // Top Spenders
                const topSpenders = Object.entries(customerSpending)
                    .map(([id, data]) => ({
                        id,
                        name: data.name || data.email,
                        email: data.email,
                        totalSpend: data.spend,
                        orderCount: data.orders
                    }))
                    .sort((a, b) => b.totalSpend - a.totalSpend)
                    .slice(0, 5)

                setInsights({
                    newCustomersToday,
                    newCustomersThisWeek,
                    returningCustomersPercent,
                    totalCustomers: customers.length,
                    customerSegmentation,
                    recentActivity,
                    geographicDistribution,
                    topSpenders
                })
            } catch (error) {
                console.error('Error fetching customer insights:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchCustomerInsights()
    }, [])

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 0,
        }).format(amount)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-800">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-lg text-gray-300">Loading Customer Insights...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-8 bg-gray-800 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <Heading level="h1" className="text-4xl font-bold mb-2 text-white">
                    👥 Customer Insights
                </Heading>
                <p className="text-gray-300 text-lg">
                    Deep dive into your customer base and behavior
                </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-xl p-6 shadow-lg">
                    <div className="text-sm opacity-90 mb-1">Total Customers</div>
                    <div className="text-4xl font-bold">{insights.totalCustomers}</div>
                    <div className="text-sm opacity-80 mt-2">All time</div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl p-6 shadow-lg">
                    <div className="text-sm opacity-90 mb-1">New This Week</div>
                    <div className="text-4xl font-bold">{insights.newCustomersThisWeek}</div>
                    <div className="text-sm opacity-80 mt-2">Last 7 days</div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-xl p-6 shadow-lg">
                    <div className="text-sm opacity-90 mb-1">New Today</div>
                    <div className="text-4xl font-bold">{insights.newCustomersToday}</div>
                    <div className="text-sm opacity-80 mt-2">Fresh signups</div>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-xl p-6 shadow-lg">
                    <div className="text-sm opacity-90 mb-1">Returning Rate</div>
                    <div className="text-4xl font-bold">{insights.returningCustomersPercent}%</div>
                    <div className="text-sm opacity-80 mt-2">Repeat customers</div>
                </div>
            </div>

            {/* Customer Segmentation */}
            <div className="bg-gray-700 rounded-lg p-6 shadow-lg border border-gray-600 mb-8">
                <Heading level="h3" className="text-2xl font-semibold mb-6 text-white flex items-center gap-2">
                    <span className="text-3xl">🎯</span> Customer Segmentation
                </Heading>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* VIP Customers */}
                    <div className="bg-gradient-to-br from-yellow-600 to-orange-600 rounded-lg p-6 text-white">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="text-4xl">👑</div>
                            <div>
                                <div className="text-2xl font-bold">{insights.customerSegmentation.vip.count}</div>
                                <div className="text-sm opacity-90">VIP Customers</div>
                            </div>
                        </div>
                        <div className="text-sm opacity-80">
                            Total Spend: <span className="font-bold">{formatCurrency(insights.customerSegmentation.vip.totalSpend)}</span>
                        </div>
                        <div className="text-xs opacity-70 mt-2">{'>'} 3 orders or {'>'} 50k spend</div>
                    </div>

                    {/* Regular Customers */}
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="text-4xl">⭐</div>
                            <div>
                                <div className="text-2xl font-bold">{insights.customerSegmentation.regular.count}</div>
                                <div className="text-sm opacity-90">Regular Customers</div>
                            </div>
                        </div>
                        <div className="text-sm opacity-80">
                            Total Spend: <span className="font-bold">{formatCurrency(insights.customerSegmentation.regular.totalSpend)}</span>
                        </div>
                        <div className="text-xs opacity-70 mt-2">1-3 orders</div>
                    </div>

                    {/* New Customers */}
                    <div className="bg-gradient-to-br from-green-600 to-teal-600 rounded-lg p-6 text-white">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="text-4xl">🆕</div>
                            <div>
                                <div className="text-2xl font-bold">{insights.customerSegmentation.new.count}</div>
                                <div className="text-sm opacity-90">New Customers</div>
                            </div>
                        </div>
                        <div className="text-sm opacity-80">
                            No orders yet
                        </div>
                        <div className="text-xs opacity-70 mt-2">Potential buyers</div>
                    </div>
                </div>
            </div>

            {/* Recent Activity & Geographic Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Recent Activity */}
                <div className="bg-gray-700 rounded-lg p-6 shadow-lg border border-gray-600">
                    <Heading level="h3" className="text-xl font-semibold mb-6 text-white flex items-center gap-2">
                        <span className="text-2xl">📊</span> Recent Activity
                    </Heading>

                    {insights.recentActivity.length > 0 ? (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {insights.recentActivity.map((activity) => (
                                <div key={activity.id} className="bg-gray-600 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="text-2xl">
                                            {activity.type === 'signup' ? '👤' : '🛒'}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-white font-medium">{activity.customer}</span>
                                                <Badge color={activity.type === 'signup' ? 'green' : 'blue'}>
                                                    {activity.type === 'signup' ? 'New Signup' : 'Order'}
                                                </Badge>
                                            </div>
                                            <div className="text-gray-300 text-sm">{activity.email}</div>
                                            {activity.amount && (
                                                <div className="text-green-400 font-bold text-sm mt-1">
                                                    {formatCurrency(activity.amount)}
                                                </div>
                                            )}
                                            <div className="text-gray-400 text-xs mt-1">{activity.timestamp}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            <div className="text-4xl mb-2">📭</div>
                            <div>No recent activity</div>
                        </div>
                    )}
                </div>

                {/* Geographic Distribution */}
                <div className="bg-gray-700 rounded-lg p-6 shadow-lg border border-gray-600">
                    <Heading level="h3" className="text-xl font-semibold mb-6 text-white flex items-center gap-2">
                        <span className="text-2xl">🌍</span> Geographic Distribution
                    </Heading>

                    {insights.geographicDistribution.length > 0 ? (
                        <div className="space-y-3">
                            {insights.geographicDistribution.map((location, index) => (
                                <div key={location.city}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                {index + 1}
                                            </div>
                                            <span className="text-white font-medium">{location.city}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-white font-bold">{location.count} orders</div>
                                            <div className="text-gray-400 text-xs">{location.percentage}%</div>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-600 rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${location.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            <div className="text-4xl mb-2">🗺️</div>
                            <div>No geographic data available</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Top Spenders */}
            <div className="bg-gray-700 rounded-lg p-6 shadow-lg border border-gray-600">
                <Heading level="h3" className="text-xl font-semibold mb-6 text-white flex items-center gap-2">
                    <span className="text-2xl">💎</span> Top Spenders
                </Heading>

                {insights.topSpenders.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {insights.topSpenders.map((customer, index) => (
                            <div
                                key={customer.id}
                                className={`rounded-lg p-5 text-center ${index === 0
                                        ? 'bg-gradient-to-br from-yellow-500 to-orange-600'
                                        : index === 1
                                            ? 'bg-gradient-to-br from-gray-400 to-gray-500'
                                            : index === 2
                                                ? 'bg-gradient-to-br from-orange-600 to-red-600'
                                                : 'bg-gray-600'
                                    }`}
                            >
                                <div className="text-4xl mb-2">
                                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '⭐'}
                                </div>
                                <div className="text-white font-bold text-lg mb-1">{customer.name}</div>
                                <div className="text-gray-200 text-xs mb-3">{customer.email}</div>
                                <div className="text-white font-bold text-xl mb-1">
                                    {formatCurrency(customer.totalSpend)}
                                </div>
                                <div className="text-gray-200 text-sm">{customer.orderCount} orders</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-400">
                        <div className="text-4xl mb-2">💰</div>
                        <div>No customer spending data</div>
                    </div>
                )}
            </div>

            {/* Info Banner */}
            <div className="mt-8 bg-gray-900 text-white rounded-lg p-6">
                <div className="flex items-start gap-4">
                    <div className="text-3xl">👥</div>
                    <div>
                        <div className="text-lg font-semibold mb-2">Customer Insights Dashboard</div>
                        <div className="text-gray-300 text-sm">
                            All data is calculated in real-time from your customer and order records. Track new signups, customer segmentation, geographic distribution, and top spenders! 📊
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export const config = defineRouteConfig({
    label: "Customer Insights",
    icon: Users,
})

export default CustomerInsights
