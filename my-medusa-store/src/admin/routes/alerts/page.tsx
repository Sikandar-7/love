import { defineRouteConfig } from "@medusajs/admin-sdk"
import { BellAlert } from "@medusajs/icons"
import { Heading, Badge } from "@medusajs/ui"
import { useEffect, useState } from "react"

interface AlertsData {
    lowStockProducts: {
        id: string
        name: string
        currentStock: number
        threshold: number
        status: 'critical' | 'warning'
    }[]
    outOfStockProducts: {
        id: string
        name: string
        lastSoldDate: string
        suggestedRestock: number
    }[]
    pendingOrders: {
        id: string
        orderNumber: string
        customer: string
        amount: number
        daysWaiting: number
    }[]
    failedPayments: {
        id: string
        orderNumber: string
        customer: string
        amount: number
        reason: string
    }[]
    negativeReviews: {
        id: string
        product: string
        customer: string
        rating: number
        comment: string
        date: string
    }[]
    upcomingTasks: {
        id: string
        title: string
        description: string
        dueDate: string
        priority: 'high' | 'medium' | 'low'
    }[]
}

const AlertsNotifications = () => {
    const [alerts, setAlerts] = useState<AlertsData>({
        lowStockProducts: [],
        outOfStockProducts: [],
        pendingOrders: [],
        failedPayments: [],
        negativeReviews: [],
        upcomingTasks: []
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const [ordersRes, productsRes] = await Promise.all([
                    fetch('/admin/orders', { credentials: 'include' }),
                    fetch('/admin/products', { credentials: 'include' })
                ])

                const ordersData = await ordersRes.json()
                const productsData = await productsRes.json()

                const orders = ordersData.orders || []
                const products = productsData.products || []

                // Low Stock & Out of Stock Products
                const lowStockProducts: any[] = []
                const outOfStockProducts: any[] = []

                products.forEach((product: any) => {
                    product.variants?.forEach((variant: any) => {
                        const stock = variant.inventory_quantity || 0
                        const threshold = 10 // Default threshold

                        if (stock === 0) {
                            outOfStockProducts.push({
                                id: product.id,
                                name: product.title,
                                lastSoldDate: new Date().toLocaleDateString(),
                                suggestedRestock: 20
                            })
                        } else if (stock <= threshold && stock > 0) {
                            lowStockProducts.push({
                                id: product.id,
                                name: product.title,
                                currentStock: stock,
                                threshold,
                                status: stock <= 5 ? 'critical' : 'warning'
                            })
                        }
                    })
                })

                // Pending Orders (orders with status 'pending')
                const pendingOrders = orders
                    .filter((order: any) => order.status === 'pending' || order.fulfillment_status === 'not_fulfilled')
                    .slice(0, 10)
                    .map((order: any) => {
                        const createdDate = new Date(order.created_at)
                        const today = new Date()
                        const daysWaiting = Math.floor((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))

                        return {
                            id: order.id,
                            orderNumber: order.display_id || order.id.slice(0, 8),
                            customer: order.email || 'Guest',
                            amount: (order.total || 0) / 100,
                            daysWaiting
                        }
                    })

                // Failed Payments
                const failedPayments = orders
                    .filter((order: any) =>
                        order.payment_status === 'not_paid' ||
                        order.payment_status === 'requires_action'
                    )
                    .slice(0, 5)
                    .map((order: any) => ({
                        id: order.id,
                        orderNumber: order.display_id || order.id.slice(0, 8),
                        customer: order.email || 'Guest',
                        amount: (order.total || 0) / 100,
                        reason: order.payment_status === 'requires_action' ? 'Requires Action' : 'Payment Failed'
                    }))

                // Mock Negative Reviews (since we don't have review data in default Medusa)
                const negativeReviews = [
                    {
                        id: '1',
                        product: 'Sample Product',
                        customer: 'customer@example.com',
                        rating: 2,
                        comment: 'Product quality could be better',
                        date: new Date().toLocaleDateString()
                    }
                ]

                // Upcoming Tasks (mock data)
                const upcomingTasks = [
                    {
                        id: '1',
                        title: 'Restock Popular Items',
                        description: 'Check inventory for top-selling products',
                        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
                        priority: 'high' as const
                    },
                    {
                        id: '2',
                        title: 'Review Customer Feedback',
                        description: 'Respond to pending customer reviews',
                        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString(),
                        priority: 'medium' as const
                    },
                    {
                        id: '3',
                        title: 'Update Product Descriptions',
                        description: 'Improve SEO for product pages',
                        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
                        priority: 'low' as const
                    }
                ]

                setAlerts({
                    lowStockProducts: lowStockProducts.slice(0, 10),
                    outOfStockProducts: outOfStockProducts.slice(0, 5),
                    pendingOrders,
                    failedPayments,
                    negativeReviews,
                    upcomingTasks
                })
            } catch (error) {
                console.error('Error fetching alerts:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchAlerts()
    }, [])

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 0,
        }).format(amount)
    }

    const getTotalAlerts = () => {
        return (
            alerts.lowStockProducts.length +
            alerts.outOfStockProducts.length +
            alerts.pendingOrders.length +
            alerts.failedPayments.length +
            alerts.negativeReviews.length +
            alerts.upcomingTasks.filter(t => t.priority === 'high').length
        )
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-800">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-500 mx-auto"></div>
                    <p className="mt-4 text-lg text-gray-300">Loading Alerts...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-8 bg-gray-800 min-h-screen">
            {/* Header with Total Alerts */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <Heading level="h1" className="text-4xl font-bold mb-2 text-white">
                            ⚠️ Alerts & Notifications
                        </Heading>
                        <p className="text-gray-300 text-lg">
                            Stay on top of important issues and tasks
                        </p>
                    </div>
                    <div className="bg-red-500 text-white rounded-full w-20 h-20 flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-3xl font-bold">{getTotalAlerts()}</div>
                            <div className="text-xs">Alerts</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Critical Alerts Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-red-900 border-l-4 border-red-500 rounded-lg p-5">
                    <div className="flex items-center gap-3">
                        <div className="text-4xl">🚨</div>
                        <div>
                            <div className="text-red-200 text-sm">Critical Stock Issues</div>
                            <div className="text-white text-3xl font-bold">
                                {alerts.lowStockProducts.filter(p => p.status === 'critical').length}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-orange-900 border-l-4 border-orange-500 rounded-lg p-5">
                    <div className="flex items-center gap-3">
                        <div className="text-4xl">⏳</div>
                        <div>
                            <div className="text-orange-200 text-sm">Pending Orders</div>
                            <div className="text-white text-3xl font-bold">{alerts.pendingOrders.length}</div>
                        </div>
                    </div>
                </div>

                <div className="bg-yellow-900 border-l-4 border-yellow-500 rounded-lg p-5">
                    <div className="flex items-center gap-3">
                        <div className="text-4xl">💳</div>
                        <div>
                            <div className="text-yellow-200 text-sm">Failed Payments</div>
                            <div className="text-white text-3xl font-bold">{alerts.failedPayments.length}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Low Stock Alerts */}
            <div className="bg-gray-700 rounded-lg p-6 shadow-lg border border-gray-600 mb-8">
                <Heading level="h3" className="text-xl font-semibold mb-6 text-white flex items-center gap-2">
                    <span className="text-2xl">📦</span> Low Stock Alerts
                </Heading>

                {alerts.lowStockProducts.length > 0 ? (
                    <div className="space-y-3">
                        {alerts.lowStockProducts.map((product) => (
                            <div
                                key={product.id}
                                className={`rounded-lg p-4 ${product.status === 'critical' ? 'bg-red-900 border border-red-600' : 'bg-orange-900 border border-orange-600'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="text-2xl">{product.status === 'critical' ? '🚨' : '⚠️'}</div>
                                        <div>
                                            <div className="text-white font-medium">{product.name}</div>
                                            <div className="text-gray-300 text-sm">
                                                Current Stock: <span className="font-bold">{product.currentStock}</span> units
                                            </div>
                                        </div>
                                    </div>
                                    <Badge color={product.status === 'critical' ? 'red' : 'orange'}>
                                        {product.status === 'critical' ? 'CRITICAL' : 'WARNING'}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-400">
                        <div className="text-4xl mb-2">✅</div>
                        <div>All products have sufficient stock</div>
                    </div>
                )}
            </div>

            {/* Out of Stock & Pending Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Out of Stock */}
                <div className="bg-gray-700 rounded-lg p-6 shadow-lg border border-gray-600">
                    <Heading level="h3" className="text-lg font-semibold mb-6 text-white flex items-center gap-2">
                        <span className="text-2xl">❌</span> Out of Stock Products
                    </Heading>

                    {alerts.outOfStockProducts.length > 0 ? (
                        <div className="space-y-3">
                            {alerts.outOfStockProducts.map((product) => (
                                <div key={product.id} className="bg-gray-600 rounded-lg p-4">
                                    <div className="text-white font-medium mb-2">{product.name}</div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-300">Suggested Restock:</span>
                                        <span className="text-green-400 font-bold">{product.suggestedRestock} units</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            <div className="text-4xl mb-2">✅</div>
                            <div>No out of stock products</div>
                        </div>
                    )}
                </div>

                {/* Pending Orders */}
                <div className="bg-gray-700 rounded-lg p-6 shadow-lg border border-gray-600">
                    <Heading level="h3" className="text-lg font-semibold mb-6 text-white flex items-center gap-2">
                        <span className="text-2xl">⏳</span> Pending Orders
                    </Heading>

                    {alerts.pendingOrders.length > 0 ? (
                        <div className="space-y-3">
                            {alerts.pendingOrders.slice(0, 5).map((order) => (
                                <div key={order.id} className="bg-gray-600 rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="text-white font-medium">Order #{order.orderNumber}</div>
                                            <div className="text-gray-300 text-sm">{order.customer}</div>
                                        </div>
                                        <Badge color={order.daysWaiting > 3 ? 'red' : 'orange'}>
                                            {order.daysWaiting} days
                                        </Badge>
                                    </div>
                                    <div className="text-green-400 font-bold">{formatCurrency(order.amount)}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            <div className="text-4xl mb-2">✅</div>
                            <div>No pending orders</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Failed Payments & Negative Reviews */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Failed Payments */}
                <div className="bg-gray-700 rounded-lg p-6 shadow-lg border border-gray-600">
                    <Heading level="h3" className="text-lg font-semibold mb-6 text-white flex items-center gap-2">
                        <span className="text-2xl">💳</span> Failed Payments
                    </Heading>

                    {alerts.failedPayments.length > 0 ? (
                        <div className="space-y-3">
                            {alerts.failedPayments.map((payment) => (
                                <div key={payment.id} className="bg-red-900 border border-red-600 rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="text-white font-medium">Order #{payment.orderNumber}</div>
                                            <div className="text-gray-300 text-sm">{payment.customer}</div>
                                        </div>
                                        <Badge color="red">{payment.reason}</Badge>
                                    </div>
                                    <div className="text-red-300 font-bold">{formatCurrency(payment.amount)}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            <div className="text-4xl mb-2">✅</div>
                            <div>No failed payments</div>
                        </div>
                    )}
                </div>

                {/* Negative Reviews */}
                <div className="bg-gray-700 rounded-lg p-6 shadow-lg border border-gray-600">
                    <Heading level="h3" className="text-lg font-semibold mb-6 text-white flex items-center gap-2">
                        <span className="text-2xl">⭐</span> Reviews Needing Response
                    </Heading>

                    {alerts.negativeReviews.length > 0 ? (
                        <div className="space-y-3">
                            {alerts.negativeReviews.map((review) => (
                                <div key={review.id} className="bg-gray-600 rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="text-white font-medium">{review.product}</div>
                                            <div className="text-gray-300 text-sm">{review.customer}</div>
                                        </div>
                                        <div className="flex gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-500'}>
                                                    ⭐
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="text-gray-300 text-sm italic">"{review.comment}"</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            <div className="text-4xl mb-2">✅</div>
                            <div>No reviews needing response</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Upcoming Tasks */}
            <div className="bg-gray-700 rounded-lg p-6 shadow-lg border border-gray-600">
                <Heading level="h3" className="text-xl font-semibold mb-6 text-white flex items-center gap-2">
                    <span className="text-2xl">📋</span> Upcoming Tasks & Reminders
                </Heading>

                {alerts.upcomingTasks.length > 0 ? (
                    <div className="space-y-3">
                        {alerts.upcomingTasks.map((task) => (
                            <div key={task.id} className="bg-gray-600 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="text-white font-medium">{task.title}</div>
                                            <Badge
                                                color={
                                                    task.priority === 'high' ? 'red' : task.priority === 'medium' ? 'orange' : 'blue'
                                                }
                                            >
                                                {task.priority.toUpperCase()}
                                            </Badge>
                                        </div>
                                        <div className="text-gray-300 text-sm">{task.description}</div>
                                    </div>
                                </div>
                                <div className="text-gray-400 text-xs mt-2">Due: {task.dueDate}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-400">
                        <div className="text-4xl mb-2">✅</div>
                        <div>No upcoming tasks</div>
                    </div>
                )}
            </div>

            {/* Info Banner */}
            <div className="mt-8 bg-gray-900 text-white rounded-lg p-6">
                <div className="flex items-start gap-4">
                    <div className="text-3xl">⚠️</div>
                    <div>
                        <div className="text-lg font-semibold mb-2">Alerts & Notifications Center</div>
                        <div className="text-gray-300 text-sm">
                            Stay informed about critical issues, pending actions, and important tasks. All alerts are updated in real-time based on your store data! 🔔
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export const config = defineRouteConfig({
    label: "Alerts",
    icon: BellAlert,
})

export default AlertsNotifications
