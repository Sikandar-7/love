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
                        todaySales: todaySales,
                        weekSales: weekSales,
                        monthSales: monthSales,
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
                    <div className="p-4 rounded-lg border border-ui-border-base bg-ui-bg-subtle shadow-elevation-card-rest hover:shadow-elevation-card-hover transition-shadow">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-ui-bg-base border border-ui-border-base rounded text-ui-tag-blue-text">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <span className="text-sm font-medium text-ui-fg-subtle">Today's Sales</span>
                        </div>
                        <div className="text-2xl font-semibold text-ui-fg-base">{formatCurrency(stats.todaySales)}</div>
                    </div>

                    {/* This Week */}
                    <div className="p-4 rounded-lg border border-ui-border-base bg-ui-bg-subtle shadow-elevation-card-rest hover:shadow-elevation-card-hover transition-shadow">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-ui-bg-base border border-ui-border-base rounded text-ui-tag-green-text">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                            </div>
                            <span className="text-sm font-medium text-ui-fg-subtle">Last 7 Days</span>
                        </div>
                        <div className="text-2xl font-semibold text-ui-fg-base">{formatCurrency(stats.weekSales)}</div>
                    </div>

                    {/* This Month */}
                    <div className="p-4 rounded-lg border border-ui-border-base bg-ui-bg-subtle shadow-elevation-card-rest hover:shadow-elevation-card-hover transition-shadow">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-ui-bg-base border border-ui-border-base rounded text-ui-tag-purple-text">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </div>
                            <span className="text-sm font-medium text-ui-fg-subtle">Last 30 Days</span>
                        </div>
                        <div className="text-2xl font-semibold text-ui-fg-base">{formatCurrency(stats.monthSales)}</div>
                    </div>

                    {/* Total Orders */}
                    <div className="p-4 rounded-lg border border-ui-border-base bg-ui-bg-subtle shadow-elevation-card-rest hover:shadow-elevation-card-hover transition-shadow">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-ui-bg-base border border-ui-border-base rounded text-ui-tag-orange-text">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                            </div>
                            <span className="text-sm font-medium text-ui-fg-subtle">Total Orders</span>
                        </div>
                        <div className="text-2xl font-semibold text-ui-fg-base">{stats.totalOrders}</div>
                    </div>
                </div>

                {/* Order Status */}
                <div className="mb-6">
                    <h3 className="text-sm font-medium text-ui-fg-subtle mb-3">Order Status</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-lg border border-ui-border-base bg-ui-bg-subtle flex items-center justify-between">
                            <div>
                                <div className="text-2xl font-semibold text-ui-fg-base">{stats.pendingOrders}</div>
                                <div className="text-sm text-ui-fg-subtle">Pending</div>
                            </div>
                            <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                        </div>

                        <div className="p-4 rounded-lg border border-ui-border-base bg-ui-bg-subtle flex items-center justify-between">
                            <div>
                                <div className="text-2xl font-semibold text-ui-fg-base">{stats.processingOrders}</div>
                                <div className="text-sm text-ui-fg-subtle">Processing</div>
                            </div>
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                            </div>
                        </div>

                        <div className="p-4 rounded-lg border border-ui-border-base bg-ui-bg-subtle flex items-center justify-between">
                            <div>
                                <div className="text-2xl font-semibold text-ui-fg-base">{stats.completedOrders}</div>
                                <div className="text-sm text-ui-fg-subtle">Completed</div>
                            </div>
                            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </div>
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
