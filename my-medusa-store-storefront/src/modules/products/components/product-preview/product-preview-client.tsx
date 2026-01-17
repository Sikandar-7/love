"use client"

import { Text } from "@medusajs/ui"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import { useWishlist } from "@lib/context/wishlist-context"
import { useState } from "react"

export default function ProductPreviewClient({
    product,
    isFeatured,
    cheapestPrice,
}: {
    product: HttpTypes.StoreProduct
    isFeatured?: boolean
    cheapestPrice: any
}) {
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
    const [showNotification, setShowNotification] = useState(false)

    const inWishlist = isInWishlist(product.id!)

    const formatPrice = (amount: number, currencyCode: string) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: currencyCode.toUpperCase(),
            minimumFractionDigits: 0,
        }).format(amount)
    }

    const handleWishlistClick = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (inWishlist) {
            removeFromWishlist(product.id!)
        } else {
            addToWishlist(product.id!)
            setShowNotification(true)
            setTimeout(() => setShowNotification(false), 2000)
        }
    }

    return (
        <LocalizedClientLink href={`/products/${product.handle}`} className="group block">
            <div className="relative card card-hover overflow-hidden animate-fade-in" data-testid="product-wrapper">
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-50">
                    <Thumbnail
                        thumbnail={product.thumbnail}
                        images={product.images}
                        size="full"
                        isFeatured={isFeatured}
                    />

                    {/* Overlay on Hover */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <button className="btn-primary transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                            Quick View
                        </button>
                    </div>

                    {/* Wishlist Button - Always Visible on Mobile, Hover on Desktop */}
                    <button
                        onClick={handleWishlistClick}
                        className={`absolute top-4 right-4 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 hover:scale-110 z-10 ${inWishlist ? 'bg-red-50' : ''
                            }`}
                    >
                        <svg
                            className={`w-5 h-5 transition-colors ${inWishlist ? 'text-red-500 fill-current' : 'text-red-500'}`}
                            fill={inWishlist ? "currentColor" : "none"}
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </button>

                    {/* Wishlist Notification */}
                    {showNotification && (
                        <div className="absolute top-16 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm animate-fade-in z-20">
                            Added to wishlist! ❤️
                        </div>
                    )}

                    {/* New Badge */}
                    <div className="absolute top-4 left-4">
                        <span className="badge badge-primary shadow-md">New</span>
                    </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors" data-testid="product-title">
                        {product.title}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                            <svg
                                key={i}
                                className={`w-4 h-4 ${i < 4 ? 'text-yellow-400' : 'text-gray-300'}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        ))}
                        <span className="text-sm text-gray-600 ml-1">(4.5)</span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between">
                        <div>
                            {cheapestPrice && (
                                <span className="text-2xl font-bold gradient-text">
                                    {formatPrice(cheapestPrice.calculated_price_number, cheapestPrice.currency_code)}
                                </span>
                            )}
                        </div>

                        {/* Add to Cart Button */}
                        <button className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 hover-scale shadow-md">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                    </div>

                    {/* Stock Status */}
                    <div className="mt-3">
                        <span className="badge badge-success text-xs">In Stock</span>
                    </div>
                </div>
            </div>
        </LocalizedClientLink>
    )
}
