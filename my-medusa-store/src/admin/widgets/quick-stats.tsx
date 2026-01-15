import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading } from "@medusajs/ui"

const QuickStatsWidget = () => {
    return (
        <Container className="p-6">
            <Heading level="h2" className="text-xl font-semibold mb-6">
                ⚡ Quick Stats
            </Heading>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-3xl mb-2">📦</div>
                    <div className="text-2xl font-bold text-blue-900">1,234</div>
                    <div className="text-sm text-blue-600">Total Products</div>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-3xl mb-2">✅</div>
                    <div className="text-2xl font-bold text-green-900">342</div>
                    <div className="text-sm text-green-600">Orders (Month)</div>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="text-3xl mb-2">⭐</div>
                    <div className="text-2xl font-bold text-purple-900">4.9</div>
                    <div className="text-sm text-purple-600">Avg Rating</div>
                </div>

                <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="text-3xl mb-2">💰</div>
                    <div className="text-2xl font-bold text-orange-900">PKR 1.2M</div>
                    <div className="text-sm text-orange-600">Revenue (Month)</div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6">
                <h3 className="font-semibold mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                    <button className="p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                        + Add Product
                    </button>
                    <button className="p-3 bg-white border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-medium">
                        View Reports
                    </button>
                </div>
            </div>
        </Container>
    )
}

export const config = defineWidgetConfig({
    zone: "product.list.before",
})

export default QuickStatsWidget
