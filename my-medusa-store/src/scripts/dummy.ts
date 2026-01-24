const express = require("express");
const Medusa = require("@medusajs/medusa-js");
const { GracefulShutdownServer } = require("medusa-core-utils");
const loaders = require("@medusajs/medusa/dist/loaders/index").default
const featureFlagsLoader = require("@medusajs/medusa/dist/loaders/feature-flags").default;

async function checkCostPrice() {
    console.log("Starting check...");

    // Simple standalone script setup isn't trivial with Medusa legacy
    // Better to fetch via fetch() in node if server is running, but server was running?
    // User terminal said running.
    // Let's retry curl with credentials or just check logs.
    // Actually, I'll assume metadata isn't saving correctly.

    // Let's look at the Bulk Editor handleSave again.
    // payload.metadata = { cost_price: ... }
    // If I use a fetch script to simulate the update, I can verify.
}
// Changing tactic: Use a script that connects to the running local server
// But curl failed. Maybe port is wrong? URL is http://localhost:9000
// Error was "Unable to connect". 
