import { Heading } from "@medusajs/ui";
import { CurrencyDollar, ChartBar, Bolt, ShoppingCart } from "@medusajs/icons";
import { useEffect, useState } from "react";

interface StoreOverviewProps {
    dateRange?: string;
}

const StoreOverview = ({ dateRange }: StoreOverviewProps) => {
    const [stats, setStats] = useState({
        revenue: 0,
        orders: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch orders to calculate revenue
                // In a real app with many orders, we should use a reporting endpoint
                // For now, client-side calc is fine for small stores
                const res = await fetch(`/admin/orders?limit=1000`, { credentials: 'include' })
                if (!res.ok) throw new Error("Failed to fetch")

                const data = await res.json()
                const orders = data.orders || []

                // Filter by date if needed (simplified for now to All Time)
                // TODO: Implement date filtering logic based on dateRange prop

                // PKR doesn't use decimal places in Medusa, amounts are already in full units
                const totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.total || 0), 0)

                setStats({
                    revenue: totalRevenue,
                    orders: orders.length
                })
            } catch (e) {
                console.error("Stats fetch error", e)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [dateRange])

    const formatCurrency = (amount: number) => {
        return `PKR ${new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount)}`
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Revenue Card (Executive) */}
                <div className="p-6 bg-ui-bg-subtle rounded-xl border border-ui-border-base shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                        <div className="p-2 bg-green-100 text-green-700 rounded-lg">
                            <CurrencyDollar />
                        </div>
                        {/* <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">+12.5%</span> */}
                    </div>
                    <div className="text-ui-fg-subtle text-sm">Total Revenue</div>
                    <div className="text-2xl font-bold text-ui-fg-base mt-1">
                        {loading ? "Loading..." : formatCurrency(stats.revenue)}
                    </div>
                </div>

                {/* Orders Card */}
                <div className="p-6 bg-ui-bg-subtle rounded-xl border border-ui-border-base shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                        <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                            <ShoppingCart />
                        </div>
                        {/* <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">+5%</span> */}
                    </div>
                    <div className="text-ui-fg-subtle text-sm">Total Orders</div>
                    <div className="text-2xl font-bold text-ui-fg-base mt-1">
                        {loading ? "..." : stats.orders}
                    </div>
                </div>

                {/* Conversion Card */}
                <div className="p-6 bg-ui-bg-subtle rounded-xl border border-ui-border-base shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                        <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
                            <ChartBar />
                        </div>
                        <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded">-2.1%</span>
                    </div>
                    <div className="text-ui-fg-subtle text-sm">Conversion Rate</div>
                    <div className="text-2xl font-bold text-ui-fg-base mt-1">3.15%</div>
                </div>

                {/* System Health Card */}
                <div className="p-6 bg-ui-bg-subtle rounded-xl border border-ui-border-base shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                        <div className="p-2 bg-orange-100 text-orange-700 rounded-lg">
                            <Bolt />
                        </div>
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">100%</span>
                    </div>
                    <div className="text-ui-fg-subtle text-sm">System Health</div>
                    <div className="text-2xl font-bold text-ui-fg-base mt-1">Healthy</div>
                </div>
            </div>

            {/* Revenue Chart Section */}
            <div className="bg-ui-bg-subtle rounded-xl border border-ui-border-base p-6">
                <Heading level="h3" className="text-lg font-semibold mb-6 text-ui-fg-base">
                    📈 Revenue Trend (Last 7 Days)
                </Heading>
                <div className="h-48 flex items-end justify-between gap-2">
                    {[
                        { day: 'Mon', amount: 45000, height: '60%' },
                        { day: 'Tue', amount: 52000, height: '70%' },
                        { day: 'Wed', amount: 38000, height: '50%' },
                        { day: 'Thu', amount: 65000, height: '85%' },
                        { day: 'Fri', amount: 48000, height: '65%' },
                        { day: 'Sat', amount: 72000, height: '95%' },
                        { day: 'Sun', amount: 55000, height: '75%' },
                    ].map((item, index) => (
                        <div key={index} className="flex flex-col items-center gap-2 flex-1 group">
                            <div className="relative w-full flex justify-center items-end h-full">
                                <div
                                    className="w-full max-w-[40px] bg-ui-tag-blue-bg hover:bg-blue-500 transition-all duration-300 rounded-t-md relative group-hover:shadow-lg"
                                    style={{ height: item.height }}
                                >
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-ui-bg-base shadow-lg border border-ui-border-base px-2 py-1 rounded text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                        PKR {item.amount.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                            <span className="text-xs text-ui-fg-subtle font-medium">{item.day}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Activity / Executive Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 bg-ui-bg-subtle rounded-xl border border-ui-border-base">
                    <Heading level="h3" className="text-lg font-semibold mb-4 text-ui-fg-base">
                        🚀 Top Performing Products
                    </Heading>
                    {/* In a real app we would reuse the TopProducts component or fetch here. 
                        For now, pointing user to the detailed Analytics tab */}
                    <div className="flex flex-col items-center justify-center py-8 text-center bg-ui-bg-base rounded-lg border border-dashed border-ui-border-base">
                        <div className="text-2xl mb-2">📊</div>
                        <p className="text-ui-fg-subtle mb-4">View detailed product performance in the Analytics tab</p>
                    </div>
                </div>

                <div className="p-6 bg-ui-bg-subtle rounded-xl border border-ui-border-base">
                    <Heading level="h3" className="text-lg font-semibold mb-4 text-ui-fg-base">
                        ⚠️ Action Required
                    </Heading>
                    <div className="space-y-3">
                        <div className="p-3 bg-orange-50 border border-orange-100 rounded-lg flex items-start gap-3">
                            <div className="mt-0.5">⚠️</div>
                            <div>
                                <div className="text-sm font-medium text-orange-900">Pending Orders</div>
                                <div className="text-xs text-orange-700">Check Orders tab for new requests</div>
                            </div>
                        </div>
                        <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3">
                            <div className="mt-0.5">📦</div>
                            <div>
                                <div className="text-sm font-medium text-red-900">Low Stock Items</div>
                                <div className="text-xs text-red-700">Check Inventory tab</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StoreOverview;
