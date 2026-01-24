/**
 * Complete Order API Route
 * 
 * POST /admin/orders/:id/complete
 * 
 * Marks an order as completed after delivery
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { completeOrderWorkflow } from "../../../../../workflows/complete-order";

export async function POST(
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> {
    const orderId = req.params.id;

    try {
        // Get order to validate it exists
        const orderModule = req.scope.resolve("order");
        const order = await orderModule.retrieveOrder(orderId);

        if (!order) {
            res.status(404).json({
                message: "Order not found",
            });
            return;
        }

        // Check if order metadata indicates it's delivered
        // In Medusa v2, we rely on metadata or manual confirmation
        const isDelivered = order.metadata?.delivered === true;

        // For now, allow completing any order
        // You can add custom validation here if needed

        // Run the complete order workflow
        const { result } = await completeOrderWorkflow(req.scope).run({
            input: {
                order_id: orderId,
            },
        });

        res.status(200).json({
            message: "Order completed successfully",
            order: result,
        });
    } catch (error: any) {
        res.status(500).json({
            message: "Failed to complete order",
            error: error.message,
        });
    }
}
