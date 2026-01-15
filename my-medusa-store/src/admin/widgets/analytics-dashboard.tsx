import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading } from "@medusajs/ui"
import { useEffect, useState } from "react"

const AnalyticsDashboardWidget = () => {
    const [stats, setStats] = useState({
        todaySales: 0,
        weekSales: 0,
        monthSales: 0,
        totalOrders: 0,
        pendingOrders: 0,
        processingOrders: 0,
        completedOrders: 0,
        topProducts: []
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Fetch real data from backend
        const fetchAnalytics = async () => {
            try {
                // Fetch orders
                const ordersResponse = await fetch('/admin/orders', {
                    credentials: 'include',
                })
                const ordersData = await ordersResponse.json()

                if (ordersData.orders) {
                    const orders = ordersData.orders
                    const now = new Date()
                    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
                    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
                    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

                    // Calculate sales
                    let todaySales = 0
                    let weekSales = 0
                    let monthSales = 0
                    let pending = 0
                    let processing = 0
                    let completed = 0

                    orders.forEach((order: any) => {
                        const orderDate = new Date(order.created_at)
                        const amount = order.total || 0

                        if (orderDate >= today) todaySales += amount
                        if (orderDate >= weekAgo) weekSales += amount
                        if (orderDate >= monthAgo) monthSales += amount

                        // Count by status
                        if (order.status === 'pending') pending++
                        else if (order.status === 'processing' || order.status === 'requires_action') processing++
                        else if (order.status === 'completed') completed++
                    })

                    setStats({
                        todaySales: todaySales / 100,
                        weekSales: weekSales / 100,
                        monthSales: monthSales / 100,
                        totalOrders: orders.length,
                        pendingOrders: pending,
                        processingOrders: processing,
                        completedOrders: completed,
                        topProducts: []
                    })
                }
            } catch (error) {
                console.error('Error fetching analytics:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchAnalytics()
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
            <Container className="p-6">
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading analytics...</p>
                </div>
            </Container>
        )
    }

    return (
        <Container className="divide-y p-0">
            <div className="p-6">
                <Heading level="h2" className="text-xl font-semibold mb-6">
                    📊 Sales Analytics (Real Data)
                </Heading>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    {/* Today's Sales */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                        <div className="text-sm text-blue-600 font-medium mb-1">Today's Sales</div>
                        <div className="text-2xl font-bold text-blue-900">{formatCurrency(stats.todaySales)}</div>
                        <div className="text-xs text-blue-600 mt-1">Real-time data</div>
                    </div>

                    {/* This Week */}
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                        <div className="text-sm text-green-600 font-medium mb-1">Last 7 Days</div>
                        <div className="text-2xl font-bold text-green-900">{formatCurrency(stats.weekSales)}</div>
                        <div className="text-xs text-green-600 mt-1">Real-time data</div>
                    </div>

                    {/* This Month */}
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                        <div className="text-sm text-purple-600 font-medium mb-1">Last 30 Days</div>
                        <div className="text-2xl font-bold text-purple-900">{formatCurrency(stats.monthSales)}</div>
                        <div className="text-xs text-purple-600 mt-1">Real-time data</div>
                    </div>

                    {/* Total Orders */}
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                        <div className="text-sm text-orange-600 font-medium mb-1">Total Orders</div>
                        <div className="text-2xl font-bold text-orange-900">{stats.totalOrders}</div>
                        <div className="text-xs text-orange-600 mt-1">All time</div>
                    </div>
                </div>

                {/* Order Status */}
                <div className="bg-white border rounded-lg p-4 mb-6">
                    <h3 className="font-semibold mb-3">Order Status (Real Data)</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</div>
                            <div className="text-sm text-gray-600">Pending</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{stats.processingOrders}</div>
                            <div className="text-sm text-gray-600">Processing</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{stats.completedOrders}</div>
                            <div className="text-sm text-gray-600">Completed</div>
                        </div>
                    </div>
                </div>

                {/* Info Message */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <div className="text-2xl">ℹ️</div>
                        <div>
                            <div className="font-semibold text-blue-900 mb-1">Real-Time Data</div>
                            <div className="text-sm text-blue-700">
                                Ye aapke actual Medusa store ka data hai. Jab aap orders create karenge, ye numbers automatically update ho jayenge.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    )
}

export const config = defineWidgetConfig({
    zone: "order.list.before",
})

export default AnalyticsDashboardWidget
