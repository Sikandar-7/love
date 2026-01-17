import { Metadata } from "next"
import WishlistTemplate from "@modules/wishlist/templates"
import { getRegion } from "@lib/data/regions"

export const metadata: Metadata = {
    title: "Wishlist",
    description: "View your wishlist items",
}

export default async function WishlistPage(props: {
    params: Promise<{ countryCode: string }>
}) {
    const params = await props.params
    const region = await getRegion(params.countryCode)

    if (!region) {
        return null
    }

    return <WishlistTemplate region={region} />
}
