import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Container,
  Heading,
  Text,
  Button,
  Input,
  Checkbox,
  Select,
  Badge,
} from "@medusajs/ui"
import { useState, useEffect } from "react"

interface Product {
  id: string
  title: string
  status: string
  handle: string
}

const BulkProductEditorPage = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [bulkAction, setBulkAction] = useState("")
  const [bulkValue, setBulkValue] = useState("")

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch("/admin/products?limit=100")
      if (!response.ok) throw new Error("Failed to fetch products")
      const result = await response.json()
      setProducts(result.products || [])
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleProduct = (productId: string) => {
    const newSelected = new Set(selectedProducts)
    if (newSelected.has(productId)) {
      newSelected.delete(productId)
    } else {
      newSelected.add(productId)
    }
    setSelectedProducts(newSelected)
  }

  const toggleAll = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set())
    } else {
      setSelectedProducts(new Set(products.map((p) => p.id)))
    }
  }

  const handleBulkUpdate = async () => {
    if (selectedProducts.size === 0 || !bulkAction) {
      alert("Please select products and an action")
      return
    }

    try {
      setSaving(true)
      const updates = Array.from(selectedProducts).map((productId) => ({
        id: productId,
        [bulkAction]: bulkValue,
      }))

      // In a real implementation, you'd call a bulk update API
      for (const update of updates) {
        await fetch(`/admin/products/${update.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [bulkAction]: bulkValue }),
        })
      }

      alert(`Updated ${updates.length} products`)
      setSelectedProducts(new Set())
      setBulkAction("")
      setBulkValue("")
      fetchProducts()
    } catch (error) {
      console.error("Error updating products:", error)
      alert("Failed to update products")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Container className="p-6">
        <Text>Loading products...</Text>
      </Container>
    )
  }

  return (
    <Container className="p-6">
      <div className="flex items-center justify-between mb-6">
        <Heading level="h1">Bulk Product Editor</Heading>
        <Badge>{products.length} products</Badge>
      </div>

      <div className="bg-ui-bg-subtle p-4 rounded-lg mb-6">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Text className="text-sm text-ui-fg-subtle mb-2">Bulk Action</Text>
            <Select value={bulkAction} onValueChange={setBulkAction}>
              <option value="">Select action...</option>
              <option value="status">Change Status</option>
              <option value="metadata">Update Metadata</option>
            </Select>
          </div>
          <div>
            <Text className="text-sm text-ui-fg-subtle mb-2">Value</Text>
            {bulkAction === "status" ? (
              <Select value={bulkValue} onValueChange={setBulkValue}>
                <option value="">Select status...</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </Select>
            ) : (
              <Input
                value={bulkValue}
                onChange={(e) => setBulkValue(e.target.value)}
                placeholder="Enter value..."
              />
            )}
          </div>
          <div className="flex items-end">
            <Button
              onClick={handleBulkUpdate}
              disabled={saving || selectedProducts.size === 0}
              className="w-full"
            >
              {saving ? "Updating..." : `Update ${selectedProducts.size} Products`}
            </Button>
          </div>
        </div>
      </div>

      <div className="border border-ui-border-base rounded-lg overflow-hidden">
        <div className="bg-ui-bg-subtle px-4 py-3 border-b border-ui-border-base">
          <Checkbox
            checked={selectedProducts.size === products.length && products.length > 0}
            onCheckedChange={toggleAll}
            label="Select All"
          />
          <Text className="text-sm text-ui-fg-subtle ml-4">
            {selectedProducts.size} selected
          </Text>
        </div>

        <div className="divide-y divide-ui-border-base">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-4 px-4 py-3 hover:bg-ui-bg-subtle-hover"
            >
              <Checkbox
                checked={selectedProducts.has(product.id)}
                onCheckedChange={() => toggleProduct(product.id)}
              />
              <div className="flex-1">
                <Text className="font-medium">{product.title}</Text>
                <Text className="text-sm text-ui-fg-subtle">/{product.handle}</Text>
              </div>
              <Badge
                size="small"
                className={
                  product.status === "published"
                    ? "bg-ui-tag-green-bg text-ui-tag-green-text"
                    : "bg-ui-tag-grey-bg text-ui-tag-grey-text"
                }
              >
                {product.status}
              </Badge>
              <Button
                variant="transparent"
                size="small"
                onClick={() => (window.location.href = `/products/${product.id}`)}
              >
                Edit
              </Button>
            </div>
          ))}
        </div>
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Bulk Editor",
  icon: null,
})

export default BulkProductEditorPage
