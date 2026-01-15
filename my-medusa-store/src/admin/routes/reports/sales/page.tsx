import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Container,
  Heading,
  Text,
  Button,
  Select,
  Badge,
} from "@medusajs/ui"
import { useState, useEffect } from "react"

interface SalesReport {
  period: string
  revenue: number
  orders: number
  averageOrderValue: number
  growth: number
}

const SalesReportsPage = () => {
  const [period, setPeriod] = useState("7d")
  const [report, setReport] = useState<SalesReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    fetchReport()
  }, [period])

  const fetchReport = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/admin/custom/reports/sales?period=${period}`)
      if (!response.ok) throw new Error("Failed to fetch report")
      const result = await response.json()
      setReport(result)
    } catch (error) {
      console.error("Error fetching report:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (format: "csv" | "pdf") => {
    try {
      setExporting(true)
      const response = await fetch(
        `/admin/custom/reports/export?type=sales&period=${period}&format=${format}`,
        { method: "POST" }
      )
      if (!response.ok) throw new Error("Export failed")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `sales-report-${period}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Export error:", error)
      alert("Failed to export report")
    } finally {
      setExporting(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <Container className="p-6">
        <Text>Loading report...</Text>
      </Container>
    )
  }

  return (
    <Container className="p-6">
      <div className="flex items-center justify-between mb-6">
        <Heading level="h1">Sales Reports</Heading>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </Select>
          <Button
            variant="secondary"
            onClick={() => handleExport("csv")}
            disabled={exporting}
          >
            Export CSV
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleExport("pdf")}
            disabled={exporting}
          >
            Export PDF
          </Button>
        </div>
      </div>

      {report && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-ui-bg-subtle p-4 rounded-lg">
            <Text className="text-sm text-ui-fg-subtle mb-1">Total Revenue</Text>
            <Text className="text-2xl font-semibold">{formatCurrency(report.revenue)}</Text>
            {report.growth !== 0 && (
              <Badge
                size="2xsmall"
                className={
                  report.growth > 0
                    ? "bg-ui-tag-green-bg text-ui-tag-green-text mt-2"
                    : "bg-ui-tag-red-bg text-ui-tag-red-text mt-2"
                }
              >
                {report.growth > 0 ? "+" : ""}
                {report.growth.toFixed(1)}%
              </Badge>
            )}
          </div>
          <div className="bg-ui-bg-subtle p-4 rounded-lg">
            <Text className="text-sm text-ui-fg-subtle mb-1">Total Orders</Text>
            <Text className="text-2xl font-semibold">{report.orders}</Text>
          </div>
          <div className="bg-ui-bg-subtle p-4 rounded-lg">
            <Text className="text-sm text-ui-fg-subtle mb-1">Average Order Value</Text>
            <Text className="text-2xl font-semibold">
              {formatCurrency(report.averageOrderValue)}
            </Text>
          </div>
          <div className="bg-ui-bg-subtle p-4 rounded-lg">
            <Text className="text-sm text-ui-fg-subtle mb-1">Period</Text>
            <Text className="text-lg font-semibold">{report.period}</Text>
          </div>
        </div>
      )}

      <div className="bg-ui-bg-subtle p-4 rounded-lg">
        <Text className="text-sm text-ui-fg-subtle">
          Detailed charts and breakdowns would be displayed here. This is a placeholder
          for the full report visualization.
        </Text>
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Sales Reports",
  icon: null,
})

export default SalesReportsPage
