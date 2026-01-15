import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ChartBar } from "@medusajs/icons"
import { Heading, Badge } from "@medusajs/ui"
import { useEffect, useState } from "react"

interface TopPerformersData {
    topProducts: {
        id: string
        name: string
        quantitySold: number
        revenue: number
        image?: string
    }[]
    topCustomers: {
        id: string
        name: string
        email: string
        totalSpend: number
        orderCount: number
    }[]
    topCategories: {
        name: string
        revenue: number
        productCount: number
    }[]
    topVariants: {
        variantName: string
        productName: string
        quantitySold: number
        revenue: number
    }[]
    trendingProducts: {
        name: string
        currentSales: number
        previousSales: number
        growthRate: number
    }[]
}

const TopPerformers = () => {
    const [data, setData] = useState<TopPerformersData>({
        topProducts: [],
        topCustomers: [],
        topCategories: [],
        topVariants: [],
        trendingProducts: []
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchTopPerformers = async () => {
            try {
                const [ordersRes, customersRes, productsRes] = await Promise.all([
                    fetch('/admin/orders', { credentials: 'include' }),
                    fetch('/admin/customers', { credentials: 'include' }),
                    fetch('/admin/products', { credentials: 'include' })
                ])

                const ordersData = await ordersRes.json()
                const customersData = await customersRes.json()
                const productsData = await productsRes.json()

                const orders = ordersData.orders || []

                // Calculate Top Products
                const productStats: { [key: string]: { name: string; quantity: number; revenue: number; image?: string } } = {}

                orders.forEach((order: any) => {
                    order.items?.forEach((item: any) => {
                        const productId = item.variant?.product_id || item.product_id
                        const productName = item.title || item.variant?.product?.title || 'Unknown Product'
                        const quantity = item.quantity || 0
                        const revenue = ((item.unit_price || 0) * quantity) / 100
                        const image = item.thumbnail || item.variant?.product?.thumbnail

                        if (!productStats[productId]) {
                            productStats[productId] = { name: productName, quantity: 0, revenue: 0, image }
                        }
                        productStats[productId].quantity += quantity
                        productStats[productId].revenue += revenue
                    })
                })

                const topProducts = Object.entries(productStats)
                    .map(([id, stats]) => ({
                        id,
                        name: stats.name,
                        quantitySold: stats.quantity,
                        revenue: stats.revenue,
                        image: stats.image
                    }))
                    .sort((a, b) => b.revenue - a.revenue)
                    .slice(0, 5)

                // Calculate Top Customers
                const customerStats: { [key: string]: { name: string; email: string; spend: number; orders: number } } = {}

                orders.forEach((order: any) => {
                    const customerId = order.customer_id
                    const customerEmail = order.email || 'Guest'
                    const orderAmount = (order.total || 0) / 100

                    if (customerId) {
                        if (!customerStats[customerId]) {
                            customerStats[customerId] = {
                                name: order.customer?.first_name ? `${order.customer.first_name} ${order.customer.last_name || ''}`.trim() : customerEmail,
                                email: customerEmail,
                                spend: 0,
                                orders: 0
                            }
                        }
                        customerStats[customerId].spend += orderAmount
                        customerStats[customerId].orders += 1
                    }
                })

                const topCustomers = Object.entries(customerStats)
                    .map(([id, stats]) => ({
                        id,
                        name: stats.name,
                        email: stats.email,
                        totalSpend: stats.spend,
                        orderCount: stats.orders
                    }))
                    .sort((a, b) => b.totalSpend - a.totalSpend)
                    .slice(0, 5)

                // Calculate Top Categories
                const categoryStats: { [key: string]: { revenue: number; productCount: Set<string> } } = {}

                orders.forEach((order: any) => {
                    order.items?.forEach((item: any) => {
                        const category = item.variant?.product?.categories?.[0]?.name || 'Uncategorized'
                        const productId = item.variant?.product_id || item.product_id
                        const revenue = ((item.unit_price || 0) * (item.quantity || 0)) / 100

                        if (!categoryStats[category]) {
                            categoryStats[category] = { revenue: 0, productCount: new Set() }
                        }
                        categoryStats[category].revenue += revenue
                        if (productId) {
                            categoryStats[category].productCount.add(productId)
                        }
                    })
                })

                const topCategories = Object.entries(categoryStats)
                    .map(([name, stats]) => ({
                        name,
                        revenue: stats.revenue,
                        productCount: stats.productCount.size
                    }))
                    .sort((a, b) => b.revenue - a.revenue)
                    .slice(0, 5)

                // Calculate Top Variants
                const variantStats: { [key: string]: { variantName: string; productName: string; quantitySold: number; revenue: number } } = {}

                orders.forEach((order: any) => {
                    order.items?.forEach((item: any) => {
                        const variantId = item.variant_id
                        const variantTitle = item.variant?.title || 'Default'
                        const productName = item.title || item.variant?.product?.title || 'Unknown'
                        const quantity = item.quantity || 0
                        const revenue = ((item.unit_price || 0) * quantity) / 100

                        if (variantId) {
                            if (!variantStats[variantId]) {
                                variantStats[variantId] = { variantName: variantTitle, productName, quantitySold: 0, revenue: 0 }
                            }
                            variantStats[variantId].quantitySold += quantity
                            variantStats[variantId].revenue += revenue
                        }
                    })
                })

                const topVariants = Object.values(variantStats)
                    .sort((a, b) => b.revenue - a.revenue)
                    .slice(0, 5)

                // Calculate Trending Products (last 7 days vs previous 7 days)
                const today = new Date()
                const last7DaysStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
                const previous7DaysStart = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000)

                const currentPeriodSales: { [key: string]: { name: string; sales: number } } = {}
                const previousPeriodSales: { [key: string]: number } = {}

                orders.forEach((order: any) => {
                    const orderDate = new Date(order.created_at)

                    order.items?.forEach((item: any) => {
                        const productId = item.variant?.product_id || item.product_id
                        const productName = item.title || item.variant?.product?.title || 'Unknown'
                        const quantity = item.quantity || 0

                        if (orderDate >= last7DaysStart) {
                            if (!currentPeriodSales[productId]) {
                                currentPeriodSales[productId] = { name: productName, sales: 0 }
                            }
                            currentPeriodSales[productId].sales += quantity
                        } else if (orderDate >= previous7DaysStart && orderDate < last7DaysStart) {
                            previousPeriodSales[productId] = (previousPeriodSales[productId] || 0) + quantity
                        }
                    })
                })

                const trendingProducts = Object.entries(currentPeriodSales)
                    .map(([id, data]) => {
                        const currentSales = data.sales
                        const previousSales = previousPeriodSales[id] || 0
                        const growthRate = previousSales > 0 ? ((currentSales - previousSales) / previousSales) * 100 : (currentSales > 0 ? 100 : 0)

                        return {
                            name: data.name,
                            currentSales,
                            previousSales,
                            growthRate
                        }
                    })
                    .filter(p => p.growthRate > 0)
                    .sort((a, b) => b.growthRate - a.growthRate)
                    .slice(0, 5)

                setData({
                    topProducts,
                    topCustomers,
                    topCategories,
                    topVariants,
                    trendingProducts
                })
            } catch (error) {
                console.error('Error fetching top performers:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchTopPerformers()
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
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-500 mx-auto"></div>
                    <p className="mt-4 text-lg text-gray-300">Loading Top Performers...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-8 bg-gray-800 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <Heading level="h1" className="text-4xl font-bold mb-2 text-white">
                    🏆 Top Performers
                </Heading>
                <p className="text-gray-300 text-lg">
                    Your best selling products, top customers, and trending items
                </p>
            </div>

            {/* Top Products */}
            <div className="bg-gray-700 rounded-lg p-6 shadow-lg border border-gray-600 mb-8">
                <Heading level="h3" className="text-2xl font-semibold mb-6 text-white flex items-center gap-2">
                    <span className="text-3xl">🥇</span> Top 5 Selling Products
                </Heading>

                {data.topProducts.length > 0 ? (
                    <div className="space-y-4">
                        {data.topProducts.map((product, index) => (
                            <div key={product.id} className="bg-gray-600 rounded-lg p-5 hover:bg-gray-550 transition-colors">
                                <div className="flex items-center gap-4">
                                    {/* Rank Badge */}
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl ${index === 0 ? 'bg-yellow-500' :
                                        index === 1 ? 'bg-gray-400' :
                                            index === 2 ? 'bg-orange-600' : 'bg-gray-500'
                                        }`}>
                                        {index + 1}
                                    </div>

                                    {/* Product Info */}
                                    <div className="flex-1">
                                        <div className="text-white font-semibold text-lg mb-1">{product.name}</div>
                                        <div className="flex items-center gap-4 text-sm">
                                            <div className="text-gray-300">
                                                <span className="font-medium">Quantity Sold:</span> {product.quantitySold} units
                                            </div>
                                            <div className="text-green-400 font-bold">
                                                Revenue: {formatCurrency(product.revenue)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Trophy Icon */}
                                    {index < 3 && (
                                        <div className="text-4xl">
                                            {index === 0 ? '🏆' : index === 1 ? '🥈' : '🥉'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-400">
                        <div className="text-6xl mb-4">📦</div>
                        <div>No product sales data available</div>
                    </div>
                )}
            </div>

            {/* Top Customers & Top Categories */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Top Customers */}
                <div className="bg-gray-700 rounded-lg p-6 shadow-lg border border-gray-600">
                    <Heading level="h3" className="text-xl font-semibold mb-6 text-white flex items-center gap-2">
                        <span className="text-2xl">👑</span> Top 5 Customers
                    </Heading>

                    {data.topCustomers.length > 0 ? (
                        <div className="space-y-3">
                            {data.topCustomers.map((customer, index) => (
                                <div key={customer.id} className="bg-gray-600 rounded-lg p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-white font-medium">{customer.name}</div>
                                            <div className="text-gray-300 text-sm">{customer.email}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-green-400 font-bold">{formatCurrency(customer.totalSpend)}</div>
                                            <div className="text-gray-400 text-xs">{customer.orderCount} orders</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            <div className="text-4xl mb-2">👥</div>
                            <div>No customer data available</div>
                        </div>
                    )}
                </div>

                {/* Top Categories */}
                <div className="bg-gray-700 rounded-lg p-6 shadow-lg border border-gray-600">
                    <Heading level="h3" className="text-xl font-semibold mb-6 text-white flex items-center gap-2">
                        <span className="text-2xl">📊</span> Top 5 Categories
                    </Heading>

                    {data.topCategories.length > 0 ? (
                        <div className="space-y-3">
                            {data.topCategories.map((category, index) => (
                                <div key={category.name} className="bg-gray-600 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <div className="text-white font-medium">{category.name}</div>
                                                <div className="text-gray-400 text-xs">{category.productCount} products</div>
                                            </div>
                                        </div>
                                        <div className="text-green-400 font-bold">{formatCurrency(category.revenue)}</div>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                                        <div
                                            className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${Math.min((category.revenue / (data.topCategories[0]?.revenue || 1)) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            <div className="text-4xl mb-2">📂</div>
                            <div>No category data available</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Top Variants & Trending Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Variants */}
                <div className="bg-gray-700 rounded-lg p-6 shadow-lg border border-gray-600">
                    <Heading level="h3" className="text-xl font-semibold mb-6 text-white flex items-center gap-2">
                        <span className="text-2xl">🎨</span> Best Selling Variants
                    </Heading>

                    {data.topVariants.length > 0 ? (
                        <div className="space-y-3">
                            {data.topVariants.map((variant, index) => (
                                <div key={index} className="bg-gray-600 rounded-lg p-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-white font-medium">{variant.productName}</div>
                                            <Badge className="mt-1">{variant.variantName}</Badge>
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-sm ml-11">
                                        <span className="text-gray-300">{variant.quantitySold} units sold</span>
                                        <span className="text-green-400 font-bold">{formatCurrency(variant.revenue)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            <div className="text-4xl mb-2">🎯</div>
                            <div>No variant data available</div>
                        </div>
                    )}
                </div>

                {/* Trending Products */}
                <div className="bg-gray-700 rounded-lg p-6 shadow-lg border border-gray-600">
                    <Heading level="h3" className="text-xl font-semibold mb-6 text-white flex items-center gap-2">
                        <span className="text-2xl">📈</span> Trending Products
                    </Heading>

                    {data.trendingProducts.length > 0 ? (
                        <div className="space-y-3">
                            {data.trendingProducts.map((product, index) => (
                                <div key={index} className="bg-gray-600 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="text-2xl">🔥</div>
                                            <div>
                                                <div className="text-white font-medium">{product.name}</div>
                                                <div className="text-gray-400 text-xs">
                                                    {product.currentSales} sales (last 7 days)
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-green-400 font-bold text-lg">+{product.growthRate.toFixed(0)}%</div>
                                            <div className="text-gray-400 text-xs">growth</div>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${Math.min(product.growthRate, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            <div className="text-4xl mb-2">📊</div>
                            <div>No trending data available</div>
                            <div className="text-xs mt-1">Need at least 14 days of sales data</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Info Banner */}
            <div className="mt-8 bg-gray-900 text-white rounded-lg p-6">
                <div className="flex items-start gap-4">
                    <div className="text-3xl">🏆</div>
                    <div>
                        <div className="text-lg font-semibold mb-2">Top Performers Dashboard</div>
                        <div className="text-gray-300 text-sm">
                            Real-time data showing your best products, top customers, leading categories, popular variants, and trending items. All calculations are based on actual order data! 📊
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export const config = defineRouteConfig({
    label: "Top Performers",
    icon: ChartBar,
})

export default TopPerformers
