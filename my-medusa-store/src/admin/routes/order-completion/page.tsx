/**
 * Order Completion Dashboard
 * 
 * A dedicated page for managing order completion.
 * Lists all active orders and allows one-click completion.
 */

import { defineRouteConfig } from "@medusajs/admin-sdk";
import {
    Container,
    Heading,
    Table,
    Button,
    StatusBadge,
    toast,
    Text
} from "@medusajs/ui";
import { CheckCircle } from "@medusajs/icons";
import { useState, useEffect, useCallback } from "react";

const OrderCompletionPage = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchOrders = useCallback(async () => {
        try {
            // Fetch orders (limited to 50, basic expansion)
            // Note: We are filtering status client-side to be safe with query params
            const response = await fetch(
                `/admin/orders?limit=50&offset=0&expand=fulfillments,payments,shipping_address`,
                {
                    headers: {
                        "Content-Type": "application/json",
                    }
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("Fetch error:", errorData);
                throw new Error(`Fetch failed: ${response.status}`);
            }

            const data = await response.json();

            // Filter pending orders (not completed or canceled)
            const allOrders = data.orders || [];
            const pendingOrders = allOrders.filter((o: any) =>
                o.status !== "completed" && o.status !== "canceled" && o.status !== "archived"
            );

            setOrders(pendingOrders);
        } catch (error) {
            console.error("Error fetching orders:", error);
            toast.error("Error", {
                description: "Failed to load orders. Please refresh."
            });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleCompleteOrder = async (orderId: string) => {
        setProcessingId(orderId);
        try {
            const response = await fetch(`/admin/orders/${orderId}/complete`, {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            });

            if (!response.ok) throw new Error("Failed to complete order");

            toast.success("Order Completed", {
                description: `Order #${orderId.slice(-4)} has been marked as completed`
            });
            fetchOrders();
        } catch (error) {
            toast.error("Error", {
                description: "Could not complete order. Please try again."
            });
        } finally {
            setProcessingId(null);
        }
    };

    const isOrderReady = (order: any) => {
        const isPaid = order.payment_status === "captured";
        const isDelivered = order.fulfillments?.some((f: any) => f.delivered_at || f.shipped_at);
        // Also check metadata if manual override used
        const isMetaDelivered = order.metadata?.delivered === true;

        return isPaid && (isDelivered || isMetaDelivered);
    };

    return (
        <Container className="p-0 overflow-hidden">
            <div className="p-6 border-b border-ui-border-base flex justify-between items-center">
                <div>
                    <Heading level="h1">Order Completion</Heading>
                    <Text className="text-ui-fg-subtle mt-1">
                        Manage and complete delivered orders. Only fully paid and delivered orders can be completed.
                    </Text>
                </div>
                <Button variant="secondary" onClick={fetchOrders} size="small">
                    Refresh List
                </Button>
            </div>

            {/* Debug Info Section */}
            <div className="p-4 bg-ui-bg-subtle border-b border-ui-border-base text-xs font-mono">
                <p><strong>Debug Info:</strong></p>
                <p>Loading: {isLoading ? "Yes" : "No"}</p>
                <p>Orders Found: {orders.length}</p>
                <p>Fetch Url: /admin/orders?limit=50&offset=0&expand=fulfillments,payments,shipping_address</p>
            </div>

            <Table>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Order</Table.HeaderCell>
                        <Table.HeaderCell>Date</Table.HeaderCell>
                        <Table.HeaderCell>Customer</Table.HeaderCell>
                        <Table.HeaderCell>Payment</Table.HeaderCell>
                        <Table.HeaderCell>Fulfillment</Table.HeaderCell>
                        <Table.HeaderCell>Action</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {isLoading ? (
                        <Table.Row>
                            <Table.Cell className="text-center py-8">
                                Loading orders...
                            </Table.Cell>
                        </Table.Row>
                    ) : orders && orders.length > 0 ? (
                        orders.map((order) => {
                            const ready = isOrderReady(order);
                            const isProcessing = processingId === order.id;

                            return (
                                <Table.Row key={order.id}>
                                    <Table.Cell>#{order.display_id}</Table.Cell>
                                    <Table.Cell>{new Date(order.created_at).toLocaleDateString()}</Table.Cell>
                                    <Table.Cell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{order.shipping_address?.first_name} {order.shipping_address?.last_name}</span>
                                            <span className="text-ui-fg-subtle text-xs">{order.email}</span>
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <StatusBadge color={order.payment_status === "captured" ? "green" : "orange"}>
                                            {order.payment_status}
                                        </StatusBadge>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <StatusBadge color={order.fulfillment_status === "shipped" ? "green" : "blue"}>
                                            {order.fulfillment_status}
                                        </StatusBadge>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Button
                                            variant={ready ? "primary" : "secondary"}
                                            size="small"
                                            disabled={!ready || isProcessing}
                                            onClick={() => handleCompleteOrder(order.id)}
                                        >
                                            {isProcessing ? "Processing..." : ready ? "Complete Order" : "Waiting for Steps"}
                                        </Button>
                                    </Table.Cell>
                                </Table.Row>
                            );
                        })
                    ) : (
                        <Table.Row>
                            <Table.Cell className="text-center py-8 text-ui-fg-subtle">
                                No pending orders found (Client Filtered).
                                Check debug info above.
                            </Table.Cell>
                        </Table.Row>
                    )}
                </Table.Body>
            </Table>
        </Container>
    );
};

export const config = defineRouteConfig({
    label: "Order Completion",
    icon: CheckCircle,
});

export default OrderCompletionPage;
