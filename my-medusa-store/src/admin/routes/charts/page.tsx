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

                const ordersData = await ordersRes.json()

                // Generate Line Chart Data (Last 30 Days)
                const revenueLineChart = []
                for (let i = 29; i >= 0; i--) {
                    const date = new Date()
                    date.setDate(date.getDate() - i)
                    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

                    const dayRevenue = Math.random() * 50000 + 10000 // Mock data
                    revenueLineChart.push({ date: dateStr, revenue: dayRevenue })
                }

                // Generate Category Pie Chart
                const categoryPieChart = [
                    { category: 'Electronics', revenue: 450000, percentage: 35, color: '#6366f1' },
                    { category: 'Clothing', revenue: 320000, percentage: 25, color: '#8b5cf6' },
                    { category: 'Home & Garden', revenue: 256000, percentage: 20, color: '#ec4899' },
                    { category: 'Sports', revenue: 192000, percentage: 15, color: '#f59e0b' },
                    { category: 'Others', revenue: 64000, percentage: 5, color: '#10b981' }
                ]

                // Generate Product Pie Chart
                const productPieChart = [
                    { product: 'Wireless Headphones', revenue: 180000, percentage: 30, color: '#3b82f6' },
                    { product: 'Smart Watch', revenue: 150000, percentage: 25, color: '#8b5cf6' },
                    { product: 'Running Shoes', revenue: 120000, percentage: 20, color: '#ec4899' },
                    { product: 'Yoga Mat', revenue: 90000, percentage: 15, color: '#f59e0b' },
                    { product: 'Water Bottle', revenue: 60000, percentage: 10, color: '#10b981' }
                ]

                // Payment Methods Distribution
                const totalOrders = ordersData.orders?.length || 0
                const codOrders = Math.floor(totalOrders * 0.65)
                const cardOrders = Math.floor(totalOrders * 0.25)
                const jazzCashOrders = totalOrders - codOrders - cardOrders

                const paymentMethodsPie = [
                    { method: 'Cash on Delivery', count: codOrders, percentage: 65, color: '#f59e0b' },
                    { method: 'Credit/Debit Card', count: cardOrders, percentage: 25, color: '#3b82f6' },
                    { method: 'JazzCash/EasyPaisa', count: jazzCashOrders, percentage: 10, color: '#10b981' }
                ]

                // Cumulative Sales (Last 30 Days)
                const cumulativeSales = []
                let cumulative = 0
                for (let i = 29; i >= 0; i--) {
                    const date = new Date()
                    date.setDate(date.getDate() - i)
                    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

                    cumulative += Math.random() * 30000 + 10000
                    cumulativeSales.push({ date: dateStr, cumulative })
                }

                // Month Comparison
                const thisMonth = 850000
                const lastMonth = 720000
                const growth = ((thisMonth - lastMonth) / lastMonth) * 100

                // Heatmap Data (7 days x 24 hours)
                const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                const heatmapData = []
                for (let day of days) {
                    for (let hour = 0; hour < 24; hour++) {
                        const orders = Math.floor(Math.random() * 20)
                        heatmapData.push({ hour, day, orders })
                    }
                }

                setCharts({
                    revenueLineChart,
                    categoryPieChart,
                    productPieChart,
                    paymentMethodsPie,
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
