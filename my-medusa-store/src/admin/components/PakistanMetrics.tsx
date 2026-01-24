import { MapPin } from "@medusajs/icons";
import { Heading, Badge } from "@medusajs/ui";
import { useEffect, useState } from "react";

interface PakistanMetricsData {
    codVsOnline: {
        codOrders: number;
        codAmount: number;
        onlineOrders: number;
        onlineAmount: number;
        codPercentage: number;
    };
    ordersByCity: {
        city: string;
        orders: number;
        revenue: number;
        percentage: number;
    }[];
    seasonalTrends: {
        month: string;
        revenue: number;
        orders: number;
        isRamadan: boolean;
        isEid: boolean;
    }[];
    totalRevenue: number;
    totalOrders: number;
    currentTime: string;
}

const PakistanMetrics = () => {
    const [metrics, setMetrics] = useState<PakistanMetricsData>({
        codVsOnline: {
            codOrders: 0,
            codAmount: 0,
            onlineOrders: 0,
            onlineAmount: 0,
            codPercentage: 0,
        },
        ordersByCity: [],
        seasonalTrends: [],
        totalRevenue: 0,
        totalOrders: 0,
        currentTime: "",
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPakistanMetrics = async () => {
            try {
                const ordersRes = await fetch("/admin/orders?limit=1000", { credentials: "include" });
                const ordersData = await ordersRes.json();
                const orders = ordersData.orders || [];

                // COD vs Online Payment
                let codOrders = 0;
                let codAmount = 0;
                let onlineOrders = 0;
                let onlineAmount = 0;

                orders.forEach((order: any) => {
                    const amount = (order.total || 0) / 100;

                    if (
                        order.payment_status === "awaiting" ||
                        order.payment_status === "not_paid"
                    ) {
                        codOrders++;
                        codAmount += amount;
                    } else if (
                        order.payment_status === "captured" ||
                        order.payment_status === "authorized"
                    ) {
                        onlineOrders++;
                        onlineAmount += amount;
                    }
                });

                const totalOrders = codOrders + onlineOrders;
                const codPercentage =
                    totalOrders > 0 ? Math.round((codOrders / totalOrders) * 100) : 0;

                // Orders by Pakistani Cities
                const cityMap: { [key: string]: { orders: number; revenue: number } } = {};

                orders.forEach((order: any) => {
                    let city = order.shipping_address?.city || "Unknown";

                    // Normalize city names
                    city = city.trim();
                    if (city.toLowerCase().includes("karachi")) city = "Karachi";
                    else if (city.toLowerCase().includes("lahore")) city = "Lahore";
                    else if (city.toLowerCase().includes("islamabad")) city = "Islamabad";
                    else if (city.toLowerCase().includes("rawalpindi")) city = "Rawalpindi";
                    else if (city.toLowerCase().includes("faisalabad")) city = "Faisalabad";
                    else if (city.toLowerCase().includes("multan")) city = "Multan";
                    else if (city.toLowerCase().includes("peshawar")) city = "Peshawar";
                    else if (city.toLowerCase().includes("quetta")) city = "Quetta";
                    else if (city.toLowerCase().includes("sialkot")) city = "Sialkot";
                    else if (city.toLowerCase().includes("gujranwala")) city = "Gujranwala";

                    if (!cityMap[city]) {
                        cityMap[city] = { orders: 0, revenue: 0 };
                    }
                    cityMap[city].orders += 1;
                    cityMap[city].revenue += (order.total || 0) / 100;
                });

                const totalOrdersCount = orders.length;
                const ordersByCity = Object.entries(cityMap)
                    .map(([city, data]) => ({
                        city,
                        orders: data.orders,
                        revenue: data.revenue,
                        percentage:
                            totalOrdersCount > 0
                                ? Math.round((data.orders / totalOrdersCount) * 100)
                                : 0,
                    }))
                    .sort((a, b) => b.orders - a.orders)
                    .slice(0, 10);

                // Seasonal Trends (Monthly breakdown with Ramadan/Eid detection)
                const monthlyData: {
                    [key: string]: { revenue: number; orders: number };
                } = {};

                orders.forEach((order: any) => {
                    const date = new Date(order.created_at);
                    const monthKey = `${date.getFullYear()}-${String(
                        date.getMonth() + 1
                    ).padStart(2, "0")}`;

                    if (!monthlyData[monthKey]) {
                        monthlyData[monthKey] = { revenue: 0, orders: 0 };
                    }
                    monthlyData[monthKey].revenue += (order.total || 0) / 100;
                    monthlyData[monthKey].orders += 1;
                });

                // Ramadan months (approximate - varies by year)
                const ramadanMonths = [
                    "2024-03",
                    "2024-04",
                    "2025-03",
                    "2026-02",
                    "2026-03",
                ];
                const eidMonths = [
                    "2024-04",
                    "2024-06",
                    "2025-03",
                    "2025-06",
                    "2026-03",
                    "2026-06",
                ];

                const seasonalTrends = Object.entries(monthlyData)
                    .map(([month, data]) => {
                        const date = new Date(month + "-01");
                        return {
                            month: date.toLocaleDateString("en-US", {
                                month: "short",
                                year: "numeric",
                            }),
                            revenue: data.revenue,
                            orders: data.orders,
                            isRamadan: ramadanMonths.includes(month),
                            isEid: eidMonths.includes(month),
                        };
                    })
                    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
                    .slice(-12);

                // Total Revenue
                const totalRevenue = orders.reduce(
                    (sum: number, order: any) => sum + (order.total || 0) / 100,
                    0
                );

                // Pakistan Local Time
                const currentTime = new Date().toLocaleString("en-PK", {
                    timeZone: "Asia/Karachi",
                    dateStyle: "full",
                    timeStyle: "long",
                });

                setMetrics({
                    codVsOnline: {
                        codOrders,
                        codAmount,
                        onlineOrders,
                        onlineAmount,
                        codPercentage,
                    },
                    ordersByCity,
                    seasonalTrends,
                    totalRevenue,
                    totalOrders: orders.length,
                    currentTime,
                });
            } catch (error) {
                console.error("Error fetching Pakistan metrics:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPakistanMetrics();

        // Update time every second
        const timeInterval = setInterval(() => {
            const currentTime = new Date().toLocaleString("en-PK", {
                timeZone: "Asia/Karachi",
                dateStyle: "full",
                timeStyle: "long",
            });
            setMetrics((prev) => ({ ...prev, currentTime }));
        }, 1000);

        return () => clearInterval(timeInterval);
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-PK", {
            style: "currency",
            currency: "PKR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12 bg-ui-bg-subtle rounded-lg">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                    <p className="mt-4 text-ui-fg-subtle">Loading Pakistan Metrics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Local Time Display */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-lg p-6 shadow-sm mb-6">
                <div className="text-center">
                    <div className="text-white text-sm opacity-90 mb-2">
                        🕐 Pakistan Standard Time (PST)
                    </div>
                    <div className="text-white text-3xl font-bold">
                        {metrics.currentTime}
                    </div>
                </div>
            </div>

            {/* COD vs Online Payment */}
            <div className="bg-ui-bg-subtle rounded-lg p-6 shadow-sm border border-ui-border-base">
                <Heading
                    level="h3"
                    className="text-xl font-semibold mb-6 text-ui-fg-base flex items-center gap-2"
                >
                    <span className="text-2xl">💳</span> COD vs Online Payment Ratio
                </Heading>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* COD */}
                    <div className="bg-orange-50 border border-orange-100 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="text-3xl">💵</div>
                            <div>
                                <div className="text-orange-900 text-sm font-medium">Cash on Delivery</div>
                                <div className="text-orange-900 text-xl font-bold">
                                    {metrics.codVsOnline.codOrders} orders
                                </div>
                            </div>
                        </div>
                        <div className="text-orange-700 text-lg font-bold mb-2">
                            {formatCurrency(metrics.codVsOnline.codAmount)}
                        </div>
                        <div className="text-orange-700 text-sm opacity-80">
                            {metrics.codVsOnline.codPercentage}% of all orders
                        </div>
                    </div>

                    {/* Online */}
                    <div className="bg-green-50 border border-green-100 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="text-3xl">💳</div>
                            <div>
                                <div className="text-green-900 text-sm font-medium">Online Payment</div>
                                <div className="text-green-900 text-xl font-bold">
                                    {metrics.codVsOnline.onlineOrders} orders
                                </div>
                            </div>
                        </div>
                        <div className="text-green-700 text-lg font-bold mb-2">
                            {formatCurrency(metrics.codVsOnline.onlineAmount)}
                        </div>
                        <div className="text-green-700 text-sm opacity-80">
                            {100 - metrics.codVsOnline.codPercentage}% of all orders
                        </div>
                    </div>
                </div>

                {/* Visual Comparison */}
                <div className="bg-ui-bg-base rounded-full h-3 overflow-hidden border border-ui-border-base">
                    <div className="flex h-full">
                        <div
                            className="bg-orange-500 h-full transition-all duration-500"
                            style={{ width: `${metrics.codVsOnline.codPercentage}%` }}
                        />
                        <div
                            className="bg-green-500 h-full transition-all duration-500"
                            style={{ width: `${100 - metrics.codVsOnline.codPercentage}%` }}
                        />
                    </div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-ui-fg-subtle">
                    <span>COD: {metrics.codVsOnline.codPercentage}%</span>
                    <span>Online: {100 - metrics.codVsOnline.codPercentage}%</span>
                </div>
            </div>

            {/* Orders by Pakistani Cities */}
            <div className="bg-ui-bg-subtle rounded-lg p-6 shadow-sm border border-ui-border-base">
                <Heading
                    level="h3"
                    className="text-xl font-semibold mb-6 text-ui-fg-base flex items-center gap-2"
                >
                    <span className="text-2xl">🏙️</span> Orders by City
                </Heading>

                {metrics.ordersByCity.length > 0 ? (
                    <div className="space-y-4">
                        {metrics.ordersByCity.map((city, index) => (
                            <div key={city.city} className="bg-ui-bg-base rounded-lg p-4 border border-ui-border-base">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs ${index === 0
                                                    ? "bg-green-600"
                                                    : index === 1
                                                        ? "bg-blue-600"
                                                        : index === 2
                                                            ? "bg-purple-600"
                                                            : "bg-gray-400"
                                                }`}
                                        >
                                            {index + 1}
                                        </div>
                                        <div>
                                            <div className="text-ui-fg-base font-bold">{city.city}</div>
                                            <div className="text-ui-fg-subtle text-xs">
                                                {city.orders} orders
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-green-600 font-bold">
                                            {formatCurrency(city.revenue)}
                                        </div>
                                        <Badge>{city.percentage}%</Badge>
                                    </div>
                                </div>
                                <div className="w-full bg-ui-bg-subtle rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-500 ${index === 0
                                                ? "bg-green-500"
                                                : index === 1
                                                    ? "bg-blue-500"
                                                    : index === 2
                                                        ? "bg-purple-500"
                                                        : "bg-gray-400"
                                            }`}
                                        style={{ width: `${city.percentage}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-ui-fg-subtle">
                        <div className="text-4xl mb-2">🗺️</div>
                        <div>No city data available</div>
                    </div>
                )}
            </div>

            {/* Seasonal Trends (Ramadan/Eid) */}
            <div className="bg-ui-bg-subtle rounded-lg p-6 shadow-sm border border-ui-border-base">
                <Heading
                    level="h3"
                    className="text-xl font-semibold mb-6 text-ui-fg-base flex items-center gap-2"
                >
                    <span className="text-2xl">🌙</span> Seasonal Sales Trends (Ramadan/Eid)
                </Heading>

                {metrics.seasonalTrends.length > 0 ? (
                    <div className="space-y-3">
                        {metrics.seasonalTrends.map((trend, index) => (
                            <div
                                key={index}
                                className={`rounded-lg p-4 border ${trend.isRamadan || trend.isEid
                                        ? "bg-green-50 border-green-200"
                                        : "bg-ui-bg-base border-ui-border-base"
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {(trend.isRamadan || trend.isEid) && (
                                            <div className="text-xl">🌙</div>
                                        )}
                                        <div>
                                            <div className="text-ui-fg-base font-bold">{trend.month}</div>
                                            <div className="text-ui-fg-subtle text-xs">
                                                {trend.orders} orders
                                            </div>
                                            {trend.isRamadan && <Badge className="mt-1" color="green">Ramadan</Badge>}
                                            {trend.isEid && <Badge className="mt-1" color="orange">Eid</Badge>}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-ui-fg-base font-bold">
                                            {formatCurrency(trend.revenue)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-ui-fg-subtle">
                        <div className="text-4xl mb-2">📅</div>
                        <div>No seasonal data available</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PakistanMetrics;
