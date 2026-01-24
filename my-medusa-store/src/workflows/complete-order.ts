/**
 * Complete Order Workflow
 * 
 * This workflow marks an order as completed after delivery
 * Usage: One-click order completion from admin panel
 */

import {
    createWorkflow,
    WorkflowResponse,
    transform,
} from "@medusajs/framework/workflows-sdk";
import { updateOrdersStep } from "@medusajs/medusa/core-flows";

interface CompleteOrderInput {
    order_id: string;
}

export const completeOrderWorkflow = createWorkflow(
    "admin-complete-order",
    (input: CompleteOrderInput) => {
        // Transform input to update order metadata
        const updateData = transform({ input }, (data) => {
            return {
                selector: { id: data.input.order_id },
                update: {
                    metadata: {
                        completed_at: new Date().toISOString(),
                        completed_by: "admin",
                        admin_completed: true,
                    },
                },
            };
        });

        // Update order status
        const updatedOrders = updateOrdersStep(updateData);

        return new WorkflowResponse(updatedOrders);
    }
);
