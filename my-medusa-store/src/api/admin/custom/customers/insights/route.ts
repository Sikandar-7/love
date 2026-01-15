import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const customerModuleService = req.scope.resolve(Modules.CUSTOMER)
    const orderModuleService = req.scope.resolve(Modules.ORDER)
    const segmentFilter = (req.query.segment as string) || "all"

    const customers = await customerModuleService.listCustomers({ limit: 1000 })

    const customerInsights = await Promise.all(
      customers.map(async (customer) => {
        const orders = await orderModuleService.listOrders({
          customer_id: customer.id,
          status: ["completed"],
        })

        const lifetimeValue = orders.reduce(
          (sum, order) => sum + (Number(order.total) || 0),
          0
        )
        const orderCount = orders.length
        const averageOrderValue =
          orderCount > 0 ? lifetimeValue / orderCount : 0

        const lastOrder = orders.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0]

        // Determine segment based on LTV
        let segment = "low"
        if (lifetimeValue >= 50000) segment = "vip"
        else if (lifetimeValue >= 20000) segment = "high"
        else if (lifetimeValue >= 5000) segment = "medium"

        return {
          id: customer.id,
          email: customer.email,
          lifetimeValue,
          orderCount,
          averageOrderValue,
          lastOrderDate: lastOrder?.created_at || customer.created_at,
          segment,
        }
      })
    )

    // Filter by segment if specified
    const filtered =
      segmentFilter === "all"
        ? customerInsights
        : customerInsights.filter((c) => c.segment === segmentFilter)

    // Sort by LTV descending
    filtered.sort((a, b) => b.lifetimeValue - a.lifetimeValue)

    res.json({
      customers: filtered,
    })
  } catch (error) {
    console.error("Customer insights error:", error)
    res.status(500).json({
      message: "Failed to fetch customer insights",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
