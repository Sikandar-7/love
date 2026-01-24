/**
 * Pakistan-specific seed file
 * 
 * Note: This file has been deprecated in favor of seed-complete.ts
 * Please use: yarn seed:complete
 * 
 * This file is kept for reference only.
 */

import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export default async function seedPakistanData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);

  logger.warn("⚠️  This seed file is deprecated!");
  logger.info("Please use the complete seed file instead:");
  logger.info("  yarn seed:complete");
  logger.info("");
  logger.info("The complete seed file includes:");
  logger.info("  ✓ Pakistan region with PKR currency");
  logger.info("  ✓ Shipping options (Standard, Express, Free)");
  logger.info("  ✓ Product categories");
  logger.info("  ✓ Sample products");
  logger.info("  ✓ Stock locations");
  logger.info("  ✓ API keys");
}
