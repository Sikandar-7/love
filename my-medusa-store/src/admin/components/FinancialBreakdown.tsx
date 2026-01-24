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

const FinancialBreakdown = ({ dateRange = 'last30days' }: { dateRange?: string }) => {
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

    // Using the global dateRange prop instead of local state
    // const [dateFilter, setDateFilter] = useState<DateFilter>('last30days')
    // const [customStartDate, setCustomStartDate] = useState('')
    // const [customEndDate, setCustomEndDate] = useState('')

    const getDateRange = () => {
        const now = new Date()
        let startDate = new Date()
        let endDate = new Date()

        switch (dateRange) {
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
            default:
                // Default to last 30 days if custom or unknown
                startDate.setDate(now.getDate() - 30)
                startDate.setHours(0, 0, 0, 0)
                break
        }

        return { startDate, endDate }
    }

    useEffect(() => {
        const fetchFinancialData = async () => {
            setLoading(true)
            try {
                const ordersRes = await fetch('/admin/orders?limit=1000&expand=items,items.variant', { credentials: 'include' })
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
                    return sum + (order.total || 0)
                }, 0)

                // Calculate Discounts
                const discountsGiven = filteredOrders.reduce((sum: number, order: any) => {
                    return sum + (order.discount_total || 0)
                }, 0)

                // Calculate Shipping Costs
                const shippingCosts = filteredOrders.reduce((sum: number, order: any) => {
                    return sum + (order.shipping_total || 0)
                }, 0)

                // Calculate Taxes
                const taxesCollected = filteredOrders.reduce((sum: number, order: any) => {
                    return sum + (order.tax_total || 0)
                }, 0)

                // Calculate Net Profit
                // For each order item, find the cost price from variant metadata.
                const totalCostOfGoods = filteredOrders.reduce((sum: number, order: any) => {
                    const orderCost = order.items?.reduce((itemSum: number, item: any) => {
                        // Attempt to find cost_price in variant metadata
                        const costPrice = item.variant?.metadata?.cost_price || 0
                        const quantity = item.quantity || 0
                        return itemSum + (costPrice * quantity)
                    }, 0) || 0
                    return sum + orderCost
                }, 0)

                const netProfit = totalRevenue - discountsGiven - shippingCosts - taxesCollected - totalCostOfGoods

                // Product Sales (Subtotal)
                const productSales = filteredOrders.reduce((sum: number, order: any) => {
                    return sum + (order.subtotal || 0)
                }, 0)

                // Calculate Outstanding Payments (COD orders)
                const outstandingPayments = filteredOrders
                    .filter((order: any) => order.payment_status === 'awaiting' || order.payment_status === 'not_paid')
                    .reduce((sum: number, order: any) => sum + (order.total || 0), 0)

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
                    paymentMethodsMap[method].amount += (order.total || 0)
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
    }, [dateRange])

    const formatCurrency = (amount: number) => {
        return `PKR ${new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(amount)}`
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12 bg-ui-bg-subtle rounded-lg">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                    <p className="mt-4 text-ui-fg-subtle">Loading Financial Data...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">

            {/* Key Financial Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-ui-bg-subtle rounded-xl p-6 shadow-sm border border-ui-border-base">
                    <div className="text-ui-fg-subtle text-sm mb-1">Total Revenue</div>
                    <div className="text-3xl font-bold text-ui-fg-base">{formatCurrency(financial.totalRevenue)}</div>
                    <div className="text-ui-fg-muted text-sm mt-2">Gross sales</div>
                </div>

                <div className="bg-ui-bg-subtle rounded-xl p-6 shadow-sm border border-ui-border-base">
                    <div className="text-ui-fg-subtle text-sm mb-1">Net Profit</div>
                    <div className="text-3xl font-bold text-green-600">{formatCurrency(financial.netProfit)}</div>
                    <div className="text-ui-fg-muted text-sm mt-2">After costs</div>
                </div>

                <div className="bg-ui-bg-subtle rounded-xl p-6 shadow-sm border border-ui-border-base">
                    <div className="text-ui-fg-subtle text-sm mb-1">Outstanding</div>
                    <div className="text-3xl font-bold text-orange-600">{formatCurrency(financial.outstandingPayments)}</div>
                    <div className="text-ui-fg-muted text-sm mt-2">Pending COD</div>
                </div>
            </div>

            {/* Revenue Breakdown */}
            <div className="bg-ui-bg-subtle rounded-lg p-6 border border-ui-border-base">
                <Heading level="h3" className="text-xl font-semibold mb-6 text-ui-fg-base">
                    📊 Revenue Breakdown
                </Heading>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-ui-bg-base rounded-lg border border-ui-border-base">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="text-2xl">🛍️</div>
                            <div>
                                <div className="text-ui-fg-subtle text-sm">Product Sales</div>
                                <div className="text-ui-fg-base text-lg font-bold">
                                    {formatCurrency(financial.revenueBreakdown.productSales)}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-ui-bg-base rounded-lg border border-ui-border-base">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="text-2xl">🚚</div>
                            <div>
                                <div className="text-ui-fg-subtle text-sm">Shipping Revenue</div>
                                <div className="text-ui-fg-base text-lg font-bold">
                                    {formatCurrency(financial.revenueBreakdown.shippingRevenue)}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-ui-bg-base rounded-lg border border-ui-border-base">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="text-2xl">📋</div>
                            <div>
                                <div className="text-ui-fg-subtle text-sm">Tax Revenue</div>
                                <div className="text-ui-fg-base text-lg font-bold">
                                    {formatCurrency(financial.revenueBreakdown.taxRevenue)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Methods & Costs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Payment Methods */}
                <div className="bg-ui-bg-subtle rounded-lg p-6 border border-ui-border-base">
                    <Heading level="h3" className="text-xl font-semibold mb-6 text-ui-fg-base">
                        💳 Payment Methods
                    </Heading>

                    {financial.paymentMethods.length > 0 ? (
                        <div className="space-y-4">
                            {financial.paymentMethods.map((method, index) => (
                                <div key={index} className="p-4 bg-ui-bg-base rounded-lg border border-ui-border-base">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="text-ui-fg-base font-medium">{method.method}</div>
                                            <div className="text-ui-fg-subtle text-sm">{method.count} transactions</div>
                                        </div>
                                        <Badge>{method.percentage}%</Badge>
                                    </div>
                                    <div className="text-ui-fg-base font-bold text-lg mb-2">
                                        {formatCurrency(method.amount)}
                                    </div>
                                    <div className="w-full bg-ui-bg-subtle rounded-full h-2">
                                        <div
                                            className="bg-green-500 h-2 rounded-full"
                                            style={{ width: `${method.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-ui-fg-subtle">
                            No payment data available
                        </div>
                    )}
                </div>

                {/* Costs & Deductions */}
                <div className="bg-ui-bg-subtle rounded-lg p-6 border border-ui-border-base">
                    <Heading level="h3" className="text-xl font-semibold mb-6 text-ui-fg-base">
                        💸 Costs
                    </Heading>

                    {financial.paymentMethods.length > 0 ? (
                        <div className="space-y-4">
                            <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="text-2xl">🎁</div>
                                        <div>
                                            <div className="text-red-900 font-medium">Discounts</div>
                                            <div className="text-red-700 text-sm">Customer savings</div>
                                        </div>
                                    </div>
                                    <div className="text-red-700 font-bold text-lg">
                                        -{formatCurrency(financial.discountsGiven)}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-ui-bg-base border border-ui-border-base rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="text-2xl">🚚</div>
                                        <div>
                                            <div className="text-ui-fg-base font-medium">Shipping Costs</div>
                                            <div className="text-ui-fg-subtle text-sm">Delivery charges</div>
                                        </div>
                                    </div>
                                    <div className="text-ui-fg-base font-bold text-lg">
                                        {formatCurrency(financial.shippingCosts)}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-ui-bg-base border border-ui-border-base rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="text-2xl">📋</div>
                                        <div>
                                            <div className="text-ui-fg-base font-medium">Taxes</div>
                                            <div className="text-ui-fg-subtle text-sm">Collected</div>
                                        </div>
                                    </div>
                                    <div className="text-ui-fg-base font-bold text-lg">
                                        {formatCurrency(financial.taxesCollected)}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-ui-bg-base border border-ui-border-base rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="text-2xl">🏭</div>
                                        <div>
                                            <div className="text-ui-fg-base font-medium">Product Costs</div>
                                            <div className="text-ui-fg-subtle text-sm">Cost Price (COGS)</div>
                                        </div>
                                    </div>
                                    <div className="text-ui-fg-base font-bold text-lg">
                                        {formatCurrency(financial.totalRevenue - financial.netProfit - financial.discountsGiven - financial.shippingCosts - financial.taxesCollected)}
                                        {/* Back-calculating COGS from net profit formula to show consistent value */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-ui-fg-subtle">
                            No cost data available
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default FinancialBreakdown
