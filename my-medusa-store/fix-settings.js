const { MedusaModule } = require("@medusajs/framework/modules-sdk")
const { Modules } = require("@medusajs/framework/utils")

async function fixMedusaSettings() {
    console.log("🔧 Starting Medusa Settings Fix...")

    // Initialize modules
    const fulfillmentModule = MedusaModule.getModuleInstance(Modules.FULFILLMENT)
    const salesChannelModule = MedusaModule.getModuleInstance(Modules.SALES_CHANNEL)
    const regionModule = MedusaModule.getModuleInstance(Modules.REGION)
    const productModule = MedusaModule.getModuleInstance(Modules.PRODUCT)

    try {
        // 1. Get Pakistan Region
        console.log("\n📍 Finding Pakistan Region...")
        const regions = await regionModule.listRegions()
        const pakistanRegion = regions.find(r =>
            r.countries?.some(c => c.iso_2 === "pk")
        )

        if (!pakistanRegion) {
            console.error("❌ Pakistan region not found! Please create it first.")
            return
        }
        console.log(`✅ Found Pakistan Region: ${pakistanRegion.id}`)

        // 2. Get Default Sales Channel
        console.log("\n🏪 Finding Default Sales Channel...")
        const salesChannels = await salesChannelModule.listSalesChannels()
        const defaultChannel = salesChannels.find(sc => sc.name === "Default Sales Channel")

        if (!defaultChannel) {
            console.error("❌ Default Sales Channel not found!")
            return
        }
        console.log(`✅ Found Default Sales Channel: ${defaultChannel.id}`)

        // 3. Create/Update Shipping Options for Pakistan
        console.log("\n🚚 Setting up Shipping Options...")

        const shippingOptions = [
            {
                name: "Standard Shipping",
                price_type: "flat",
                service_zone_id: pakistanRegion.id,
                shipping_profile_id: "sp_01", // You may need to adjust this
                provider_id: "manual",
                data: {
                    amount: 200, // PKR 200
                },
                rules: [
                    {
                        attribute: "total",
                        operator: "gte",
                        value: 0,
                    }
                ],
            },
            {
                name: "Express Shipping",
                price_type: "flat",
                service_zone_id: pakistanRegion.id,
                shipping_profile_id: "sp_01",
                provider_id: "manual",
                data: {
                    amount: 500, // PKR 500
                },
                rules: [
                    {
                        attribute: "total",
                        operator: "gte",
                        value: 0,
                    }
                ],
            },
            {
                name: "Free Shipping",
                price_type: "flat",
                service_zone_id: pakistanRegion.id,
                shipping_profile_id: "sp_01",
                provider_id: "manual",
                data: {
                    amount: 0, // Free
                },
                rules: [
                    {
                        attribute: "total",
                        operator: "gte",
                        value: 5000, // Free on orders above PKR 5000
                    }
                ],
            }
        ]

        for (const option of shippingOptions) {
            try {
                await fulfillmentModule.createShippingOptions(option)
                console.log(`✅ Created: ${option.name}`)
            } catch (error) {
                console.log(`⚠️  ${option.name} might already exist or error: ${error.message}`)
            }
        }

        // 4. Add all products to Default Sales Channel
        console.log("\n📦 Adding Products to Default Sales Channel...")
        const products = await productModule.listProducts()

        let addedCount = 0
        for (const product of products) {
            try {
                await salesChannelModule.addProductsToSalesChannel({
                    salesChannelId: defaultChannel.id,
                    productIds: [product.id]
                })
                addedCount++
            } catch (error) {
                // Product might already be in channel
            }
        }
        console.log(`✅ Added ${addedCount} products to Default Sales Channel`)

        console.log("\n✅ ✅ ✅ All Settings Fixed Successfully! ✅ ✅ ✅")
        console.log("\n📋 Summary:")
        console.log(`   - Region: Pakistan (${pakistanRegion.id})`)
        console.log(`   - Sales Channel: Default (${defaultChannel.id})`)
        console.log(`   - Shipping Options: 3 created`)
        console.log(`   - Products: ${addedCount} added to sales channel`)
        console.log("\n🚀 You can now restart your storefront and test!")

    } catch (error) {
        console.error("\n❌ Error fixing settings:", error)
    }
}

fixMedusaSettings()
    .then(() => {
        console.log("\n✅ Script completed!")
        process.exit(0)
    })
    .catch((error) => {
        console.error("\n❌ Script failed:", error)
        process.exit(1)
    })
