import { defineRouteConfig } from "@medusajs/admin-sdk"
import { CurrencyDollar } from "@medusajs/icons"
import { Heading, Badge } from "@medusajs/ui"
import { useEffect, useState } from "react"

interface FinancialData {
    totalRevenue: number
    discountsGiven: number
    shippingCosts: number
    taxesCollected: number
    netProfit: number
    outstandingPayments: number
    paymentMethods: {
        method: string
        count: number
        amount: number
        percentage: number
    }[]
    revenueBreakdown: {
        productSales: number
        shippingRevenue: number
        taxRevenue: number
    }
}

type DateFilter = 'today' | 'yesterday' | 'last7days' | 'last30days' | 'thismonth' | 'lastmonth' | 'thisyear' | 'custom'

const FinancialBreakdown = () => {
    const [financial, setFinancial] = useState<FinancialData>({
        totalRevenue: 0,
        discountsGiven: 0,
        shippingCosts: 0,
        taxesCollected: 0,
        netProfit: 0,
        outstandingPayments: 0,
        paymentMethods: [],
        revenueBreakdown: {
            productSales: 0,
            shippingRevenue: 0,
            taxRevenue: 0
        }
    })
    const [loading, setLoading] = useState(true)
    const [dateFilter, setDateFilter] = useState<DateFilter>('last30days')
    const [customStartDate, setCustomStartDate] = useState('')
    const [customEndDate, setCustomEndDate] = useState('')

    const getDateRange = () => {
        const now = new Date()
        let startDate = new Date()
        let endDate = new Date()

        switch (dateFilter) {
            case 'today':
                startDate.setHours(0, 0, 0, 0)
                endDate.setHours(23, 59, 59, 999)
                break
            case 'yesterday':
                startDate.setDate(now.getDate() - 1)
                startDate.setHours(0, 0, 0, 0)
                endDate.setDate(now.getDate() - 1)
                endDate.setHours(23, 59, 59, 999)
                break
            case 'last7days':
                startDate.setDate(now.getDate() - 7)
                startDate.setHours(0, 0, 0, 0)
                break
            case 'last30days':
                startDate.setDate(now.getDate() - 30)
                startDate.setHours(0, 0, 0, 0)
                break
            case 'thismonth':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1)
                break
            case 'lastmonth':
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
                endDate = new Date(now.getFullYear(), now.getMonth(), 0)
                endDate.setHours(23, 59, 59, 999)
                break
            case 'thisyear':
                startDate = new Date(now.getFullYear(), 0, 1)
                break
            case 'custom':
                if (customStartDate && customEndDate) {
                    startDate = new Date(customStartDate)
                    endDate = new Date(customEndDate)
                    endDate.setHours(23, 59, 59, 999)
                }
                break
        }

        return { startDate, endDate }
    }

    useEffect(() => {
        const fetchFinancialData = async () => {
            setLoading(true)
            try {
                const ordersRes = await fetch('/admin/orders', { credentials: 'include' })
                const ordersData = await ordersRes.json()
                const orders = ordersData.orders || []

                const { startDate, endDate } = getDateRange()

                // Filter orders by date range
                const filteredOrders = orders.filter((order: any) => {
                    const orderDate = new Date(order.created_at)
                    return orderDate >= startDate && orderDate <= endDate
                })

                // Calculate Total Revenue
                const totalRevenue = filteredOrders.reduce((sum: number, order: any) => {
                    return sum + ((order.total || 0) / 100)
                }, 0)

                // Calculate Discounts
                const discountsGiven = filteredOrders.reduce((sum: number, order: any) => {
                    return sum + ((order.discount_total || 0) / 100)
                }, 0)

                // Calculate Shipping Costs
                const shippingCosts = filteredOrders.reduce((sum: number, order: any) => {
                    return sum + ((order.shipping_total || 0) / 100)
                }, 0)

                // Calculate Taxes
                const taxesCollected = filteredOrders.reduce((sum: number, order: any) => {
                    return sum + ((order.tax_total || 0) / 100)
                }, 0)

                // Calculate Net Profit (simplified: Revenue - Discounts - estimated costs)
                // Assuming 30% cost of goods sold
                const productSales = filteredOrders.reduce((sum: number, order: any) => {
                    return sum + ((order.subtotal || 0) / 100)
                }, 0)
                const estimatedCOGS = productSales * 0.3
                const netProfit = totalRevenue - discountsGiven - estimatedCOGS

                // Calculate Outstanding Payments (COD orders)
                const outstandingPayments = filteredOrders
                    .filter((order: any) => order.payment_status === 'awaiting' || order.payment_status === 'not_paid')
                    .reduce((sum: number, order: any) => sum + ((order.total || 0) / 100), 0)

                // Payment Methods Breakdown
                const paymentMethodsMap: { [key: string]: { count: number; amount: number } } = {}

                filteredOrders.forEach((order: any) => {
                    let method = 'Unknown'

                    if (order.payment_status === 'awaiting' || order.payment_status === 'not_paid') {
                        method = 'Cash on Delivery (COD)'
                    } else if (order.payment_status === 'captured' || order.payment_status === 'authorized') {
                        method = 'Credit/Debit Card'
                    } else if (order.payment_status === 'requires_action') {
                        method = 'Pending Payment'
                    }

                    if (!paymentMethodsMap[method]) {
                        paymentMethodsMap[method] = { count: 0, amount: 0 }
                    }
                    paymentMethodsMap[method].count += 1
                    paymentMethodsMap[method].amount += (order.total || 0) / 100
                })

                const totalOrdersAmount = Object.values(paymentMethodsMap).reduce((sum, m) => sum + m.amount, 0)
                const paymentMethods = Object.entries(paymentMethodsMap).map(([method, data]) => ({
                    method,
                    count: data.count,
                    amount: data.amount,
                    percentage: totalOrdersAmount > 0 ? Math.round((data.amount / totalOrdersAmount) * 100) : 0
                }))

                // Revenue Breakdown
                const revenueBreakdown = {
                    productSales,
                    shippingRevenue: shippingCosts,
                    taxRevenue: taxesCollected
                }

                setFinancial({
                    totalRevenue,
                    discountsGiven,
                    shippingCosts,
                    taxesCollected,
                    netProfit,
                    outstandingPayments,
                    paymentMethods,
                    revenueBreakdown
                })
            } catch (error) {
                console.error('Error fetching financial data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchFinancialData()
    }, [dateFilter, customStartDate, customEndDate])

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
                    <p className="mt-4 text-lg text-gray-300">Loading Financial Data...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-8 bg-gray-800 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <Heading level="h1" className="text-4xl font-bold mb-2 text-white">
                    💰 Financial Breakdown
                </Heading>
                <p className="text-gray-300 text-lg">
                    Comprehensive financial insights and revenue analysis
                </p>
            </div>

            {/* Date Range Filters */}
            <div className="bg-gray-700 rounded-lg p-6 shadow-lg border border-gray-600 mb-8">
                <Heading level="h3" className="text-lg font-semibold mb-4 text-white">
                    📅 Date Range Filter
                </Heading>

                <div className="flex flex-wrap gap-3 mb-4">
                    {[
                        { value: 'today', label: 'Today' },
                        { value: 'yesterday', label: 'Yesterday' },
                        { value: 'last7days', label: 'Last 7 Days' },
                        { value: 'last30days', label: 'Last 30 Days' },
                        { value: 'thismonth', label: 'This Month' },
                        { value: 'lastmonth', label: 'Last Month' },
                        { value: 'thisyear', label: 'This Year' },
                        { value: 'custom', label: 'Custom Range' }
                    ].map((filter) => (
                        <button
                            key={filter.value}
                            onClick={() => setDateFilter(filter.value as DateFilter)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${dateFilter === filter.value
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>

                {dateFilter === 'custom' && (
                    <div className="flex gap-4 items-center">
                        <div>
                            <label className="text-gray-300 text-sm mb-1 block">Start Date</label>
                            <input
                                type="date"
                                value={customStartDate}
                                onChange={(e) => setCustomStartDate(e.target.value)}
                                className="bg-gray-600 text-white px-4 py-2 rounded-lg border border-gray-500"
                            />
                        </div>
                        <div>
                            <label className="text-gray-300 text-sm mb-1 block">End Date</label>
                            <input
                                type="date"
                                value={customEndDate}
                                onChange={(e) => setCustomEndDate(e.target.value)}
                                className="bg-gray-600 text-white px-4 py-2 rounded-lg border border-gray-500"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Key Financial Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl p-6 shadow-lg">
                    <div className="text-sm opacity-90 mb-1">Total Revenue</div>
                    <div className="text-4xl font-bold">{formatCurrency(financial.totalRevenue)}</div>
                    <div className="text-sm opacity-80 mt-2">Gross sales</div>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-xl p-6 shadow-lg">
                    <div className="text-sm opacity-90 mb-1">Net Profit</div>
                    <div className="text-4xl font-bold">{formatCurrency(financial.netProfit)}</div>
                    <div className="text-sm opacity-80 mt-2">After costs</div>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-xl p-6 shadow-lg">
                    <div className="text-sm opacity-90 mb-1">Outstanding</div>
                    <div className="text-4xl font-bold">{formatCurrency(financial.outstandingPayments)}</div>
                    <div className="text-sm opacity-80 mt-2">Pending COD</div>
                </div>
            </div>

            {/* Revenue Breakdown */}
            <div className="bg-gray-700 rounded-lg p-6 shadow-lg border border-gray-600 mb-8">
                <Heading level="h3" className="text-xl font-semibold mb-6 text-white">
                    📊 Revenue Breakdown
                </Heading>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-600 rounded-lg p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="text-3xl">🛍️</div>
                            <div>
                                <div className="text-gray-300 text-sm">Product Sales</div>
                                <div className="text-white text-2xl font-bold">
                                    {formatCurrency(financial.revenueBreakdown.productSales)}
                                </div>
                            </div>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{
                                    width: `${financial.totalRevenue > 0 ? (financial.revenueBreakdown.productSales / financial.totalRevenue) * 100 : 0}%`
                                }}
                            />
                        </div>
                    </div>

                    <div className="bg-gray-600 rounded-lg p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="text-3xl">🚚</div>
                            <div>
                                <div className="text-gray-300 text-sm">Shipping Revenue</div>
                                <div className="text-white text-2xl font-bold">
                                    {formatCurrency(financial.revenueBreakdown.shippingRevenue)}
                                </div>
                            </div>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{
                                    width: `${financial.totalRevenue > 0 ? (financial.revenueBreakdown.shippingRevenue / financial.totalRevenue) * 100 : 0}%`
                                }}
                            />
                        </div>
                    </div>

                    <div className="bg-gray-600 rounded-lg p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="text-3xl">📋</div>
                            <div>
                                <div className="text-gray-300 text-sm">Tax Revenue</div>
                                <div className="text-white text-2xl font-bold">
                                    {formatCurrency(financial.revenueBreakdown.taxRevenue)}
                                </div>
                            </div>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-purple-500 h-2 rounded-full"
                                style={{
                                    width: `${financial.totalRevenue > 0 ? (financial.revenueBreakdown.taxRevenue / financial.totalRevenue) * 100 : 0}%`
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Methods & Costs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Payment Methods */}
                <div className="bg-gray-700 rounded-lg p-6 shadow-lg border border-gray-600">
                    <Heading level="h3" className="text-xl font-semibold mb-6 text-white">
                        💳 Payment Methods Used
                    </Heading>

                    {financial.paymentMethods.length > 0 ? (
                        <div className="space-y-4">
                            {financial.paymentMethods.map((method, index) => (
                                <div key={index} className="bg-gray-600 rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="text-white font-medium">{method.method}</div>
                                            <div className="text-gray-300 text-sm">{method.count} transactions</div>
                                        </div>
                                        <Badge>{method.percentage}%</Badge>
                                    </div>
                                    <div className="text-green-400 font-bold text-lg mb-2">
                                        {formatCurrency(method.amount)}
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-3">
                                        <div
                                            className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full"
                                            style={{ width: `${method.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            <div className="text-4xl mb-2">💳</div>
                            <div>No payment data available</div>
                        </div>
                    )}
                </div>

                {/* Costs & Deductions */}
                <div className="bg-gray-700 rounded-lg p-6 shadow-lg border border-gray-600">
                    <Heading level="h3" className="text-xl font-semibold mb-6 text-white">
                        💸 Costs & Deductions
                    </Heading>

                    <div className="space-y-4">
                        <div className="bg-red-900 border border-red-600 rounded-lg p-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="text-2xl">🎁</div>
                                    <div>
                                        <div className="text-white font-medium">Discounts Given</div>
                                        <div className="text-red-300 text-sm">Customer savings</div>
                                    </div>
                                </div>
                                <div className="text-red-300 font-bold text-xl">
                                    -{formatCurrency(financial.discountsGiven)}
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-600 rounded-lg p-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="text-2xl">🚚</div>
                                    <div>
                                        <div className="text-white font-medium">Shipping Costs</div>
                                        <div className="text-gray-300 text-sm">Delivery charges</div>
                                    </div>
                                </div>
                                <div className="text-white font-bold text-xl">
                                    {formatCurrency(financial.shippingCosts)}
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-600 rounded-lg p-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="text-2xl">📋</div>
                                    <div>
                                        <div className="text-white font-medium">Taxes Collected</div>
                                        <div className="text-gray-300 text-sm">Government taxes</div>
                                    </div>
                                </div>
                                <div className="text-white font-bold text-xl">
                                    {formatCurrency(financial.taxesCollected)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Profit Summary */}
            <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-lg p-8 shadow-lg">
                <div className="text-center">
                    <div className="text-white text-lg mb-2 opacity-90">Estimated Net Profit</div>
                    <div className="text-white text-6xl font-bold mb-4">
                        {formatCurrency(financial.netProfit)}
                    </div>
                    <div className="text-green-100 text-sm">
                        After deducting discounts and estimated cost of goods (30%)
                    </div>
                </div>
            </div>

            {/* Info Banner */}
            <div className="mt-8 bg-gray-900 text-white rounded-lg p-6">
                <div className="flex items-start gap-4">
                    <div className="text-3xl">💰</div>
                    <div>
                        <div className="text-lg font-semibold mb-2">Financial Breakdown Dashboard</div>
                        <div className="text-gray-300 text-sm">
                            All financial data is calculated in real-time from your orders. Use date filters to analyze specific periods. Net profit is estimated assuming 30% COGS. 📊
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export const config = defineRouteConfig({
    label: "Financials",
    icon: CurrencyDollar,
})

export default FinancialBreakdown
