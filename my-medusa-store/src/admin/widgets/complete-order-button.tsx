/**
 * Complete Order Button Widget
 * 
 * Adds a "Complete Order" button to the order detail page
 * Only shows when order is delivered but not completed
 */

import { Container, Button, toast } from "@medusajs/ui";
import { useEffect, useState } from "react";

const CompleteOrderWidget = ({ data }: { data: any }) => {
    const [loading, setLoading] = useState(false);
    const [isDelivered, setIsDelivered] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);

    useEffect(() => {
        // Check if order is delivered
        const hasDeliveredFulfillment = data?.fulfillments?.some(
            (f: any) => f.delivered_at || f.shipped_at
        );
        setIsDelivered(hasDeliveredFulfillment);

        // Check if order is already completed
        setIsCompleted(data?.status === "completed");
    }, [data]);

    const handleCompleteOrder = async () => {
        setLoading(true);

        try {
            const response = await fetch(`/admin/orders/${data.id}/complete`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to complete order");
            }

            toast.success("Order Completed", {
                description: "Order has been marked as completed successfully!",
            });

            // Reload page to show updated status
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error: any) {
            toast.error("Error", {
                description: error.message || "Failed to complete order",
            });
        } finally {
            setLoading(false);
        }
    };

    // Debug info
    console.log("Widget Data:", { isDelivered, isCompleted, fulfillments: data?.fulfillments });

    return (
        <Container className="mb-4 p-4 bg-ui-bg-subtle rounded-lg border border-ui-border-base">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-ui-fg-base font-medium mb-1">
                        Complete Order (Debug Mode)
                    </h3>
                    <p className="text-ui-fg-subtle text-sm">
                        Status: {data?.status} | Delivered: {isDelivered ? "Yes" : "No"} | Completed: {isCompleted ? "Yes" : "No"}
                    </p>
                </div>
                <Button
                    onClick={handleCompleteOrder}
                    disabled={loading || isCompleted}
                    variant="primary"
                    size="base"
                >
                    {loading ? "Completing..." : isCompleted ? "Completed" : "Complete Order"}
                </Button>
            </div>
        </Container>
    );
};

export default CompleteOrderWidget;

export const config = {
    zone: "order.details.before",
};
