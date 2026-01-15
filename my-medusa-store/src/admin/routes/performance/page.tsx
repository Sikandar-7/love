import { defineRouteConfig } from "@medusajs/admin-sdk"
import { BoltSolid } from "@medusajs/icons"
import { Heading, Badge } from "@medusajs/ui"
import { useEffect, useState } from "react"

interface PerformanceMetrics {
    pageLoadTime: number
    apiResponseTimes: {
        endpoint: string
        responseTime: number
        status: 'excellent' | 'good' | 'slow' | 'error'
    }[]
    errorRate: number
    totalRequests: number
    failedRequests: number
    systemHealth: {
        status: 'healthy' | 'degraded' | 'down'
        uptime: number
        lastChecked: string
    }
    recentErrors: {
        endpoint: string
        error: string
        timestamp: string
    }[]
}

const PerformanceIndicators = () => {
    const [metrics, setMetrics] = useState<PerformanceMetrics>({
        pageLoadTime: 0,
        apiResponseTimes: [],
        errorRate: 0,
        totalRequests: 0,
        failedRequests: 0,
        systemHealth: {
            status: 'healthy',
            uptime: 100,
            lastChecked: new Date().toLocaleTimeString()
        },
        recentErrors: []
    })
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const measurePerformance = async () => {
        const startTime = performance.now()

        try {
            const endpoints = [
                { name: 'Orders API', url: '/admin/orders' },
                { name: 'Products API', url: '/admin/products' },
                { name: 'Customers API', url: '/admin/customers' }
            ]

            const apiResponseTimes: any[] = []
            let totalRequests = 0
            let failedRequests = 0
            const recentErrors: any[] = []

            for (const endpoint of endpoints) {
                const apiStartTime = performance.now()
                totalRequests++

                try {
                    const response = await fetch(endpoint.url, { credentials: 'include' })
                    const apiEndTime = performance.now()
                    const responseTime = Math.round(apiEndTime - apiStartTime)

                    let status: 'excellent' | 'good' | 'slow' | 'error' = 'excellent'
                    if (responseTime > 2000) status = 'slow'
                    else if (responseTime > 1000) status = 'good'

                    if (!response.ok) {
                        status = 'error'
                        failedRequests++
                        recentErrors.push({
                            endpoint: endpoint.name,
                            error: `HTTP ${response.status}`,
                            timestamp: new Date().toLocaleTimeString()
                        })
                    }

                    apiResponseTimes.push({
                        endpoint: endpoint.name,
                        responseTime,
                        status
                    })
                } catch (error: any) {
                    const apiEndTime = performance.now()
                    const responseTime = Math.round(apiEndTime - apiStartTime)

                    failedRequests++
                    apiResponseTimes.push({
                        endpoint: endpoint.name,
                        responseTime,
                        status: 'error'
                    })

                    recentErrors.push({
                        endpoint: endpoint.name,
                        error: error.message || 'Network error',
                        timestamp: new Date().toLocaleTimeString()
                    })
                }
            }

            const pageLoadTime = Math.round(performance.now() - startTime)
            const errorRate = totalRequests > 0 ? Math.round((failedRequests / totalRequests) * 100) : 0

            // System Health
            const systemHealth = {
                status: (errorRate === 0 ? 'healthy' : errorRate < 20 ? 'degraded' : 'down') as 'healthy' | 'degraded' | 'down',
                uptime: Math.max(0, 100 - errorRate),
                lastChecked: new Date().toLocaleTimeString()
            }

            setMetrics({
                pageLoadTime,
                apiResponseTimes,
                errorRate,
                totalRequests,
                failedRequests,
                systemHealth,
                recentErrors
            })
        } catch (error) {
            console.error('Error measuring performance:', error)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => {
        measurePerformance()

        // Auto-refresh every 30 seconds
        const interval = setInterval(() => {
            measurePerformance()
        }, 30000)

        return () => clearInterval(interval)
    }, [])

    const handleRefresh = () => {
        setRefreshing(true)
        measurePerformance()
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'excellent':
            case 'healthy':
                return 'green'
            case 'good':
            case 'degraded':
                return 'orange'
            case 'slow':
            case 'down':
                return 'red'
            case 'error':
                return 'red'
            default:
                return 'gray'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'excellent':
            case 'healthy':
                return '✅'
            case 'good':
            case 'degraded':
                return '⚠️'
            case 'slow':
            case 'down':
            case 'error':
                return '❌'
            default:
                return '❓'
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-800">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-lg text-gray-300">Measuring Performance...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-8 bg-gray-800 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <Heading level="h1" className="text-4xl font-bold mb-2 text-white">
                            ⚡ Performance Indicators
                        </Heading>
                        <p className="text-gray-300 text-lg">
                            Real-time system performance and health monitoring
                        </p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                        {refreshing ? '🔄 Refreshing...' : '🔄 Refresh Now'}
                    </button>
                </div>
            </div>

            {/* System Health Status */}
            <div className={`rounded-lg p-8 shadow-lg mb-8 ${metrics.systemHealth.status === 'healthy' ? 'bg-gradient-to-r from-green-600 to-emerald-700' :
                    metrics.systemHealth.status === 'degraded' ? 'bg-gradient-to-r from-orange-600 to-red-700' :
                        'bg-gradient-to-r from-red-600 to-red-800'
                }`}>
                <div className="text-center text-white">
                    <div className="text-6xl mb-4">
                        {metrics.systemHealth.status === 'healthy' ? '✅' :
                            metrics.systemHealth.status === 'degraded' ? '⚠️' : '❌'}
                    </div>
                    <div className="text-4xl font-bold mb-2">
                        System Status: {metrics.systemHealth.status.toUpperCase()}
                    </div>
                    <div className="text-xl opacity-90">
                        Uptime: {metrics.systemHealth.uptime}% | Last Checked: {metrics.systemHealth.lastChecked}
                    </div>
                </div>
            </div>

            {/* Key Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-xl p-6 shadow-lg">
                    <div className="text-sm opacity-90 mb-1">Page Load Time</div>
                    <div className="text-4xl font-bold">{metrics.pageLoadTime}ms</div>
                    <div className="text-sm opacity-80 mt-2">
                        {metrics.pageLoadTime < 1000 ? '⚡ Excellent' :
                            metrics.pageLoadTime < 2000 ? '✅ Good' : '⚠️ Slow'}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-xl p-6 shadow-lg">
                    <div className="text-sm opacity-90 mb-1">Error Rate</div>
                    <div className="text-4xl font-bold">{metrics.errorRate}%</div>
                    <div className="text-sm opacity-80 mt-2">
                        {metrics.failedRequests} of {metrics.totalRequests} requests failed
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl p-6 shadow-lg">
                    <div className="text-sm opacity-90 mb-1">Successful Requests</div>
                    <div className="text-4xl font-bold">{metrics.totalRequests - metrics.failedRequests}</div>
                    <div className="text-sm opacity-80 mt-2">
                        {Math.round(((metrics.totalRequests - metrics.failedRequests) / metrics.totalRequests) * 100)}% success rate
                    </div>
                </div>
            </div>

            {/* API Response Times */}
            <div className="bg-gray-700 rounded-lg p-6 shadow-lg border border-gray-600 mb-8">
                <Heading level="h3" className="text-2xl font-semibold mb-6 text-white flex items-center gap-2">
                    <span className="text-3xl">🚀</span> API Response Times
                </Heading>

                <div className="space-y-4">
                    {metrics.apiResponseTimes.map((api, index) => (
                        <div key={index} className="bg-gray-600 rounded-lg p-5">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="text-3xl">{getStatusIcon(api.status)}</div>
                                    <div>
                                        <div className="text-white text-lg font-bold">{api.endpoint}</div>
                                        <div className="text-gray-300 text-sm">Response time measurement</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-white text-2xl font-bold">{api.responseTime}ms</div>
                                    <Badge color={getStatusColor(api.status)}>
                                        {api.status.toUpperCase()}
                                    </Badge>
                                </div>
                            </div>

                            {/* Response Time Bar */}
                            <div className="w-full bg-gray-700 rounded-full h-3">
                                <div
                                    className={`h-3 rounded-full transition-all duration-500 ${api.status === 'excellent' ? 'bg-green-500' :
                                            api.status === 'good' ? 'bg-blue-500' :
                                                api.status === 'slow' ? 'bg-orange-500' : 'bg-red-500'
                                        }`}
                                    style={{ width: `${Math.min((api.responseTime / 3000) * 100, 100)}%` }}
                                />
                            </div>

                            <div className="flex justify-between text-xs text-gray-400 mt-1">
                                <span>0ms (Instant)</span>
                                <span>1000ms (Good)</span>
                                <span>2000ms (Slow)</span>
                                <span>3000ms+</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Errors */}
            {metrics.recentErrors.length > 0 && (
                <div className="bg-red-900 border border-red-600 rounded-lg p-6 shadow-lg mb-8">
                    <Heading level="h3" className="text-xl font-semibold mb-6 text-white flex items-center gap-2">
                        <span className="text-2xl">⚠️</span> Recent Errors
                    </Heading>

                    <div className="space-y-3">
                        {metrics.recentErrors.map((error, index) => (
                            <div key={index} className="bg-red-800 rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="text-white font-bold">{error.endpoint}</div>
                                        <div className="text-red-200 text-sm">{error.error}</div>
                                    </div>
                                    <div className="text-red-300 text-xs">{error.timestamp}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Performance Tips */}
            <div className="bg-gray-700 rounded-lg p-6 shadow-lg border border-gray-600">
                <Heading level="h3" className="text-xl font-semibold mb-4 text-white">
                    💡 Performance Tips
                </Heading>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-600 rounded-lg p-4">
                        <div className="text-green-400 font-bold mb-2">✅ Excellent (0-500ms)</div>
                        <div className="text-gray-300 text-sm">
                            Your API is responding instantly. Great performance!
                        </div>
                    </div>

                    <div className="bg-gray-600 rounded-lg p-4">
                        <div className="text-blue-400 font-bold mb-2">✅ Good (500-1000ms)</div>
                        <div className="text-gray-300 text-sm">
                            Response times are acceptable. Users won't notice delays.
                        </div>
                    </div>

                    <div className="bg-gray-600 rounded-lg p-4">
                        <div className="text-orange-400 font-bold mb-2">⚠️ Slow (1000-2000ms)</div>
                        <div className="text-gray-300 text-sm">
                            Consider optimizing queries or adding caching.
                        </div>
                    </div>

                    <div className="bg-gray-600 rounded-lg p-4">
                        <div className="text-red-400 font-bold mb-2">❌ Critical (2000ms+)</div>
                        <div className="text-gray-300 text-sm">
                            Immediate action needed. Check server resources and database.
                        </div>
                    </div>
                </div>
            </div>

            {/* Info Banner */}
            <div className="mt-8 bg-gray-900 text-white rounded-lg p-6">
                <div className="flex items-start gap-4">
                    <div className="text-3xl">⚡</div>
                    <div>
                        <div className="text-lg font-semibold mb-2">Performance Monitoring Dashboard</div>
                        <div className="text-gray-300 text-sm">
                            Real-time performance metrics measured directly from your browser. Auto-refreshes every 30 seconds. Response times include network latency and server processing time. 📊
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export const config = defineRouteConfig({
    label: "Performance",
    icon: BoltSolid,
})

export default PerformanceIndicators
