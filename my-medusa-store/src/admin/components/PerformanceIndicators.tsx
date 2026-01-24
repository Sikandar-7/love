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
                { name: 'Orders API', url: '/admin/orders?limit=1' },
                { name: 'Products API', url: '/admin/products?limit=1' },
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
                return 'grey'
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
            <div className="flex items-center justify-center p-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-ui-fg-subtle">Measuring Performance...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-ui-fg-base">
                        ⚡ Performance Indicators
                    </h2>
                    <p className="text-ui-fg-subtle">
                        Real-time system health
                    </p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="px-4 py-2 bg-ui-button-inverted text-ui-fg-on-inverted rounded-md text-sm font-medium disabled:opacity-50"
                >
                    {refreshing ? 'Refreshing...' : 'Refresh Now'}
                </button>
            </div>

            {/* System Health Status */}
            <div className={`rounded-xl p-8 border ${metrics.systemHealth.status === 'healthy' ? 'bg-green-50 border-green-200' :
                    metrics.systemHealth.status === 'degraded' ? 'bg-orange-50 border-orange-200' :
                        'bg-red-50 border-red-200'
                }`}>
                <div className="text-center">
                    <div className="text-6xl mb-4">
                        {metrics.systemHealth.status === 'healthy' ? '✅' :
                            metrics.systemHealth.status === 'degraded' ? '⚠️' : '❌'}
                    </div>
                    <div className="text-2xl font-bold mb-2 text-ui-fg-base">
                        {metrics.systemHealth.status.toUpperCase()}
                    </div>
                    <div className="text-ui-fg-subtle">
                        Uptime: {metrics.systemHealth.uptime}% | Last Checked: {metrics.systemHealth.lastChecked}
                    </div>
                </div>
            </div>

            {/* Key Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-ui-bg-subtle rounded-xl p-6 border border-ui-border-base">
                    <div className="text-ui-fg-subtle text-sm mb-1">Page Load Time</div>
                    <div className="text-3xl font-bold text-ui-fg-base">{metrics.pageLoadTime}ms</div>
                    <div className="text-ui-fg-muted text-sm mt-2">
                        {metrics.pageLoadTime < 1000 ? '⚡ Excellent' :
                            metrics.pageLoadTime < 2000 ? '✅ Good' : '⚠️ Slow'}
                    </div>
                </div>

                <div className="bg-ui-bg-subtle rounded-xl p-6 border border-ui-border-base">
                    <div className="text-ui-fg-subtle text-sm mb-1">Error Rate</div>
                    <div className="text-3xl font-bold text-ui-fg-base">{metrics.errorRate}%</div>
                    <div className="text-ui-fg-muted text-sm mt-2">
                        {metrics.failedRequests} failed requests
                    </div>
                </div>

                <div className="bg-ui-bg-subtle rounded-xl p-6 border border-ui-border-base">
                    <div className="text-ui-fg-subtle text-sm mb-1">Success Rate</div>
                    <div className="text-3xl font-bold text-ui-fg-base">
                        {metrics.totalRequests > 0
                            ? Math.round(((metrics.totalRequests - metrics.failedRequests) / metrics.totalRequests) * 100)
                            : 100}%
                    </div>
                </div>
            </div>

            {/* API Response Times */}
            <div className="bg-ui-bg-subtle rounded-lg p-6 border border-ui-border-base">
                <Heading level="h3" className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <span className="text-xl">🚀</span> API Response Times
                </Heading>

                <div className="space-y-4">
                    {metrics.apiResponseTimes.map((api, index) => (
                        <div key={index} className="bg-ui-bg-base rounded-lg p-4 border border-ui-border-base">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="text-xl">{getStatusIcon(api.status)}</div>
                                    <div>
                                        <div className="font-bold text-ui-fg-base">{api.endpoint}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold">{api.responseTime}ms</div>
                                </div>
                            </div>

                            {/* Response Time Bar */}
                            <div className="w-full bg-ui-bg-subtle rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full transition-all duration-500 ${api.status === 'excellent' ? 'bg-green-500' :
                                        api.status === 'good' ? 'bg-blue-500' :
                                            api.status === 'slow' ? 'bg-orange-500' : 'bg-red-500'
                                        }`}
                                    style={{ width: `${Math.min((api.responseTime / 3000) * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default PerformanceIndicators
