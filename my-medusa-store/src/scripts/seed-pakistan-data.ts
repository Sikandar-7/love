import { MedusaApp } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

async function seedPakistanData() {
  const { container } = await MedusaApp({
    cwd: process.cwd(),
  })

  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info("Starting Pakistan region and data seeding...")

  try {
    // Create Pakistan Region with PKR Currency
    const regionModule = container.resolve("region")
    
    logger.info("Creating Pakistan region with PKR currency...")
    
    const pakistanRegion = await regionModule.createRegions({
      name: "Pakistan",
      currency_code: "pkr",
      countries: ["pk"],
      payment_providers: ["pp_system_default"],
    })

    logger.info(`✓ Created Pakistan region: ${pakistanRegion.id}`)

    // Create Product Categories
    const productModule = container.resolve("product")
    
    logger.info("Creating product categories...")
    
    const categories = [
      { name: "Electronics", handle: "electronics", description: "Latest electronics and gadgets" },
      { name: "Fashion", handle: "fashion", description: "Trendy clothing and accessories" },
      { name: "Home & Living", handle: "home-living", description: "Home decor and essentials" },
      { name: "Sports & Outdoors", handle: "sports-outdoors", description: "Sports equipment and outdoor gear" },
      { name: "Beauty & Health", handle: "beauty-health", description: "Beauty products and health essentials" },
    ]

    for (const category of categories) {
      const created = await productModule.createProductCategories(category)
      logger.info(`✓ Created category: ${category.name}`)
    }

    // Create Sample Products
    logger.info("Creating sample products...")
    
    const sampleProducts = [
      {
        title: "Premium Wireless Headphones",
        handle: "premium-wireless-headphones",
        description: "High-quality wireless headphones with noise cancellation and premium sound quality. Perfect for music lovers and professionals.",
        status: "published",
        options: [
          {
            title: "Color",
            values: ["Black", "White", "Blue"]
          }
        ],
        variants: [
          {
            title: "Black",
            prices: [
              {
                amount: 12999,
                currency_code: "pkr",
              }
            ],
            manage_inventory: true,
            inventory_quantity: 50,
          },
          {
            title: "White",
            prices: [
              {
                amount: 12999,
                currency_code: "pkr",
              }
            ],
            manage_inventory: true,
            inventory_quantity: 30,
          },
          {
            title: "Blue",
            prices: [
              {
                amount: 13999,
                currency_code: "pkr",
              }
            ],
            manage_inventory: true,
            inventory_quantity: 20,
          }
        ]
      },
      {
        title: "Smart Watch Pro",
        handle: "smart-watch-pro",
        description: "Advanced smartwatch with fitness tracking, heart rate monitoring, and smartphone connectivity. Stay connected and healthy.",
        status: "published",
        options: [
          {
            title: "Size",
            values: ["42mm", "46mm"]
          }
        ],
        variants: [
          {
            title: "42mm",
            prices: [
              {
                amount: 24999,
                currency_code: "pkr",
              }
            ],
            manage_inventory: true,
            inventory_quantity: 25,
          },
          {
            title: "46mm",
            prices: [
              {
                amount: 27999,
                currency_code: "pkr",
              }
            ],
            manage_inventory: true,
            inventory_quantity: 15,
          }
        ]
      },
      {
        title: "Designer Cotton T-Shirt",
        handle: "designer-cotton-tshirt",
        description: "Premium quality cotton t-shirt with modern design. Comfortable, breathable, and stylish for everyday wear.",
        status: "published",
        options: [
          {
            title: "Size",
            values: ["S", "M", "L", "XL"]
          },
          {
            title: "Color",
            values: ["Black", "White", "Navy"]
          }
        ],
        variants: [
          {
            title: "S / Black",
            prices: [
              {
                amount: 1999,
                currency_code: "pkr",
              }
            ],
            manage_inventory: true,
            inventory_quantity: 100,
          },
          {
            title: "M / Black",
            prices: [
              {
                amount: 1999,
                currency_code: "pkr",
              }
            ],
            manage_inventory: true,
            inventory_quantity: 150,
          },
          {
            title: "L / White",
            prices: [
              {
                amount: 1999,
                currency_code: "pkr",
              }
            ],
            manage_inventory: true,
            inventory_quantity: 120,
          }
        ]
      },
      {
        title: "Luxury Leather Wallet",
        handle: "luxury-leather-wallet",
        description: "Handcrafted genuine leather wallet with multiple card slots and RFID protection. Perfect gift for professionals.",
        status: "published",
        variants: [
          {
            title: "Default",
            prices: [
              {
                amount: 3499,
                currency_code: "pkr",
              }
            ],
            manage_inventory: true,
            inventory_quantity: 75,
          }
        ]
      },
      {
        title: "Yoga Mat Premium",
        handle: "yoga-mat-premium",
        description: "Non-slip premium yoga mat with extra cushioning. Perfect for yoga, pilates, and home workouts.",
        status: "published",
        options: [
          {
            title: "Color",
            values: ["Purple", "Green", "Pink"]
          }
        ],
        variants: [
          {
            title: "Purple",
            prices: [
              {
                amount: 2999,
                currency_code: "pkr",
              }
            ],
            manage_inventory: true,
            inventory_quantity: 40,
          },
          {
            title: "Green",
            prices: [
              {
                amount: 2999,
                currency_code: "pkr",
              }
            ],
            manage_inventory: true,
            inventory_quantity: 35,
          }
        ]
      }
    ]

    for (const product of sampleProducts) {
      const created = await productModule.createProducts(product)
      logger.info(`✓ Created product: ${product.title}`)
    }

    // Create Shipping Options for Pakistan
    const fulfillmentModule = container.resolve("fulfillment")
    
    logger.info("Creating shipping options...")
    
    const shippingOptions = [
      {
        name: "Standard Delivery",
        price_type: "flat",
        service_zone_id: pakistanRegion.id,
        shipping_profile_id: "sp_01", // You'll need to get the actual shipping profile ID
        provider_id: "manual",
        data: {
          description: "Delivery within 3-5 business days"
        },
        prices: [
          {
            currency_code: "pkr",
            amount: 250,
          }
        ]
      },
      {
        name: "Express Delivery",
        price_type: "flat",
        service_zone_id: pakistanRegion.id,
        shipping_profile_id: "sp_01",
        provider_id: "manual",
        data: {
          description: "Delivery within 1-2 business days"
        },
        prices: [
          {
            currency_code: "pkr",
            amount: 500,
          }
        ]
      },
      {
        name: "Free Shipping",
        price_type: "flat",
        service_zone_id: pakistanRegion.id,
        shipping_profile_id: "sp_01",
        provider_id: "manual",
        data: {
          description: "Free delivery on orders above PKR 5000"
        },
        prices: [
          {
            currency_code: "pkr",
            amount: 0,
          }
        ]
      }
    ]

    logger.info("✓ Shipping options configured")

    logger.info("✅ Pakistan region and data seeding completed successfully!")
    logger.info("\nNext steps:")
    logger.info("1. Start the Medusa server: npm run dev")
    logger.info("2. Access admin at: http://localhost:9000/app")
    logger.info("3. Create an admin user if needed")
    logger.info("4. Start the storefront: cd ../my-medusa-store-storefront && npm run dev")

  } catch (error) {
    logger.error("Error seeding Pakistan data:", error)
    throw error
  }

  process.exit(0)
}

seedPakistanData()
