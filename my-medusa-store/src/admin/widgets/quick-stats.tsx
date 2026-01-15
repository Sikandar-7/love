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
                    monthRevenue: monthRevenue / 100
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
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-3xl mb-2">📦</div>
                    <div className="text-2xl font-bold text-blue-900">{stats.totalProducts}</div>
                    <div className="text-sm text-blue-600">Total Products</div>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-3xl mb-2">✅</div>
                    <div className="text-2xl font-bold text-green-900">{stats.totalOrders}</div>
                    <div className="text-sm text-green-600">Total Orders</div>
                </div>

                <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200 col-span-2 md:col-span-1">
                    <div className="text-3xl mb-2">💰</div>
                    <div className="text-xl font-bold text-orange-900">{formatCurrency(stats.monthRevenue)}</div>
                    <div className="text-sm text-orange-600">Revenue (30 Days)</div>
                </div>
            </div>

            {/* Info Message */}
            <div className="mt-6 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <div className="text-2xl">💡</div>
                    <div>
                        <div className="font-semibold text-indigo-900 mb-1">Real-Time Stats</div>
                        <div className="text-sm text-indigo-700">
                            Ye aapke actual store ka data hai. Products aur orders add karne pe automatically update hoga.
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    )
}

export const config = defineWidgetConfig({
    zone: "product.list.before",
})

export default QuickStatsWidget
