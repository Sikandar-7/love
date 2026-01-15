import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Badge } from "@medusajs/ui"

const CustomerInsightsWidget = () => {
    return (
        <Container className="p-6">
            <Heading level="h2" className="text-xl font-semibold mb-6">
                👥 Customer Insights
            </Heading>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total Customers */}
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200">
                    <div className="text-sm text-indigo-600 font-medium mb-1">Total Customers</div>
                    <div className="text-3xl font-bold text-indigo-900">1,250</div>
                    <div className="text-xs text-indigo-600 mt-2">All time</div>
                </div>

                {/* New This Month */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                    <div className="text-sm text-green-600 font-medium mb-1">New This Month</div>
                    <div className="text-3xl font-bold text-green-900">87</div>
                    <div className="text-xs text-green-600 mt-2">↑ 23% increase</div>
                </div>

                {/* Active Customers */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                    <div className="text-sm text-purple-600 font-medium mb-1">Active Customers</div>
                    <div className="text-3xl font-bold text-purple-900">456</div>
                    <div className="text-xs text-purple-600 mt-2">Last 30 days</div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="mt-6 bg-white border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Recent Customer Activity</h3>
                <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                                AK
                            </div>
                            <div>
                                <div className="font-medium">Ahmed Khan</div>
                                <div className="text-sm text-gray-600">Placed order #1234</div>
                            </div>
                        </div>
                        <Badge color="green">New</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold">
                                FA
                            </div>
                            <div>
                                <div className="font-medium">Fatima Ali</div>
                                <div className="text-sm text-gray-600">Left a review</div>
                            </div>
                        </div>
                        <Badge color="blue">Active</Badge>
                    </div>
                </div>
            </div>
        </Container>
    )
}

export const config = defineWidgetConfig({
    zone: "customer.list.before",
})

export default CustomerInsightsWidget
