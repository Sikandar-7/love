import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    // Try to resolve services, but handle gracefully if they fail
    let orderModuleService, productModuleService, inventoryModuleService, customerModuleService
    
    try {
      orderModuleService = req.scope.resolve(Modules.ORDER)
    } catch (e) {
      console.error("Order module not available:", e)
    }
    
    try {
      productModuleService = req.scope.resolve(Modules.PRODUCT)
    } catch (e) {
      console.error("Product module not available:", e)
    }
    
    try {
      inventoryModuleService = req.scope.resolve(Modules.INVENTORY)
    } catch (e) {
      console.error("Inventory module not available:", e)
    }
    
    try {
      customerModuleService = req.scope.resolve(Modules.CUSTOMER)
    } catch (e) {
      console.error("Customer module not available:", e)
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayEnd = new Date(today)
    todayEnd.setHours(23, 59, 59, 999)

    // Today's sales
    let todayOrders = []
    let todayRevenue = 0
    let todayOrderCount = 0
    let recentOrders = []

    if (orderModuleService) {
      try {
        todayOrders = await orderModuleService.listOrders({
          created_at: {
            gte: today,
            lte: todayEnd,
          },
          status: ["completed"],
        }) || []

        todayRevenue = todayOrders.reduce((sum, order) => {
          return sum + (Number(order.total) || 0)
        }, 0)

        todayOrderCount = todayOrders.length

        // Recent orders (last 10)
        recentOrders = await orderModuleService.listOrders(
          {
            limit: 10,
          },
          {
            relations: ["customer", "items"],
            order: { created_at: "DESC" },
          }
        ) || []
      } catch (e) {
        console.error("Error fetching orders:", e)
      }
    }

    // Low stock products
    const lowStockProducts = []
    if (productModuleService && inventoryModuleService) {
      try {
        const products = await productModuleService.listProducts({
          limit: 100,
        }) || []

        for (const product of products) {
          try {
            const variants = await productModuleService.listProductVariants({
              product_id: product.id,
            }) || []

            for (const variant of variants) {
              try {
                const inventoryItems = await inventoryModuleService.listInventoryItems({
                  sku: variant.sku,
                }) || []

                for (const item of inventoryItems) {
                  try {
                    const locationLevels = await inventoryModuleService.listInventoryLevels(
                      {
                        inventory_item_id: item.id,
                      }
                    ) || []

                    const totalStock = locationLevels.reduce(
                      (sum, level) => sum + (level.stocked_quantity || 0),
                      0
                    )

                    if (totalStock < 10 && totalStock > 0) {
                      lowStockProducts.push({
                        id: product.id,
                        title: product.title,
                        sku: variant.sku,
                        stock: totalStock,
                      })
                      break
                    }
                  } catch (e) {
                    // Skip this item
                  }
                }
              } catch (e) {
                // Skip this variant
              }
            }
          } catch (e) {
            // Skip this product
          }
        }
      } catch (e) {
        console.error("Error fetching low stock products:", e)
      }
    }

    // Top selling products (by order count)
    const topProductsData = []
    if (productModuleService && recentOrders.length > 0) {
      try {
        const productSales = new Map()
        for (const order of recentOrders) {
          if (order.items) {
            for (const item of order.items) {
              const productId = item.product_id || item.variant?.product_id
              if (productId) {
                const current = productSales.get(productId) || 0
                productSales.set(productId, current + (item.quantity || 1))
              }
            }
          }
        }

        const topProducts = Array.from(productSales.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)

        for (const [productId, quantity] of topProducts) {
          try {
            const product = await productModuleService.retrieveProduct(productId)
            topProductsData.push({
              id: product.id,
              title: product.title,
              quantity,
            })
          } catch (e) {
            // Skip this product
          }
        }
      } catch (e) {
        console.error("Error fetching top products:", e)
      }
    }

    // Revenue chart data (last 7 days)
    const revenueData = []
    if (orderModuleService) {
      try {
        for (let i = 6; i >= 0; i--) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          date.setHours(0, 0, 0, 0)
          const dateEnd = new Date(date)
          dateEnd.setHours(23, 59, 59, 999)

          try {
            const dayOrders = await orderModuleService.listOrders({
              created_at: {
                gte: date,
                lte: dateEnd,
              },
              status: ["completed"],
            }) || []

            const dayRevenue = dayOrders.reduce(
              (sum, order) => sum + (Number(order.total) || 0),
              0
            )

            revenueData.push({
              date: date.toISOString().split("T")[0],
              revenue: dayRevenue,
              orders: dayOrders.length,
            })
          } catch (e) {
            // Add empty data for this day
            revenueData.push({
              date: date.toISOString().split("T")[0],
              revenue: 0,
              orders: 0,
            })
          }
        }
      } catch (e) {
        console.error("Error fetching revenue chart:", e)
      }
    }

    // Customer activity (recent customers)
    let recentCustomers = []
    if (customerModuleService) {
      try {
        recentCustomers = await customerModuleService.listCustomers({
          limit: 10,
          order: { created_at: "DESC" },
        }) || []
      } catch (e) {
        console.error("Error fetching customers:", e)
      }
    }

    res.json({
      today: {
        revenue: todayRevenue,
        orders: todayOrderCount,
      },
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        display_id: order.display_id,
        email: order.email,
        total: order.total,
        status: order.status,
        created_at: order.created_at,
        customer: order.customer
          ? {
              id: order.customer.id,
              email: order.customer.email,
            }
          : null,
      })),
      lowStock: lowStockProducts.slice(0, 10),
      topProducts: topProductsData,
      revenueChart: revenueData,
      recentCustomers: recentCustomers.map((customer) => ({
        id: customer.id,
        email: customer.email,
        created_at: customer.created_at,
      })),
    })
  } catch (error) {
    console.error("Analytics error:", error)
    // Return empty data instead of error to prevent white screen
    res.json({
      today: {
        revenue: 0,
        orders: 0,
      },
      recentOrders: [],
      lowStock: [],
      topProducts: [],
      revenueChart: [],
      recentCustomers: [],
    })
  }
}
