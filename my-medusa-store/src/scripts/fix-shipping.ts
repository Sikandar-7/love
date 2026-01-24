/**
 * Fix Shipping Options for Pakistan
 * This script checks and adds shipping options if they don't exist
 */

import { ExecArgs } from "@medusajs/framework/types";
import {
    ContainerRegistrationKeys,
    Modules,
} from "@medusajs/framework/utils";
import {
    createShippingOptionsWorkflow,
    createShippingProfilesWorkflow,
    createStockLocationsWorkflow,
    linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows";

export default async function fixShippingOptions({ container }: ExecArgs) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
    const link = container.resolve(ContainerRegistrationKeys.LINK);
    const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
    const regionModuleService = container.resolve(Modules.REGION);
    const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
    const storeModuleService = container.resolve(Modules.STORE);

    logger.info("🔧 Fixing shipping options for Pakistan...");

    try {
        // Get Pakistan region
        const regions = await regionModuleService.listRegions({ name: "pk" });
        if (!regions.length) {
            logger.error("❌ Pakistan region not found! Please run seed first.");
            return;
        }
        const region = regions[0];
        logger.info(`✓ Found Pakistan region: ${region.id}`);

        // Get or create shipping profile
        let shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
            type: "default",
        });
        let shippingProfile = shippingProfiles.length ? shippingProfiles[0] : null;

        if (!shippingProfile) {
            logger.info("Creating default shipping profile...");
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
            logger.info("✓ Shipping profile created");
        } else {
            logger.info(`✓ Using existing shipping profile: ${shippingProfile.id}`);
        }

        // Get or create stock location
        const stockLocationModule = container.resolve(Modules.STOCK_LOCATION);
        let stockLocations = await stockLocationModule.listStockLocations({});
        let stockLocation = stockLocations.length ? stockLocations[0] : null;

        if (!stockLocation) {
            logger.info("Creating stock location...");
            const { result: stockLocationResult } =
                await createStockLocationsWorkflow(container).run({
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
            stockLocation = stockLocationResult[0];
            logger.info("✓ Stock location created");
        } else {
            logger.info(`✓ Using existing stock location: ${stockLocation.id}`);
        }

        // Link stock location to fulfillment provider
        await link.create({
            [Modules.STOCK_LOCATION]: {
                stock_location_id: stockLocation.id,
            },
            [Modules.FULFILLMENT]: {
                fulfillment_provider_id: "manual_manual",
            },
        });

        // Get or create fulfillment set
        const fulfillmentSets = await fulfillmentModuleService.listFulfillmentSets({}, {
            relations: ["service_zones", "service_zones.geo_zones"],
        });
        let fulfillmentSet;

        if (!fulfillmentSets.length) {
            logger.info("Creating fulfillment set...");
            fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
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
            logger.info("✓ Fulfillment set created");
        } else {
            fulfillmentSet = fulfillmentSets[0];
            logger.info(`✓ Using existing fulfillment set: ${fulfillmentSet.id}`);
        }

        // Check if service_zones exist
        if (!fulfillmentSet.service_zones || !fulfillmentSet.service_zones.length) {
            logger.error("❌ No service zones found in fulfillment set!");
            logger.info("Please check your Medusa admin panel and configure service zones.");
            return;
        }

        // Check existing shipping options
        // @ts-ignore
        const existingOptions = await fulfillmentModuleService.listShippingOptions({
            service_zone_id: [fulfillmentSet.service_zones[0].id],
        });

        if (existingOptions.length > 0) {
            logger.info(`✓ Found ${existingOptions.length} existing shipping options`);
            existingOptions.forEach((opt: any) => {
                logger.info(`  - ${opt.name}`);
            });
        } else {
            logger.info("Creating shipping options...");

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
            logger.info("✅ Shipping options created!");
        }

        // Link sales channel to stock location
        const defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
            name: "Default Sales Channel",
        });

        if (defaultSalesChannel.length) {
            await linkSalesChannelsToStockLocationWorkflow(container).run({
                input: {
                    id: stockLocation.id,
                    add: [defaultSalesChannel[0].id],
                },
            });
            logger.info("✓ Sales channel linked to stock location");
        }

        logger.info("");
        logger.info("🎉 Shipping setup complete!");
        logger.info("");
        logger.info("✅ Your checkout should now work properly!");
        logger.info("   The 'Continue to payment' button should be enabled.");

    } catch (error) {
        logger.error("❌ Error fixing shipping options:", error);
        throw error;
    }
}
