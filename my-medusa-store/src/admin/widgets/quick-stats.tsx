import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading } from "@medusajs/ui"
import { useEffect, useState } from "react"

const QuickStatsWidget = () => {
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        monthRevenue: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch products
                const productsResponse = await fetch('/admin/products', {
                    credentials: 'include',
                })
                const productsData = await productsResponse.json()

                // Fetch orders
                const ordersResponse = await fetch('/admin/orders', {
                    credentials: 'include',
                })
                const ordersData = await ordersResponse.json()

                let monthRevenue = 0
                if (ordersData.orders) {
                    const monthAgo = new Date()
                    monthAgo.setDate(monthAgo.getDate() - 30)

                    ordersData.orders.forEach((order: any) => {
                        const orderDate = new Date(order.created_at)
                        if (orderDate >= monthAgo) {
                            monthRevenue += order.total || 0
                        }
                    })
                }

                setStats({
                    totalProducts: productsData.products?.length || 0,
                    totalOrders: ordersData.orders?.length || 0,
                    monthRevenue: monthRevenue
                })
            } catch (error) {
                console.error('Error fetching stats:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
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
                    <p className="mt-4 text-gray-600">Loading stats...</p>
                </div>
            </Container>
        )
    }

    return (
        <Container className="p-6">
            <Heading level="h2" className="text-xl font-semibold mb-6">
                ⚡ Quick Stats (Real Data)
            </Heading>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border border-ui-border-base bg-ui-bg-subtle shadow-elevation-card-rest hover:shadow-elevation-card-hover transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-ui-bg-base border border-ui-border-base rounded-lg text-ui-tag-blue-text">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                        </div>
                        <div>
                            <div className="text-sm text-ui-fg-subtle">Total Products</div>
                            <div className="text-xl font-semibold text-ui-fg-base">{stats.totalProducts}</div>
                        </div>
                    </div>
                </div>

                <div className="p-4 rounded-lg border border-ui-border-base bg-ui-bg-subtle shadow-elevation-card-rest hover:shadow-elevation-card-hover transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-ui-bg-base border border-ui-border-base rounded-lg text-ui-tag-green-text">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div>
                            <div className="text-sm text-ui-fg-subtle">Total Orders</div>
                            <div className="text-xl font-semibold text-ui-fg-base">{stats.totalOrders}</div>
                        </div>
                    </div>
                </div>

                <div className="p-4 rounded-lg border border-ui-border-base bg-ui-bg-subtle shadow-elevation-card-rest hover:shadow-elevation-card-hover transition-shadow col-span-2 md:col-span-1">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-ui-bg-base border border-ui-border-base rounded-lg text-ui-tag-orange-text">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div>
                            <div className="text-sm text-ui-fg-subtle">Revenue (30d)</div>
                            <div className="text-xl font-semibold text-ui-fg-base">{formatCurrency(stats.monthRevenue)}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Info Message */}
            <div className="mt-6 flex items-start gap-3 p-3 bg-ui-bg-subtle rounded-lg border border-ui-border-base">
                <svg className="w-5 h-5 text-ui-fg-muted mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <div className="text-sm text-ui-fg-subtle">
                    Real-time data from your store. Updates automatically.
                </div>
            </div>
        </Container>
    )
}

export const config = defineWidgetConfig({
    zone: "product.list.before",
})

export default QuickStatsWidget
