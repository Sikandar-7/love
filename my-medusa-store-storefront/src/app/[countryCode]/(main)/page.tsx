import { Metadata } from "next"

import FeaturedProducts from "@modules/home/components/featured-products"
import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"

// Import new professional components
import HeroSection from "@/components/Hero/HeroSection"
import FeaturesSection from "@/components/Features/FeaturesSection"
import CategoriesSection from "@/components/Categories/CategoriesSection"
import NewsletterSection from "@/components/Newsletter/NewsletterSection"

export const metadata: Metadata = {
  title: "Professional E-commerce Store - Shop Latest Products",
  description:
    "Discover amazing products with the best prices. Free shipping, secure payment, and quality guaranteed.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params

  const region = await getRegion(countryCode)

  const { collections } = await listCollections({
    fields: "id, handle, title",
  })

  if (!collections || !region) {
    return null
  }

  return (
    <>
      {/* New Professional Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Categories Section */}
      <CategoriesSection />

      {/* Featured Products Section */}
      <div className="py-20 bg-gray-50">
        <div className="content-container">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Featured <span className="gradient-text">Products</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Check out our handpicked selection of premium products
            </p>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeaturedProducts collections={collections} region={region} />
          </ul>
        </div>
      </div>

      {/* Newsletter Section */}
      <NewsletterSection />
    </>
  )
}

