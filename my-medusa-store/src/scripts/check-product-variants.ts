const express = require("express");
const Medusa = require("@medusajs/medusa-js");
const loaders = require("@medusajs/medusa/dist/loaders/index").default;

(async () => {
    const { container } = await loaders({
        directory: process.cwd(),
        expressApp: express(),
        isTest: false,
    });

    const productService = container.resolve("productService");
    const productId = "prod_01KFNQ56Q2DPRNAQTPR5VVE917";

    try {
        const product = await productService.retrieve(productId, {
            relations: ["variants"]
        });

        console.log(`Product: ${product.title}`);
        console.log(`Variants Found: ${product.variants.length}`);

        product.variants.forEach(v => {
            console.log(`- ID: ${v.id}, Title: ${v.title}, Cost: ${v.metadata?.cost_price}`);
        });

    } catch (e) {
        console.error("Error fetching product:", e.message);
    }

    process.exit(0);
})();
