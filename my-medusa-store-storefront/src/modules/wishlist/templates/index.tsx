"use client"

import { useWishlist } from "@lib/context/wishlist-context"
import { HttpTypes } from "@medusajs/types"
import { Text, Heading } from "@medusajs/ui"
import ProductPreview from "@modules/products/components/product-preview"
import { useEffect, useState } from "react"

import Link from "next/link"

export default function WishlistTemplate({
    region,
}: {
    region: HttpTypes.StoreRegion
}) {
    const { wishlist } = useWishlist()
    const [products, setProducts] = useState<HttpTypes.StoreProduct[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchWishlistProducts() {
            if (wishlist.length === 0) {
                setProducts([])
                setLoading(false)
                return
            }

            try {
                // We'll fetching products using a server action or API route
                // For now, let's assume we can fetch by IDs
                // Since we don't have a direct 'getProductsByIds' exposed to client easily without SDK,
                // we might need to use the existing listProducts but filter client side or similar.
                // Or simpler: fetch all unique IDs.

                // Simulating fetch for now since we need to bridge client/server
                // In a real app we'd use a server action or API route.
                // Let's rely on a utility we will create or use medusa-js if available.

                // Temporary: We will fallback to showing a message if we can't implement complex fetching right now
                // But let's try to fetch.

                const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/products?ids=${wishlist.join(',')}&region_id=${region.id}`)
                // This API route might not exist.

                // Alternative: Use medusa-js client if installed or just standard fetch to backend
                const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
                const query = new URLSearchParams()
                wishlist.forEach(id => query.append("id[]", id))
                query.append("region_id", region.id)

                const res = await fetch(`${backendUrl}/store/products?${query.toString()}`, {
                    headers: {
                        "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
                    }
                })
                const data = await res.json()
                setProducts(data.products)

            } catch (error) {
                console.error("Failed to fetch wishlist products", error)
            } finally {
                setLoading(false)
            }
        }

        fetchWishlistProducts()
    }, [wishlist, region.id])

    if (loading) {
        return (
            <div className="content-container py-12 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        )
    }

    return (
        <div className="content-container py-12">
            <div className="mb-8 border-b pb-4">
                <Heading level="h1" className="text-3xl font-bold text-gray-900">Your Wishlist</Heading>
                <Text className="text-gray-600 mt-2">
                    {products.length} {products.length === 1 ? 'item' : 'items'} saved for later
                </Text>
            </div>

            {products.length > 0 ? (
                <ul className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8">
                    {products.map((product) => (
                        <li key={product.id}>
                            <ProductPreview product={product} region={region} />
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="py-20 flex flex-col items-center justify-center text-center">
                    <div className="bg-gray-100 p-6 rounded-full mb-4">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </div>
                    <Text className="text-xl font-semibold text-gray-900 mb-2">
                        Your wishlist is empty
                    </Text>
                    <Text className="text-gray-500 mb-8 max-w-md">
                        Looks like you haven't added anything to your wishlist yet. Explore our products and find something you love!
                    </Text>
                    <Link href="/store" className="btn-primary">
                        Browse Products
                    </Link>
                </div>
            )}
        </div>
    )
}
