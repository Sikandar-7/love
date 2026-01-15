import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ChartBar } from "@medusajs/icons"
import { Heading } from "@medusajs/ui"
import { useEffect, useState } from "react"

interface ChartData {
    revenueLineChart: { date: string; revenue: number }[]
    categoryPieChart: { category: string; revenue: number; percentage: number; color: string }[]
    productPieChart: { product: string; revenue: number; percentage: number; color: string }[]
    paymentMethodsPie: { method: string; count: number; percentage: number; color: string }[]
    cumulativeSales: { date: string; cumulative: number }[]
    monthComparison: { thisMonth: number; lastMonth: number; growth: number }
    heatmapData: { hour: number; day: string; orders: number }[]
}

const ChartsVisualization = () => {
    const [charts, setCharts] = useState<ChartData>({
        revenueLineChart: [],
        categoryPieChart: [],
        productPieChart: [],
        paymentMethodsPie: [],
        cumulativeSales: [],
        monthComparison: { thisMonth: 0, lastMonth: 0, growth: 0 },
        heatmapData: []
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchChartData = async () => {
            try {
                const ordersRes = await fetch('/admin/orders', { credentials: 'include' })
                const productsRes = await fetch('/admin/products', { credentials: 'include' })

                const ordersData = await ordersRes.json()
                const productsData = await productsRes.json()

                const orders = ordersData.orders || []
                const products = productsData.products || []

                // Generate Line Chart Data (Last 30 Days) - REAL DATA
                const revenueLineChart = []
                const today = new Date()
                today.setHours(0, 0, 0, 0)

                for (let i = 29; i >= 0; i--) {
                    const date = new Date(today)
                    date.setDate(date.getDate() - i)
                    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

                    // Calculate actual revenue for this day
                    let dayRevenue = 0
                    orders.forEach((order: any) => {
                        const orderDate = new Date(order.created_at)
                        orderDate.setHours(0, 0, 0, 0)
                        if (orderDate.getTime() === date.getTime()) {
                            dayRevenue += (order.total || 0) / 100
                        }
                    })

                    revenueLineChart.push({ date: dateStr, revenue: dayRevenue })
                }

                // Category Pie Chart - Using product categories (if available)
                const categoryRevenue: { [key: string]: number } = {}
                orders.forEach((order: any) => {
                    order.items?.forEach((item: any) => {
                        const category = item.variant?.product?.categories?.[0]?.name || 'Uncategorized'
                        const itemRevenue = ((item.unit_price || 0) * (item.quantity || 0)) / 100
                        categoryRevenue[category] = (categoryRevenue[category] || 0) + itemRevenue
                    })
                })

                const totalCategoryRevenue = Object.values(categoryRevenue).reduce((sum, val) => sum + val, 0)
                const categoryPieChart = Object.entries(categoryRevenue)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([category, revenue], index) => ({
                        category,
                        revenue,
                        percentage: totalCategoryRevenue > 0 ? Math.round((revenue / totalCategoryRevenue) * 100) : 0,
                        color: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'][index]
                    }))

                // Product Pie Chart - REAL DATA from orders
                const productRevenue: { [key: string]: { revenue: number; name: string } } = {}
                orders.forEach((order: any) => {
                    order.items?.forEach((item: any) => {
                        const productId = item.variant?.product_id || item.product_id
                        const productName = item.title || item.variant?.product?.title || 'Unknown Product'
                        const itemRevenue = ((item.unit_price || 0) * (item.quantity || 0)) / 100

                        if (!productRevenue[productId]) {
                            productRevenue[productId] = { revenue: 0, name: productName }
                        }
                        productRevenue[productId].revenue += itemRevenue
                    })
                })

                const totalProductRevenue = Object.values(productRevenue).reduce((sum, p) => sum + p.revenue, 0)
                const productPieChart = Object.entries(productRevenue)
                    .sort(([, a], [, b]) => b.revenue - a.revenue)
                    .slice(0, 5)
                    .map(([, data], index) => ({
                        product: data.name,
                        revenue: data.revenue,
                        percentage: totalProductRevenue > 0 ? Math.round((data.revenue / totalProductRevenue) * 100) : 0,
                        color: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'][index]
                    }))

                // Payment Methods Distribution - REAL DATA
                const totalOrders = orders.length
                let codOrders = 0
                let cardOrders = 0
                let otherOrders = 0

                orders.forEach((order: any) => {
                    const paymentStatus = order.payment_status
                    if (paymentStatus === 'awaiting' || paymentStatus === 'not_paid') {
                        codOrders++
                    } else if (paymentStatus === 'captured' || paymentStatus === 'authorized') {
                        cardOrders++
                    } else {
                        otherOrders++
                    }
                })

                const paymentMethodsPie = [
                    {
                        method: 'Cash on Delivery',
                        count: codOrders,
                        percentage: totalOrders > 0 ? Math.round((codOrders / totalOrders) * 100) : 0,
                        color: '#f59e0b'
                    },
                    {
                        method: 'Credit/Debit Card',
                        count: cardOrders,
                        percentage: totalOrders > 0 ? Math.round((cardOrders / totalOrders) * 100) : 0,
                        color: '#3b82f6'
                    },
                    {
                        method: 'Other Methods',
                        count: otherOrders,
                        percentage: totalOrders > 0 ? Math.round((otherOrders / totalOrders) * 100) : 0,
                        color: '#10b981'
                    }
                ].filter(method => method.count > 0)

                // Cumulative Sales (Last 30 Days) - REAL DATA
                const cumulativeSales = []
                let cumulative = 0

                for (let i = 29; i >= 0; i--) {
                    const date = new Date(today)
                    date.setDate(date.getDate() - i)
                    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

                    // Add revenue from this day to cumulative
                    orders.forEach((order: any) => {
                        const orderDate = new Date(order.created_at)
                        orderDate.setHours(0, 0, 0, 0)
                        if (orderDate.getTime() === date.getTime()) {
                            cumulative += (order.total || 0) / 100
                        }
                    })

                    cumulativeSales.push({ date: dateStr, cumulative })
                }

                // Month Comparison - REAL DATA
                const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
                const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1)
                const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)

                let thisMonth = 0
                let lastMonth = 0

                orders.forEach((order: any) => {
                    const orderDate = new Date(order.created_at)
                    const orderAmount = (order.total || 0) / 100

                    if (orderDate >= thisMonthStart) {
                        thisMonth += orderAmount
                    } else if (orderDate >= lastMonthStart && orderDate <= lastMonthEnd) {
                        lastMonth += orderAmount
                    }
                })

                const growth = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0

                // Heatmap Data (7 days x 24 hours) - REAL DATA
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                const heatmapData = []

                for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
                    for (let hour = 0; hour < 24; hour++) {
                        let orderCount = 0

                        orders.forEach((order: any) => {
                            const orderDate = new Date(order.created_at)
                            if (orderDate.getDay() === dayIndex && orderDate.getHours() === hour) {
                                orderCount++
                            }
                        })

                        heatmapData.push({
                            hour,
                            day: days[dayIndex],
                            orders: orderCount
                        })
                    }
                }

                setCharts({
                    revenueLineChart,
                    categoryPieChart: categoryPieChart.length > 0 ? categoryPieChart : [
                        { category: 'No Data', revenue: 0, percentage: 100, color: '#6b7280' }
                    ],
                    productPieChart: productPieChart.length > 0 ? productPieChart : [
                        { product: 'No Data', revenue: 0, percentage: 100, color: '#6b7280' }
                    ],
                    paymentMethodsPie: paymentMethodsPie.length > 0 ? paymentMethodsPie : [
                        { method: 'No Data', count: 0, percentage: 100, color: '#6b7280' }
                    ],
                    cumulativeSales,
                    monthComparison: { thisMonth, lastMonth, growth },
                    heatmapData
                })
            } catch (error) {
                console.error('Error fetching chart data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchChartData()
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
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-500 mx-auto"></div>
                    <p className="mt-4 text-lg text-gray-300">Loading Charts...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-8 bg-gray-800 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <Heading level="h1" className="text-4xl font-bold mb-2 text-white">
                    📈 Charts & Visualizations
                </Heading>
                <p className="text-gray-300 text-lg">
                    Beautiful visual insights for your e-commerce data
                </p>
            </div>

            {/* Line Chart - Revenue Trends */}
            <div className="bg-gray-700 rounded-lg p-6 shadow-lg border border-gray-600 mb-8">
                <Heading level="h3" className="text-xl font-semibold mb-6 text-white">
                    📊 Revenue Trends (Last 30 Days) - Line Chart
                </Heading>
                <div className="relative h-80">
                    {/* Y-axis labels */}
                    <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col justify-between text-gray-400 text-sm">
                        <span>60k</span>
                        <span>45k</span>
                        <span>30k</span>
                        <span>15k</span>
                        <span>0</span>
                    </div>

                    {/* Chart area */}
                    <div className="ml-16 h-full relative">
                        <svg className="w-full h-full" viewBox="0 0 1000 300" preserveAspectRatio="none">
                            {/* Grid lines */}
                            <line x1="0" y1="0" x2="1000" y2="0" stroke="#4b5563" strokeWidth="1" />
                            <line x1="0" y1="75" x2="1000" y2="75" stroke="#4b5563" strokeWidth="1" />
                            <line x1="0" y1="150" x2="1000" y2="150" stroke="#4b5563" strokeWidth="1" />
                            <line x1="0" y1="225" x2="1000" y2="225" stroke="#4b5563" strokeWidth="1" />
                            <line x1="0" y1="300" x2="1000" y2="300" stroke="#4b5563" strokeWidth="1" />

                            {/* Line chart path */}
                            <polyline
                                fill="none"
                                stroke="#6366f1"
                                strokeWidth="3"
                                points={charts.revenueLineChart.map((point, index) => {
                                    const x = (index / (charts.revenueLineChart.length - 1)) * 1000
                                    const y = 300 - ((point.revenue / 60000) * 300)
                                    return `${x},${y}`
                                }).join(' ')}
                            />

                            {/* Area fill */}
                            <polygon
                                fill="url(#gradient)"
                                opacity="0.3"
                                points={`0,300 ${charts.revenueLineChart.map((point, index) => {
                                    const x = (index / (charts.revenueLineChart.length - 1)) * 1000
                                    const y = 300 - ((point.revenue / 60000) * 300)
                                    return `${x},${y}`
                                }).join(' ')} 1000,300`}
                            />

                            <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
                                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>

                    {/* X-axis labels */}
                    <div className="ml-16 mt-2 flex justify-between text-gray-400 text-xs">
                        {charts.revenueLineChart.filter((_, i) => i % 5 === 0).map((point, index) => (
                            <span key={index}>{point.date}</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Pie Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Revenue by Category - Pie Chart */}
                <div className="bg-gray-700 rounded-lg p-6 shadow-lg border border-gray-600">
                    <Heading level="h3" className="text-lg font-semibold mb-6 text-white">
                        🎯 Revenue by Category
                    </Heading>
                    <div className="flex items-center justify-center mb-4">
                        <div className="relative w-48 h-48">
                            <svg viewBox="0 0 200 200" className="transform -rotate-90">
                                {charts.categoryPieChart.reduce((acc, slice, index) => {
                                    const startAngle = acc.angle
                                    const sliceAngle = (slice.percentage / 100) * 360
                                    const endAngle = startAngle + sliceAngle

                                    const x1 = 100 + 90 * Math.cos((startAngle * Math.PI) / 180)
                                    const y1 = 100 + 90 * Math.sin((startAngle * Math.PI) / 180)
                                    const x2 = 100 + 90 * Math.cos((endAngle * Math.PI) / 180)
                                    const y2 = 100 + 90 * Math.sin((endAngle * Math.PI) / 180)

                                    const largeArc = sliceAngle > 180 ? 1 : 0

                                    acc.paths.push(
                                        <path
                                            key={index}
                                            d={`M 100 100 L ${x1} ${y1} A 90 90 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                            fill={slice.color}
                                            className="hover:opacity-80 transition-opacity cursor-pointer"
                                        />
                                    )

                                    acc.angle = endAngle
                                    return acc
                                }, { angle: 0, paths: [] as JSX.Element[] }).paths}
                            </svg>
                        </div>
                    </div>
                    <div className="space-y-2">
                        {charts.categoryPieChart.map((slice, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: slice.color }}></div>
                                    <span className="text-gray-300">{slice.category}</span>
                                </div>
                                <span className="text-white font-semibold">{slice.percentage}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Revenue by Product - Pie Chart */}
                <div className="bg-gray-700 rounded-lg p-6 shadow-lg border border-gray-600">
                    <Heading level="h3" className="text-lg font-semibold mb-6 text-white">
                        🛍️ Top Products Revenue
                    </Heading>
                    <div className="flex items-center justify-center mb-4">
                        <div className="relative w-48 h-48">
                            <svg viewBox="0 0 200 200" className="transform -rotate-90">
                                {charts.productPieChart.reduce((acc, slice, index) => {
                                    const startAngle = acc.angle
                                    const sliceAngle = (slice.percentage / 100) * 360
                                    const endAngle = startAngle + sliceAngle

                                    const x1 = 100 + 90 * Math.cos((startAngle * Math.PI) / 180)
                                    const y1 = 100 + 90 * Math.sin((startAngle * Math.PI) / 180)
                                    const x2 = 100 + 90 * Math.cos((endAngle * Math.PI) / 180)
                                    const y2 = 100 + 90 * Math.sin((endAngle * Math.PI) / 180)

                                    const largeArc = sliceAngle > 180 ? 1 : 0

                                    acc.paths.push(
                                        <path
                                            key={index}
                                            d={`M 100 100 L ${x1} ${y1} A 90 90 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                            fill={slice.color}
                                            className="hover:opacity-80 transition-opacity cursor-pointer"
                                        />
                                    )

                                    acc.angle = endAngle
                                    return acc
                                }, { angle: 0, paths: [] as JSX.Element[] }).paths}
                            </svg>
                        </div>
                    </div>
                    <div className="space-y-2">
                        {charts.productPieChart.map((slice, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: slice.color }}></div>
                                    <span className="text-gray-300 truncate">{slice.product}</span>
                                </div>
                                <span className="text-white font-semibold">{slice.percentage}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Payment Methods - Pie Chart */}
                <div className="bg-gray-700 rounded-lg p-6 shadow-lg border border-gray-600">
                    <Heading level="h3" className="text-lg font-semibold mb-6 text-white">
                        💳 Payment Methods
                    </Heading>
                    <div className="flex items-center justify-center mb-4">
                        <div className="relative w-48 h-48">
                            <svg viewBox="0 0 200 200" className="transform -rotate-90">
                                {charts.paymentMethodsPie.reduce((acc, slice, index) => {
                                    const startAngle = acc.angle
                                    const sliceAngle = (slice.percentage / 100) * 360
                                    const endAngle = startAngle + sliceAngle

                                    const x1 = 100 + 90 * Math.cos((startAngle * Math.PI) / 180)
                                    const y1 = 100 + 90 * Math.sin((startAngle * Math.PI) / 180)
                                    const x2 = 100 + 90 * Math.cos((endAngle * Math.PI) / 180)
                                    const y2 = 100 + 90 * Math.sin((endAngle * Math.PI) / 180)

                                    const largeArc = sliceAngle > 180 ? 1 : 0

                                    acc.paths.push(
                                        <path
                                            key={index}
                                            d={`M 100 100 L ${x1} ${y1} A 90 90 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                            fill={slice.color}
                                            className="hover:opacity-80 transition-opacity cursor-pointer"
                                        />
                                    )

                                    acc.angle = endAngle
                                    return acc
                                }, { angle: 0, paths: [] as JSX.Element[] }).paths}
                            </svg>
                        </div>
                    </div>
                    <div className="space-y-2">
                        {charts.paymentMethodsPie.map((slice, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: slice.color }}></div>
                                    <span className="text-gray-300">{slice.method}</span>
                                </div>
                                <span className="text-white font-semibold">{slice.percentage}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Area Chart - Cumulative Sales */}
            <div className="bg-gray-700 rounded-lg p-6 shadow-lg border border-gray-600 mb-8">
                <Heading level="h3" className="text-xl font-semibold mb-6 text-white">
                    📈 Cumulative Sales (Last 30 Days) - Area Chart
                </Heading>
                <div className="relative h-64">
                    <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col justify-between text-gray-400 text-sm">
                        <span>1.2M</span>
                        <span>900k</span>
                        <span>600k</span>
                        <span>300k</span>
                        <span>0</span>
                    </div>

                    <div className="ml-16 h-full">
                        <svg className="w-full h-full" viewBox="0 0 1000 250" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
                                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.1" />
                                </linearGradient>
                            </defs>

                            <polygon
                                fill="url(#areaGradient)"
                                points={`0,250 ${charts.cumulativeSales.map((point, index) => {
                                    const x = (index / (charts.cumulativeSales.length - 1)) * 1000
                                    const y = 250 - ((point.cumulative / 1200000) * 250)
                                    return `${x},${y}`
                                }).join(' ')} 1000,250`}
                            />

                            <polyline
                                fill="none"
                                stroke="#10b981"
                                strokeWidth="3"
                                points={charts.cumulativeSales.map((point, index) => {
                                    const x = (index / (charts.cumulativeSales.length - 1)) * 1000
                                    const y = 250 - ((point.cumulative / 1200000) * 250)
                                    return `${x},${y}`
                                }).join(' ')}
                            />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Month Comparison */}
            <div className="bg-gray-700 rounded-lg p-6 shadow-lg border border-gray-600 mb-8">
                <Heading level="h3" className="text-xl font-semibold mb-6 text-white">
                    📊 This Month vs Last Month Comparison
                </Heading>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-600 rounded-lg p-6 text-center">
                        <div className="text-gray-300 text-sm mb-2">This Month</div>
                        <div className="text-3xl font-bold text-white">{formatCurrency(charts.monthComparison.thisMonth)}</div>
                    </div>
                    <div className="bg-gray-600 rounded-lg p-6 text-center">
                        <div className="text-gray-300 text-sm mb-2">Last Month</div>
                        <div className="text-3xl font-bold text-white">{formatCurrency(charts.monthComparison.lastMonth)}</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg p-6 text-center">
                        <div className="text-white text-sm mb-2 opacity-90">Growth Rate</div>
                        <div className="text-3xl font-bold text-white">+{charts.monthComparison.growth.toFixed(1)}%</div>
                    </div>
                </div>
            </div>

            {/* Heatmap - Busiest Hours/Days */}
            <div className="bg-gray-700 rounded-lg p-6 shadow-lg border border-gray-600">
                <Heading level="h3" className="text-xl font-semibold mb-6 text-white">
                    🔥 Busiest Hours & Days - Heatmap
                </Heading>
                <div className="overflow-x-auto">
                    <div className="inline-block min-w-full">
                        <div className="flex gap-1 mb-2">
                            <div className="w-12"></div>
                            {Array.from({ length: 24 }, (_, i) => (
                                <div key={i} className="w-8 text-center text-xs text-gray-400">
                                    {i}
                                </div>
                            ))}
                        </div>
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                            <div key={day} className="flex gap-1 mb-1">
                                <div className="w-12 text-sm text-gray-300 flex items-center">{day}</div>
                                {Array.from({ length: 24 }, (_, hour) => {
                                    const data = charts.heatmapData.find(d => d.day === day && d.hour === hour)
                                    const orders = data?.orders || 0
                                    const intensity = Math.min(orders / 20, 1)
                                    const bgColor = `rgba(99, 102, 241, ${intensity})`

                                    return (
                                        <div
                                            key={hour}
                                            className="w-8 h-8 rounded transition-all hover:scale-110 cursor-pointer"
                                            style={{ backgroundColor: bgColor }}
                                            title={`${day} ${hour}:00 - ${orders} orders`}
                                        />
                                    )
                                })}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="mt-4 flex items-center justify-center gap-4">
                    <span className="text-gray-400 text-sm">Less</span>
                    <div className="flex gap-1">
                        {[0.2, 0.4, 0.6, 0.8, 1].map((intensity, i) => (
                            <div
                                key={i}
                                className="w-6 h-6 rounded"
                                style={{ backgroundColor: `rgba(99, 102, 241, ${intensity})` }}
                            />
                        ))}
                    </div>
                    <span className="text-gray-400 text-sm">More</span>
                </div>
            </div>

            {/* Info */}
            <div className="mt-8 bg-gray-900 text-white rounded-lg p-6">
                <div className="flex items-start gap-4">
                    <div className="text-3xl">📊</div>
                    <div>
                        <div className="text-lg font-semibold mb-2">Interactive Charts & Visualizations</div>
                        <div className="text-gray-300 text-sm">
                            Beautiful charts with line graphs, pie charts, area charts, comparisons, aur heatmaps - sab real-time data ke saath! 📈
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export const config = defineRouteConfig({
    label: "Charts",
    icon: ChartBar,
})

export default ChartsVisualization
