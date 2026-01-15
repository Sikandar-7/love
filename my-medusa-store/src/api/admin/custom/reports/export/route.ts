import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const orderModuleService = req.scope.resolve(Modules.ORDER)
    const type = (req.query.type as string) || "sales"
    const period = (req.query.period as string) || "7d"
    const format = (req.query.format as string) || "csv"

    // Calculate date range
    const endDate = new Date()
    endDate.setHours(23, 59, 59, 999)
    const startDate = new Date()

    switch (period) {
      case "7d":
        startDate.setDate(startDate.getDate() - 7)
        break
      case "30d":
        startDate.setDate(startDate.getDate() - 30)
        break
      case "90d":
        startDate.setDate(startDate.getDate() - 90)
        break
      case "1y":
        startDate.setFullYear(startDate.getFullYear() - 1)
        break
    }

    startDate.setHours(0, 0, 0, 0)

    const orders = await orderModuleService.listOrders({
      created_at: {
        gte: startDate,
        lte: endDate,
      },
      status: ["completed"],
    })

    if (format === "csv") {
      // Generate CSV
      const headers = ["Order ID", "Date", "Customer Email", "Total", "Status"]
      const rows = orders.map((order) => [
        order.display_id || order.id,
        new Date(order.created_at).toLocaleDateString(),
        order.email || "Guest",
        order.total?.toString() || "0",
        order.status || "unknown",
      ])

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n")

      res.setHeader("Content-Type", "text/csv")
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="sales-report-${period}.csv"`
      )
      res.send(csvContent)
    } else {
      // For PDF, return a simple text representation
      // In production, you'd use a library like pdfkit or puppeteer
      const pdfContent = `Sales Report - ${period}\n\n` +
        `Total Orders: ${orders.length}\n` +
        `Total Revenue: ${orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0)}\n\n` +
        orders.map((o) => 
          `${o.display_id || o.id} - ${o.email || "Guest"} - ${o.total}`
        ).join("\n")

      res.setHeader("Content-Type", "application/pdf")
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="sales-report-${period}.pdf"`
      )
      // Note: This is a placeholder. In production, generate actual PDF
      res.send(Buffer.from(pdfContent))
    }
  } catch (error) {
    console.error("Export error:", error)
    res.status(500).json({
      message: "Failed to export report",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
