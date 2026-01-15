import { defineRouteConfig } from "@medusajs/admin-sdk"
import { MapPin } from "@medusajs/icons"
import { Heading, Badge } from "@medusajs/ui"
import { useEffect, useState } from "react"

interface PakistanMetrics {
    codVsOnline: {
        codOrders: number
        codAmount: number
        onlineOrders: number
        onlineAmount: number
        codPercentage: number
    }
    ordersByCity: {
        city: string
        orders: number
        revenue: number
        percentage: number
    }[]
    seasonalTrends: {
        month: string
        revenue: number
        orders: number
        isRamadan: boolean
        isEid: boolean
    }[]
    totalRevenue: number
    totalOrders: number
    currentTime: string
}

const PakistanMetrics = () => {
    const [metrics, setMetrics] = useState<PakistanMetrics>({
        codVsOnline: {
            codOrders: 0,
            codAmount: 0,
            onlineOrders: 0,
            onlineAmount: 0,
            codPercentage: 0
        },
        ordersByCity: [],
        seasonalTrends: [],
        totalRevenue: 0,
        totalOrders: 0,
        currentTime: ''
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchPakistanMetrics = async () => {
            try {
                const ordersRes = await fetch('/admin/orders', { credentials: 'include' })
                const ordersData = await ordersRes.json()
                const orders = ordersData.orders || []

                // COD vs Online Payment
                let codOrders = 0
                let codAmount = 0
                let onlineOrders = 0
                let onlineAmount = 0

                orders.forEach((order: any) => {
                    const amount = (order.total || 0) / 100

                    if (order.payment_status === 'awaiting' || order.payment_status === 'not_paid') {
                        codOrders++
                        codAmount += amount
                    } else if (order.payment_status === 'captured' || order.payment_status === 'authorized') {
                        onlineOrders++
                        onlineAmount += amount
                    }
                })

                const totalOrders = codOrders + onlineOrders
                const codPercentage = totalOrders > 0 ? Math.round((codOrders / totalOrders) * 100) : 0

                // Orders by Pakistani Cities
                const cityMap: { [key: string]: { orders: number; revenue: number } } = {}

                orders.forEach((order: any) => {
                    let city = order.shipping_address?.city || 'Unknown'

                    // Normalize city names
                    city = city.trim()
                    if (city.toLowerCase().includes('karachi')) city = 'Karachi'
                    else if (city.toLowerCase().includes('lahore')) city = 'Lahore'
                    else if (city.toLowerCase().includes('islamabad')) city = 'Islamabad'
                    else if (city.toLowerCase().includes('rawalpindi')) city = 'Rawalpindi'
                    else if (city.toLowerCase().includes('faisalabad')) city = 'Faisalabad'
                    else if (city.toLowerCase().includes('multan')) city = 'Multan'
                    else if (city.toLowerCase().includes('peshawar')) city = 'Peshawar'
                    else if (city.toLowerCase().includes('quetta')) city = 'Quetta'
                    else if (city.toLowerCase().includes('sialkot')) city = 'Sialkot'
                    else if (city.toLowerCase().includes('gujranwala')) city = 'Gujranwala'

                    if (!cityMap[city]) {
                        cityMap[city] = { orders: 0, revenue: 0 }
                    }
                    cityMap[city].orders += 1
                    cityMap[city].revenue += (order.total || 0) / 100
                })

                const totalOrdersCount = orders.length
                const ordersByCity = Object.entries(cityMap)
                    .map(([city, data]) => ({
                        city,
                        orders: data.orders,
                        revenue: data.revenue,
                        percentage: totalOrdersCount > 0 ? Math.round((data.orders / totalOrdersCount) * 100) : 0
                    }))
                    .sort((a, b) => b.orders - a.orders)
                    .slice(0, 10)

                // Seasonal Trends (Monthly breakdown with Ramadan/Eid detection)
                const monthlyData: { [key: string]: { revenue: number; orders: number } } = {}

                orders.forEach((order: any) => {
                    const date = new Date(order.created_at)
                    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

                    if (!monthlyData[monthKey]) {
                        monthlyData[monthKey] = { revenue: 0, orders: 0 }
                    }
                    monthlyData[monthKey].revenue += (order.total || 0) / 100
                    monthlyData[monthKey].orders += 1
                })

                // Ramadan months (approximate - varies by year)
                // 2024: March-April, 2025: March, 2026: February-March
                const ramadanMonths = ['2024-03', '2024-04', '2025-03', '2026-02', '2026-03']
                const eidMonths = ['2024-04', '2024-06', '2025-03', '2025-06', '2026-03', '2026-06']

                const seasonalTrends = Object.entries(monthlyData)
                    .map(([month, data]) => {
                        const date = new Date(month + '-01')
                        return {
                            month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                            revenue: data.revenue,
                            orders: data.orders,
                            isRamadan: ramadanMonths.includes(month),
                            isEid: eidMonths.includes(month)
                        }
                    })
                    .sort((a, b) => a.month.localeCompare(b.month))
                    .slice(-12) // Last 12 months

                // Total Revenue
                const totalRevenue = orders.reduce((sum: number, order: any) => sum + ((order.total || 0) / 100), 0)

                // Pakistan Local Time
                const currentTime = new Date().toLocaleString('en-PK', {
                    timeZone: 'Asia/Karachi',
                    dateStyle: 'full',
                    timeStyle: 'long'
                })

                setMetrics({
                    codVsOnline: {
                        codOrders,
                        codAmount,
                        onlineOrders,
                        onlineAmount,
                        codPercentage
                    },
                    ordersByCity,
                    seasonalTrends,
                    totalRevenue,
                    totalOrders: orders.length,
                    currentTime
                })
            } catch (error) {
                console.error('Error fetching Pakistan metrics:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchPakistanMetrics()

        // Update time every second
        const timeInterval = setInterval(() => {
            const currentTime = new Date().toLocaleString('en-PK', {
                timeZone: 'Asia/Karachi',
                dateStyle: 'full',
                timeStyle: 'long'
            })
            setMetrics(prev => ({ ...prev, currentTime }))
        }, 1000)

        return () => clearInterval(timeInterval)
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
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-500 mx-auto"></div>
                    <p className="mt-4 text-lg text-gray-300">Loading Pakistan Metrics...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-8 bg-gray-800 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <Heading level="h1" className="text-4xl font-bold text-white">
                        🇵🇰 Pakistan-Specific Metrics
                    </Heading>
                </div>
                <p className="text-gray-300 text-lg">
                    Insights tailored for the Pakistani e-commerce market
                </p>
            </div>

            {/* Local Time Display */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-lg p-6 shadow-lg mb-8">
                <div className="text-center">
                    <div className="text-white text-sm opacity-90 mb-2">🕐 Pakistan Standard Time (PST)</div>
                    <div className="text-white text-3xl font-bold">{metrics.currentTime}</div>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl p-6 shadow-lg">
                    <div className="text-sm opacity-90 mb-1">Total Revenue (PKR)</div>
                    <div className="text-4xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
                    <div className="text-sm opacity-80 mt-2">{metrics.totalOrders} total orders</div>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-xl p-6 shadow-lg">
                    <div className="text-sm opacity-90 mb-1">COD Preference</div>
                    <div className="text-4xl font-bold">{metrics.codVsOnline.codPercentage}%</div>
                    <div className="text-sm opacity-80 mt-2">Cash on Delivery orders</div>
                </div>
            </div>

            {/* COD vs Online Payment */}
            <div className="bg-gray-700 rounded-lg p-6 shadow-lg border border-gray-600 mb-8">
                <Heading level="h3" className="text-2xl font-semibold mb-6 text-white flex items-center gap-2">
                    <span className="text-3xl">💳</span> COD vs Online Payment Ratio
                </Heading>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* COD */}
                    <div className="bg-orange-900 border border-orange-600 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="text-4xl">💵</div>
                            <div>
                                <div className="text-orange-200 text-sm">Cash on Delivery</div>
                                <div className="text-white text-3xl font-bold">{metrics.codVsOnline.codOrders}</div>
                            </div>
                        </div>
                        <div className="text-orange-300 text-lg font-bold mb-2">
                            {formatCurrency(metrics.codVsOnline.codAmount)}
                        </div>
                        <div className="text-orange-200 text-sm">
                            {metrics.codVsOnline.codPercentage}% of all orders
                        </div>
                    </div>

                    {/* Online */}
                    <div className="bg-green-900 border border-green-600 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="text-4xl">💳</div>
                            <div>
                                <div className="text-green-200 text-sm">Online Payment</div>
                                <div className="text-white text-3xl font-bold">{metrics.codVsOnline.onlineOrders}</div>
                            </div>
                        </div>
                        <div className="text-green-300 text-lg font-bold mb-2">
                            {formatCurrency(metrics.codVsOnline.onlineAmount)}
                        </div>
                        <div className="text-green-200 text-sm">
                            {100 - metrics.codVsOnline.codPercentage}% of all orders
                        </div>
                    </div>
                </div>

                {/* Visual Comparison */}
                <div className="bg-gray-600 rounded-lg p-4">
                    <div className="flex h-12 rounded-lg overflow-hidden">
                        <div
                            className="bg-orange-500 flex items-center justify-center text-white font-bold"
                            style={{ width: `${metrics.codVsOnline.codPercentage}%` }}
                        >
                            {metrics.codVsOnline.codPercentage > 15 && `COD ${metrics.codVsOnline.codPercentage}%`}
                        </div>
                        <div
                            className="bg-green-500 flex items-center justify-center text-white font-bold"
                            style={{ width: `${100 - metrics.codVsOnline.codPercentage}%` }}
                        >
                            {(100 - metrics.codVsOnline.codPercentage) > 15 && `Online ${100 - metrics.codVsOnline.codPercentage}%`}
                        </div>
                    </div>
                </div>
            </div>

            {/* Orders by Pakistani Cities */}
            <div className="bg-gray-700 rounded-lg p-6 shadow-lg border border-gray-600 mb-8">
                <Heading level="h3" className="text-2xl font-semibold mb-6 text-white flex items-center gap-2">
                    <span className="text-3xl">🏙️</span> Orders by City
                </Heading>

                {metrics.ordersByCity.length > 0 ? (
                    <div className="space-y-4">
                        {metrics.ordersByCity.map((city, index) => (
                            <div key={city.city} className="bg-gray-600 rounded-lg p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl ${index === 0 ? 'bg-green-500' :
                                                index === 1 ? 'bg-blue-500' :
                                                    index === 2 ? 'bg-purple-500' : 'bg-gray-500'
                                            }`}>
                                            {index + 1}
                                        </div>
                                        <div>
                                            <div className="text-white text-xl font-bold">{city.city}</div>
                                            <div className="text-gray-300 text-sm">{city.orders} orders</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-green-400 text-xl font-bold">{formatCurrency(city.revenue)}</div>
                                        <Badge>{city.percentage}%</Badge>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-3">
                                    <div
                                        className={`h-3 rounded-full transition-all duration-500 ${index === 0 ? 'bg-green-500' :
                                                index === 1 ? 'bg-blue-500' :
                                                    index === 2 ? 'bg-purple-500' : 'bg-gray-500'
                                            }`}
                                        style={{ width: `${city.percentage}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-400">
                        <div className="text-4xl mb-2">🗺️</div>
                        <div>No city data available</div>
                    </div>
                )}
            </div>

            {/* Seasonal Trends (Ramadan/Eid) */}
            <div className="bg-gray-700 rounded-lg p-6 shadow-lg border border-gray-600">
                <Heading level="h3" className="text-2xl font-semibold mb-6 text-white flex items-center gap-2">
                    <span className="text-3xl">🌙</span> Seasonal Sales Trends (Ramadan/Eid)
                </Heading>

                {metrics.seasonalTrends.length > 0 ? (
                    <div className="space-y-3">
                        {metrics.seasonalTrends.map((trend, index) => (
                            <div
                                key={index}
                                className={`rounded-lg p-4 ${trend.isRamadan || trend.isEid
                                        ? 'bg-gradient-to-r from-green-600 to-emerald-700 border-2 border-green-400'
                                        : 'bg-gray-600'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {(trend.isRamadan || trend.isEid) && <div className="text-2xl">🌙</div>}
                                        <div>
                                            <div className="text-white font-bold">{trend.month}</div>
                                            <div className="text-gray-300 text-sm">{trend.orders} orders</div>
                                            {trend.isRamadan && (
                                                <Badge className="mt-1 bg-green-500">Ramadan</Badge>
                                            )}
                                            {trend.isEid && (
                                                <Badge className="mt-1 bg-yellow-500">Eid</Badge>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-white font-bold text-lg">{formatCurrency(trend.revenue)}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-400">
                        <div className="text-4xl mb-2">📅</div>
                        <div>No seasonal data available</div>
                    </div>
                )}
            </div>

            {/* Info Banner */}
            <div className="mt-8 bg-gray-900 text-white rounded-lg p-6">
                <div className="flex items-start gap-4">
                    <div className="text-3xl">🇵🇰</div>
                    <div>
                        <div className="text-lg font-semibold mb-2">Pakistan-Specific Metrics Dashboard</div>
                        <div className="text-gray-300 text-sm">
                            All data is tailored for the Pakistani market with PKR currency formatting, local time display, COD payment tracking, major city distribution, and seasonal trends for Ramadan/Eid. 🌙
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export const config = defineRouteConfig({
    label: "Pakistan Metrics",
    icon: MapPin,
})

export default PakistanMetrics
