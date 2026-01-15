import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ChartBar, ShoppingCart, Users } from "@medusajs/icons"
import { Heading, Badge } from "@medusajs/ui"
import { useEffect, useState } from "react"

interface RevenueChartItem {
    date: string
    revenue: number
}

interface OrderItem {
    id: string
    display_id?: string
    email?: string
    total?: number
    status: string
    created_at: string
}

const CustomDashboard = () => {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalCustomers: 0,
        totalProducts: 0,
        todaySales: 0,
        weekSales: 0,
        monthSales: 0,
        pendingOrders: 0,
        processingOrders: 0,
        completedOrders: 0,
        recentOrders: [] as OrderItem[],
        topProducts: [] as any[],
        revenueChart: [] as RevenueChartItem[]
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch all data
                const [ordersRes, customersRes, productsRes] = await Promise.all([
                    fetch('/admin/orders', { credentials: 'include' }),
                    fetch('/admin/customers', { credentials: 'include' }),
                    fetch('/admin/products', { credentials: 'include' })
                ])

                const ordersData = await ordersRes.json()
                const customersData = await customersRes.json()
                const productsData = await productsRes.json()

                // Process orders data
                let totalRevenue = 0
                let todaySales = 0
                let weekSales = 0
                let monthSales = 0
                let pending = 0
                let processing = 0
                let completed = 0
                const recentOrders: any[] = []

                const now = new Date()
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
                const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
                const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

                if (ordersData.orders) {
                    ordersData.orders.forEach((order: any) => {
                        const orderDate = new Date(order.created_at)
                        const amount = order.total || 0

                        totalRevenue += amount
                        if (orderDate >= today) todaySales += amount
                        if (orderDate >= weekAgo) weekSales += amount
                        if (orderDate >= monthAgo) monthSales += amount

                        if (order.status === 'pending') pending++
                        else if (order.status === 'processing' || order.status === 'requires_action') processing++
                        else if (order.status === 'completed') completed++
                    })

                    // Get recent 5 orders
                    const sorted = [...ordersData.orders].sort((a, b) =>
                        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                    )
                    recentOrders.push(...sorted.slice(0, 5))
                }

                // Generate revenue chart data for last 7 days
                const revenueChart = []
                for (let i = 6; i >= 0; i--) {
                    const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
                    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

                    let dayRevenue = 0
                    if (ordersData.orders) {
                        ordersData.orders.forEach((order: any) => {
                            const orderDate = new Date(order.created_at)
                            if (orderDate.toDateString() === date.toDateString()) {
                                dayRevenue += order.total || 0
                            }
                        })
                    }

                    revenueChart.push({ date: dateStr, revenue: dayRevenue / 100 })
                }

                setStats({
                    totalRevenue: totalRevenue / 100,
                    totalOrders: ordersData.orders?.length || 0,
                    totalCustomers: customersData.customers?.length || 0,
                    totalProducts: productsData.products?.length || 0,
                    todaySales: todaySales / 100,
                    weekSales: weekSales / 100,
                    monthSales: monthSales / 100,
                    pendingOrders: pending,
                    processingOrders: processing,
                    completedOrders: completed,
                    recentOrders,
                    topProducts: [],
                    revenueChart
                })
            } catch (error) {
                console.error('Error fetching dashboard data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchDashboardData()
    }, [])

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 0,
        }).format(amount)
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'green'
            case 'processing': return 'blue'
            case 'pending': return 'orange'
            case 'canceled': return 'red'
            default: return 'grey'
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-lg text-gray-600">Loading Dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-8 bg-gray-800 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <Heading level="h1" className="text-4xl font-bold mb-2 text-white">
                    📊 Professional Dashboard
                </Heading>
                <p className="text-gray-300 text-lg">
                    Complete overview of your e-commerce store with real-time data
                </p>
            </div>

            {/* Main Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Revenue */}
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-3xl">💰</div>
                        <ChartBar className="w-8 h-8 opacity-80" />
                    </div>
                    <div className="text-sm opacity-90 mb-1">Total Revenue</div>
                    <div className="text-3xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                    <div className="text-sm opacity-80 mt-2">All time earnings</div>
                </div>

                {/* Total Orders */}
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-3xl">📦</div>
                        <ShoppingCart className="w-8 h-8 opacity-80" />
                    </div>
                    <div className="text-sm opacity-90 mb-1">Total Orders</div>
                    <div className="text-3xl font-bold">{stats.totalOrders}</div>
                    <div className="text-sm opacity-80 mt-2">
                        {stats.pendingOrders} pending, {stats.completedOrders} completed
                    </div>
                </div>

                {/* Total Customers */}
                <div className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-3xl">👥</div>
                        <Users className="w-8 h-8 opacity-80" />
                    </div>
                    <div className="text-sm opacity-90 mb-1">Total Customers</div>
                    <div className="text-3xl font-bold">{stats.totalCustomers}</div>
                    <div className="text-sm opacity-80 mt-2">Registered users</div>
                </div>

                {/* Total Products */}
                <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-3xl">🛍️</div>
                        <div className="text-3xl">📦</div>
                    </div>
                    <div className="text-sm opacity-90 mb-1">Total Products</div>
                    <div className="text-3xl font-bold">{stats.totalProducts}</div>
                    <div className="text-sm opacity-80 mt-2">In catalog</div>
                </div>
            </div>

            {/* Sales Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="text-sm text-gray-600 mb-2">Today's Sales</div>
                    <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.todaySales)}</div>
                    <div className="text-xs text-gray-500 mt-2">Real-time data</div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="text-sm text-gray-600 mb-2">Last 7 Days</div>
                    <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.weekSales)}</div>
                    <div className="text-xs text-gray-500 mt-2">Weekly performance</div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="text-sm text-gray-600 mb-2">Last 30 Days</div>
                    <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.monthSales)}</div>
                    <div className="text-xs text-gray-500 mt-2">Monthly performance</div>
                </div>
            </div>

            {/* Revenue Chart & Order Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Revenue Chart */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <Heading level="h3" className="text-lg font-semibold mb-6">
                        📈 Revenue Trend (Last 7 Days)
                    </Heading>
                    <div className="space-y-3">
                        {stats.revenueChart.map((item, index) => {
                            const maxRevenue = Math.max(...stats.revenueChart.map(i => i.revenue))
                            const percentage = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0

                            return (
                                <div key={index}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium text-gray-700">{item.date}</span>
                                        <span className="text-sm font-semibold text-gray-900">{formatCurrency(item.revenue)}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div
                                            className="bg-gray-900 h-2.5 rounded-full transition-all duration-500"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Order Status */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <Heading level="h3" className="text-lg font-semibold mb-6">
                        📊 Order Status Overview
                    </Heading>

                    <div className="space-y-4">
                        {/* Pending */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-white text-lg font-bold">
                                    {stats.pendingOrders}
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900">Pending Orders</div>
                                    <div className="text-sm text-gray-600">Awaiting processing</div>
                                </div>
                            </div>
                            <Badge color="orange">Action Required</Badge>
                        </div>

                        {/* Processing */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-white text-lg font-bold">
                                    {stats.processingOrders}
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900">Processing Orders</div>
                                    <div className="text-sm text-gray-600">Being fulfilled</div>
                                </div>
                            </div>
                            <Badge color="blue">In Progress</Badge>
                        </div>

                        {/* Completed */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-white text-lg font-bold">
                                    {stats.completedOrders}
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900">Completed Orders</div>
                                    <div className="text-sm text-gray-600">Successfully delivered</div>
                                </div>
                            </div>
                            <Badge color="green">Success</Badge>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <Heading level="h3" className="text-lg font-semibold mb-6">
                    🛒 Recent Orders
                </Heading>

                {stats.recentOrders.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Order ID</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentOrders.map((order: any) => (
                                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-4 font-mono text-sm">{order.display_id || order.id.slice(0, 8)}</td>
                                        <td className="py-3 px-4">{order.email || 'Guest'}</td>
                                        <td className="py-3 px-4 font-semibold text-gray-900">
                                            {formatCurrency((order.total || 0) / 100)}
                                        </td>
                                        <td className="py-3 px-4">
                                            <Badge color={getStatusColor(order.status)}>
                                                {order.status}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-600">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">📦</div>
                        <div className="text-gray-600 text-lg">No orders yet</div>
                        <div className="text-gray-500 text-sm mt-2">Orders will appear here when customers make purchases</div>
                    </div>
                )}
            </div>

            {/* Info Banner */}
            <div className="mt-8 bg-gray-900 text-white rounded-lg p-6 shadow-sm">
                <div className="flex items-start gap-4">
                    <div className="text-3xl">ℹ️</div>
                    <div>
                        <div className="text-lg font-semibold mb-2">Real-Time Dashboard</div>
                        <div className="text-gray-300 text-sm">
                            Ye aapka complete dashboard hai with real-time data. Sab kuch automatically update hota rahega jab aap products, orders, ya customers add karenge.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export const config = defineRouteConfig({
    label: "Dashboard",
    icon: ChartBar,
})

export default CustomDashboard
