import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Badge } from "@medusajs/ui"
import { useState, useEffect } from "react"

interface TopProduct {
  id: string
  title: string
  quantity: number
}

const TopProductsWidget = () => {
  const [products, setProducts] = useState<TopProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTopProducts()
  }, [])

  const fetchTopProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch("/admin/custom/analytics")
      const result = await response.json()
      setProducts(result.topProducts || [])
      setError(null)
    } catch (err) {
      console.error("Top products fetch error:", err)
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
          <Heading level="h2">Top Selling Products</Heading>
        </div>
        <div className="bg-ui-bg-subtle p-4 rounded-lg text-center">
          <Text className="text-ui-fg-subtle">No sales data available</Text>
        </div>
      </Container>
    )
  }

  const maxQuantity = Math.max(...products.map((p) => p.quantity), 1)

  return (
    <Container className="p-6">
      <div className="flex items-center justify-between mb-4">
        <Heading level="h2">Top Selling Products</Heading>
        <Badge size="small">Last 10 Orders</Badge>
      </div>

      <div className="space-y-3">
        {products.map((product, index) => {
          const percentage = (product.quantity / maxQuantity) * 100
          return (
            <div
              key={product.id}
              className="flex items-center gap-3 p-3 bg-ui-bg-subtle rounded-lg hover:bg-ui-bg-subtle-hover transition-colors cursor-pointer"
              onClick={() => (window.location.href = `/products/${product.id}`)}
            >
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-ui-fg-interactive text-white text-xs font-bold">
                {index + 1}
              </div>
              <div className="flex-1">
                <Text className="font-medium text-sm">{product.title}</Text>
                <div className="mt-1 bg-ui-bg-base rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-ui-fg-interactive h-full rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
              <Badge size="small" className="bg-ui-tag-green-bg text-ui-tag-green-text">
                {product.quantity} sold
              </Badge>
            </div>
          )
        })}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "home.after",
})

export default TopProductsWidget
