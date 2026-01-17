import { Suspense } from "react"
import { listRegions } from "@lib/data/regions"
import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import WishlistButton from "@modules/layout/components/wishlist-button"
import SideMenu from "@modules/layout/components/side-menu"
import SearchBar from "./search-bar"

export default async function Nav() {
  const [regions, locales, currentLocale] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    listLocales(),
    getLocale(),
  ])

  return (
    <div className="sticky top-0 inset-x-0 z-50">
      <header className="bg-white shadow-md transition-colors">
        <nav className="content-container flex items-center justify-between h-16 gap-4">
          {/* Hamburger Menu - 3 Lines */}
          <div className="flex items-center h-full">
            <SideMenu regions={regions} locales={locales} currentLocale={currentLocale} />
          </div>

          {/* Logo - Love and Joy */}
          <LocalizedClientLink href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="bg-gradient-to-br from-pink-600 to-purple-600 text-white px-3 py-1.5 rounded-lg font-bold text-lg">
              Love & Joy
            </div>
            <span className="hidden sm:inline-block bg-yellow-400 text-black px-2 py-0.5 rounded text-xs font-semibold">
              Online
            </span>
          </LocalizedClientLink>

          {/* Search Bar */}
          <SearchBar />

          {/* Right Side: Login & Cart */}
          <div className="flex items-center gap-3">
            {/* Login/Account */}
            <LocalizedClientLink
              href="/account"
              className="hidden sm:flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <div className="flex flex-col items-start">
                <span className="text-xs text-gray-500">Login</span>
                <span className="text-sm font-semibold text-gray-800">Account</span>
              </div>
            </LocalizedClientLink>

            {/* Wishlist */}
            <WishlistButton />

            {/* Cart */}
            <Suspense
              fallback={
                <LocalizedClientLink
                  href="/cart"
                  className="relative flex items-center justify-center w-10 h-10 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    0
                  </span>
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>

        {/* Mobile Search Bar */}
        <div className="md:hidden px-4 pb-3">
          <SearchBar />
        </div>
      </header>
    </div>
  )
}
