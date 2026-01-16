import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Badge, Button } from "@medusajs/ui"
import { useState, useEffect } from "react"

interface LowStockProduct {
  id: string
  title: string
  sku: string
  stock: number
}

const LowStockAlertsWidget = () => {
  const [products, setProducts] = useState<LowStockProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLowStock()
  }, [])

  const fetchLowStock = async () => {
    try {
      setLoading(true)
      const response = await fetch("/admin/custom/analytics")
      const result = await response.json()
      setProducts(result.lowStock || [])
      setError(null)
    } catch (err) {
      console.error("Low stock fetch error:", err)
      setProducts([]) // Show empty state instead of error
      setError(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Container className="p-6">
        <div className="flex items-center justify-center py-4">
          <Text className="text-ui-fg-subtle">Loading...</Text>
        </div>
      </Container>
    )
  }

  if (error) {
    return (
      <Container className="p-6">
        <div className="flex items-center justify-center py-4">
          <Text className="text-ui-fg-danger text-sm">Error: {error}</Text>
        </div>
      </Container>
    )
  }

  if (products.length === 0) {
    return (
      <Container className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Heading level="h2">Low Stock Alerts</Heading>
        </div>
        <div className="bg-ui-bg-subtle p-4 rounded-lg text-center">
          <Text className="text-ui-fg-subtle">
            All products are well stocked! 🎉
          </Text>
        </div>
      </Container>
    )
  }

  return (
    <Container className="p-6">
      <div className="flex items-center justify-between mb-4">
        <Heading level="h2">Low Stock Alerts</Heading>
        <Badge size="small" className="bg-ui-tag-red-bg text-ui-tag-red-text">
          {products.length} items
        </Badge>
      </div>

      <div className="space-y-2">
        {products.slice(0, 5).map((product) => (
          <div
            key={product.id}
            className="flex items-center justify-between p-3 bg-ui-bg-subtle rounded-lg hover:bg-ui-bg-subtle-hover transition-colors cursor-pointer"
            onClick={() => (window.location.href = `/products/${product.id}`)}
          >
            <div className="flex-1">
              <Text className="font-medium text-sm">{product.title}</Text>
              <Text className="text-ui-fg-subtle text-xs">SKU: {product.sku}</Text>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                size="2xsmall"
                className={
                  product.stock < 5
                    ? "bg-ui-tag-red-bg text-ui-tag-red-text"
                    : "bg-ui-tag-orange-bg text-ui-tag-orange-text"
                }
              >
                {product.stock} left
              </Badge>
            </div>
          </div>
        ))}
      </div>

      {products.length > 5 && (
        <div className="mt-4">
          <Button
            variant="secondary"
            size="small"
            onClick={() => (window.location.href = "/products?low_stock=true")}
            className="w-full"
          >
            View All ({products.length})
          </Button>
        </div>
      )}
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "home.before",
})

export default LowStockAlertsWidget
