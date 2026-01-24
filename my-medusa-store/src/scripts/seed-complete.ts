/**
 * Complete Seed File for Production Deployment
 * 
 * This seed file combines Pakistan-specific setup with shipping configuration
 * Run this after deploying to production to setup everything automatically
 * 
 * Usage: yarn seed:complete
 */

import { ExecArgs } from "@medusajs/framework/types";
import {
    ContainerRegistrationKeys,
    Modules,
    ProductStatus,
} from "@medusajs/framework/utils";
import {
    createWorkflow,
    transform,
    WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import {
    createApiKeysWorkflow,
    createProductCategoriesWorkflow,
    createProductsWorkflow,
    createRegionsWorkflow,
    createSalesChannelsWorkflow,
    createShippingOptionsWorkflow,
    createShippingProfilesWorkflow,
    createStockLocationsWorkflow,
    createTaxRegionsWorkflow,
    linkSalesChannelsToApiKeyWorkflow,
    linkSalesChannelsToStockLocationWorkflow,
    updateStoresStep,
    updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";

const updateStoreCurrencies = createWorkflow(
    "update-store-currencies",
    (input: {
        supported_currencies: { currency_code: string; is_default?: boolean }[];
        store_id: string;
    }) => {
        const normalizedInput = transform({ input }, (data) => {
            return {
                selector: { id: data.input.store_id },
                update: {
                    supported_currencies: data.input.supported_currencies.map(
                        (currency) => {
                            return {
                                currency_code: currency.currency_code,
                                is_default: currency.is_default ?? false,
                            };
                        }
                    ),
                },
            };
        });

        const stores = updateStoresStep(normalizedInput);

        return new WorkflowResponse(stores);
    }
);

export default async function seedCompleteData({ container }: ExecArgs) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
    const link = container.resolve(ContainerRegistrationKeys.LINK);
    const query = container.resolve(ContainerRegistrationKeys.QUERY);
    const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
    const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
    const storeModuleService = container.resolve(Modules.STORE);

    logger.info("🚀 Starting complete store setup for Pakistan...");

    // Get or create default sales channel
    const [store] = await storeModuleService.listStores();
    let defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
        name: "Default Sales Channel",
    });

    if (!defaultSalesChannel.length) {
        logger.info("Creating default sales channel...");
        const { result: salesChannelResult } = await createSalesChannelsWorkflow(
            container
        ).run({
            input: {
                salesChannelsData: [
                    {
                        name: "Default Sales Channel",
                    },
                ],
            },
        });
        defaultSalesChannel = salesChannelResult;
    }

    // Update store currencies to support PKR
    logger.info("Setting up PKR currency...");
    await updateStoreCurrencies(container).run({
        input: {
            store_id: store.id,
            supported_currencies: [
                {
                    currency_code: "pkr",
                    is_default: true,
                },
                {
                    currency_code: "usd",
                },
            ],
        },
    });

    await updateStoresWorkflow(container).run({
        input: {
            selector: { id: store.id },
            update: {
                default_sales_channel_id: defaultSalesChannel[0].id,
            },
        },
    });

    // Create Pakistan region
    logger.info("Creating Pakistan region...");
    const { result: regionResult } = await createRegionsWorkflow(container).run({
        input: {
            regions: [
                {
                    name: "Pakistan",
                    currency_code: "pkr",
                    countries: ["pk"],
                    payment_providers: ["pp_system_default"],
                },
            ],
        },
    });
    const region = regionResult[0];
    logger.info("✅ Pakistan region created");

    // Create tax regions
    logger.info("Setting up tax regions...");
    await createTaxRegionsWorkflow(container).run({
        input: [
            {
                country_code: "pk",
                provider_id: "tp_system",
            },
        ],
    });

    // Create stock location
    logger.info("Creating stock location...");
    const { result: stockLocationResult } = await createStockLocationsWorkflow(
        container
    ).run({
        input: {
            locations: [
                {
                    name: "Pakistan Warehouse",
                    address: {
                        city: "Karachi",
                        country_code: "PK",
                        address_1: "Main Warehouse",
                    },
                },
            ],
        },
    });
    const stockLocation = stockLocationResult[0];

    await updateStoresWorkflow(container).run({
        input: {
            selector: { id: store.id },
            update: {
                default_location_id: stockLocation.id,
            },
        },
    });

    // Link stock location to fulfillment provider
    await link.create({
        [Modules.STOCK_LOCATION]: {
            stock_location_id: stockLocation.id,
        },
        [Modules.FULFILLMENT]: {
            fulfillment_provider_id: "manual_manual",
        },
    });

    // Create shipping profile
    logger.info("Setting up shipping...");
    const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
        type: "default",
    });
    let shippingProfile = shippingProfiles.length ? shippingProfiles[0] : null;

    if (!shippingProfile) {
        const { result: shippingProfileResult } =
            await createShippingProfilesWorkflow(container).run({
                input: {
                    data: [
                        {
                            name: "Default Shipping Profile",
                            type: "default",
                        },
                    ],
                },
            });
        shippingProfile = shippingProfileResult[0];
    }

    // Create fulfillment set
    const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
        name: "Pakistan Delivery",
        type: "shipping",
        service_zones: [
            {
                name: "Pakistan",
                geo_zones: [
                    {
                        country_code: "pk",
                        type: "country",
                    },
                ],
            },
        ],
    });

    await link.create({
        [Modules.STOCK_LOCATION]: {
            stock_location_id: stockLocation.id,
        },
        [Modules.FULFILLMENT]: {
            fulfillment_set_id: fulfillmentSet.id,
        },
    });

    // Create shipping options
    await createShippingOptionsWorkflow(container).run({
        input: [
            {
                name: "Standard Delivery",
                price_type: "flat",
                provider_id: "manual_manual",
                service_zone_id: fulfillmentSet.service_zones[0].id,
                shipping_profile_id: shippingProfile.id,
                type: {
                    label: "Standard",
                    description: "Delivery within 3-5 business days",
                    code: "standard",
                },
                prices: [
                    {
                        currency_code: "pkr",
                        amount: 250,
                    },
                    {
                        region_id: region.id,
                        amount: 250,
                    },
                ],
                rules: [
                    {
                        attribute: "enabled_in_store",
                        value: "true",
                        operator: "eq",
                    },
                    {
                        attribute: "is_return",
                        value: "false",
                        operator: "eq",
                    },
                ],
            },
            {
                name: "Express Delivery",
                price_type: "flat",
                provider_id: "manual_manual",
                service_zone_id: fulfillmentSet.service_zones[0].id,
                shipping_profile_id: shippingProfile.id,
                type: {
                    label: "Express",
                    description: "Delivery within 1-2 business days",
                    code: "express",
                },
                prices: [
                    {
                        currency_code: "pkr",
                        amount: 500,
                    },
                    {
                        region_id: region.id,
                        amount: 500,
                    },
                ],
                rules: [
                    {
                        attribute: "enabled_in_store",
                        value: "true",
                        operator: "eq",
                    },
                    {
                        attribute: "is_return",
                        value: "false",
                        operator: "eq",
                    },
                ],
            },
            {
                name: "Free Shipping",
                price_type: "flat",
                provider_id: "manual_manual",
                service_zone_id: fulfillmentSet.service_zones[0].id,
                shipping_profile_id: shippingProfile.id,
                type: {
                    label: "Free",
                    description: "Free delivery on orders above PKR 5000",
                    code: "free",
                },
                prices: [
                    {
                        currency_code: "pkr",
                        amount: 0,
                    },
                    {
                        region_id: region.id,
                        amount: 0,
                    },
                ],
                rules: [
                    {
                        attribute: "enabled_in_store",
                        value: "true",
                        operator: "eq",
                    },
                    {
                        attribute: "is_return",
                        value: "false",
                        operator: "eq",
                    },
                ],
            },
        ],
    });
    logger.info("✅ Shipping options created");

    // Link sales channel to stock location
    await linkSalesChannelsToStockLocationWorkflow(container).run({
        input: {
            id: stockLocation.id,
            add: [defaultSalesChannel[0].id],
        },
    });

    // Create publishable API key
    logger.info("Creating API key...");
    let publishableApiKey: any = null;
    const { data } = await query.graph({
        entity: "api_key",
        fields: ["id"],
        filters: {
            type: "publishable",
        },
    });

    publishableApiKey = data?.[0];

    if (!publishableApiKey) {
        const {
            result: [publishableApiKeyResult],
        } = await createApiKeysWorkflow(container).run({
            input: {
                api_keys: [
                    {
                        title: "Webshop",
                        type: "publishable",
                        created_by: "",
                    },
                ],
            },
        });

        publishableApiKey = publishableApiKeyResult;
    }

    if (publishableApiKey) {
        await linkSalesChannelsToApiKeyWorkflow(container).run({
            input: {
                id: publishableApiKey.id,
                add: [defaultSalesChannel[0].id],
            },
        });
    }

    // Create product categories
    logger.info("Creating product categories...");
    const { result: categoryResult } = await createProductCategoriesWorkflow(
        container
    ).run({
        input: {
            product_categories: [
                {
                    name: "Electronics",
                    is_active: true,
                },
                {
                    name: "Fashion",
                    is_active: true,
                },
                {
                    name: "Home & Living",
                    is_active: true,
                },
                {
                    name: "Sports & Outdoors",
                    is_active: true,
                },
            ],
        },
    });

    // Create sample products
    logger.info("Creating sample products...");
    await createProductsWorkflow(container).run({
        input: {
            products: [
                {
                    title: "Premium Wireless Headphones",
                    category_ids: [
                        categoryResult.find((cat) => cat.name === "Electronics")!.id,
                    ],
                    description:
                        "High-quality wireless headphones with noise cancellation",
                    handle: "wireless-headphones",
                    weight: 300,
                    status: ProductStatus.PUBLISHED,
                    shipping_profile_id: shippingProfile.id,
                    options: [
                        {
                            title: "Color",
                            values: ["Black", "White"],
                        },
                    ],
                    variants: [
                        {
                            title: "Black",
                            sku: "HEADPHONES-BLACK",
                            options: {
                                Color: "Black",
                            },
                            prices: [
                                {
                                    amount: 12999,
                                    currency_code: "pkr",
                                },
                            ],
                        },
                        {
                            title: "White",
                            sku: "HEADPHONES-WHITE",
                            options: {
                                Color: "White",
                            },
                            prices: [
                                {
                                    amount: 12999,
                                    currency_code: "pkr",
                                },
                            ],
                        },
                    ],
                    sales_channels: [
                        {
                            id: defaultSalesChannel[0].id,
                        },
                    ],
                },
                {
                    title: "Designer Cotton T-Shirt",
                    category_ids: [
                        categoryResult.find((cat) => cat.name === "Fashion")!.id,
                    ],
                    description: "Premium quality cotton t-shirt",
                    handle: "cotton-tshirt",
                    weight: 200,
                    status: ProductStatus.PUBLISHED,
                    shipping_profile_id: shippingProfile.id,
                    options: [
                        {
                            title: "Size",
                            values: ["S", "M", "L", "XL"],
                        },
                    ],
                    variants: [
                        {
                            title: "S",
                            sku: "TSHIRT-S",
                            options: {
                                Size: "S",
                            },
                            prices: [
                                {
                                    amount: 1999,
                                    currency_code: "pkr",
                                },
                            ],
                        },
                        {
                            title: "M",
                            sku: "TSHIRT-M",
                            options: {
                                Size: "M",
                            },
                            prices: [
                                {
                                    amount: 1999,
                                    currency_code: "pkr",
                                },
                            ],
                        },
                        {
                            title: "L",
                            sku: "TSHIRT-L",
                            options: {
                                Size: "L",
                            },
                            prices: [
                                {
                                    amount: 1999,
                                    currency_code: "pkr",
                                },
                            ],
                        },
                    ],
                    sales_channels: [
                        {
                            id: defaultSalesChannel[0].id,
                        },
                    ],
                },
            ],
        },
    });

    logger.info("✅ Products created");
    logger.info("");
    logger.info("🎉 Complete setup finished successfully!");
    logger.info("");
    logger.info("📋 Next Steps:");
    logger.info("1. Create admin user: yarn medusa user -e admin@example.com -p password");
    logger.info("2. Start server: yarn dev");
    logger.info("3. Access admin: http://localhost:9000/app");
    logger.info("");
    logger.info("✅ Your store is ready for Pakistan market with PKR currency!");
}
