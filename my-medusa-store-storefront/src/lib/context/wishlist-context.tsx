"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface WishlistContextType {
    wishlist: string[]
    addToWishlist: (productId: string) => void
    removeFromWishlist: (productId: string) => void
    isInWishlist: (productId: string) => boolean
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
    const [wishlist, setWishlist] = useState<string[]>([])

    // Load wishlist from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem("wishlist")
        if (saved) {
            setWishlist(JSON.parse(saved))
        }
    }, [])

    // Save wishlist to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem("wishlist", JSON.stringify(wishlist))
    }, [wishlist])

    const addToWishlist = (productId: string) => {
        setWishlist((prev) => {
            if (!prev.includes(productId)) {
                return [...prev, productId]
            }
            return prev
        })
    }

    const removeFromWishlist = (productId: string) => {
        setWishlist((prev) => prev.filter((id) => id !== productId))
    }

    const isInWishlist = (productId: string) => {
        return wishlist.includes(productId)
    }

    return (
        <WishlistContext.Provider
            value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist }}
        >
            {children}
        </WishlistContext.Provider>
    )
}

export function useWishlist() {
    const context = useContext(WishlistContext)
    if (context === undefined) {
        throw new Error("useWishlist must be used within a WishlistProvider")
    }
    return context
}
