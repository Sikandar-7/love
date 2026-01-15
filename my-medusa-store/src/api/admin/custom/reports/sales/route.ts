import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const orderModuleService = req.scope.resolve(Modules.ORDER)
    const period = (req.query.period as string) || "7d"

    // Calculate date range based on period
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
      default:
        startDate.setDate(startDate.getDate() - 7)
    }

    startDate.setHours(0, 0, 0, 0)

    // Get orders for the period
    const orders = await orderModuleService.listOrders({
      created_at: {
        gte: startDate,
        lte: endDate,
      },
      status: ["completed"],
    })

    // Calculate previous period for growth comparison
    const previousStartDate = new Date(startDate)
    const previousEndDate = new Date(startDate)
    const daysDiff = Math.floor(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    previousStartDate.setDate(previousStartDate.getDate() - daysDiff - 1)
    previousEndDate.setTime(startDate.getTime() - 1)

    const previousOrders = await orderModuleService.listOrders({
      created_at: {
        gte: previousStartDate,
        lte: previousEndDate,
      },
      status: ["completed"],
    })

    const revenue = orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0)
    const previousRevenue = previousOrders.reduce(
      (sum, order) => sum + (Number(order.total) || 0),
      0
    )

    const growth =
      previousRevenue > 0 ? ((revenue - previousRevenue) / previousRevenue) * 100 : 0

    const averageOrderValue = orders.length > 0 ? revenue / orders.length : 0

    res.json({
      period,
      revenue,
      orders: orders.length,
      averageOrderValue,
      growth,
    })
  } catch (error) {
    console.error("Sales report error:", error)
    res.status(500).json({
      message: "Failed to generate sales report",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
