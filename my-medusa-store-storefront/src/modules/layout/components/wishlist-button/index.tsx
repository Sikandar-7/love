"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useWishlist } from "@lib/context/wishlist-context"
import { useEffect, useState } from "react"

export default function WishlistButton() {
    const { wishlist } = useWishlist()
    const [mounted, setMounted] = useState(false)

    // Avoid hydration mismatch
    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <LocalizedClientLink
                href="/wishlist"
                className="relative flex items-center justify-center w-10 h-10 hover:bg-gray-100 rounded-lg transition-colors"
            >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
            </LocalizedClientLink>
        )
    }

    return (
        <LocalizedClientLink
            href="/wishlist"
            className="relative flex items-center justify-center w-10 h-10 hover:bg-gray-100 rounded-lg transition-colors"
        >
            <svg
                className={`w-6 h-6 transition-colors ${wishlist.length > 0 ? 'text-red-500 fill-current' : 'text-gray-700'}`}
                fill={wishlist.length > 0 ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-fade-in">
                    {wishlist.length}
                </span>
            )}
        </LocalizedClientLink>
    )
}
