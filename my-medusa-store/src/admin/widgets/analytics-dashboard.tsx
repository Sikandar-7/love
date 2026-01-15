import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading } from "@medusajs/ui"

const AnalyticsDashboardWidget = () => {
    return (
        <Container className="divide-y p-0">
            <div className="p-6">
                <Heading level="h2" className="text-xl font-semibold mb-6">
                    📊 Sales Analytics
                </Heading>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    {/* Today's Sales */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                        <div className="text-sm text-blue-600 font-medium mb-1">Today's Sales</div>
                        <div className="text-2xl font-bold text-blue-900">PKR 45,000</div>
                        <div className="text-xs text-blue-600 mt-1">↑ 12% from yesterday</div>
                    </div>

                    {/* This Week */}
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                        <div className="text-sm text-green-600 font-medium mb-1">This Week</div>
                        <div className="text-2xl font-bold text-green-900">PKR 285,000</div>
                        <div className="text-xs text-green-600 mt-1">↑ 8% from last week</div>
                    </div>

                    {/* This Month */}
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                        <div className="text-sm text-purple-600 font-medium mb-1">This Month</div>
                        <div className="text-2xl font-bold text-purple-900">PKR 1,250,000</div>
                        <div className="text-xs text-purple-600 mt-1">↑ 15% from last month</div>
                    </div>

                    {/* Total Orders */}
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                        <div className="text-sm text-orange-600 font-medium mb-1">Total Orders</div>
                        <div className="text-2xl font-bold text-orange-900">342</div>
                        <div className="text-xs text-orange-600 mt-1">This month</div>
                    </div>
                </div>

                {/* Order Status */}
                <div className="bg-white border rounded-lg p-4 mb-6">
                    <h3 className="font-semibold mb-3">Order Status</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-600">5</div>
                            <div className="text-sm text-gray-600">Pending</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">8</div>
                            <div className="text-sm text-gray-600">Processing</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">329</div>
                            <div className="text-sm text-gray-600">Completed</div>
                        </div>
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-white border rounded-lg p-4">
                    <h3 className="font-semibold mb-3">🏆 Top Selling Products</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex-1">
                                <div className="font-medium">Premium Wireless Headphones</div>
                                <div className="text-sm text-gray-600">145 sales</div>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-green-600">PKR 1,884,855</div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex-1">
                                <div className="font-medium">Smart Watch Pro</div>
                                <div className="text-sm text-gray-600">98 sales</div>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-green-600">PKR 2,449,902</div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex-1">
                                <div className="font-medium">Designer Cotton T-Shirt</div>
                                <div className="text-sm text-gray-600">234 sales</div>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-green-600">PKR 467,766</div>
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
