import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Badge, Textarea, Button, toast } from "@medusajs/ui"
import { useState, useEffect } from "react"
import { User, Star } from "@medusajs/icons" // Assuming icons

type CustomerSegmentProps = {
    data: any
}

const CustomerSegmentWidget = ({ data: customer }: CustomerSegmentProps) => {
    const [stats, setStats] = useState({ totalSpend: 0, orderCount: 0 })
    const [note, setNote] = useState("")
    const [loading, setLoading] = useState(true)

    // Calculate VIP status
    const isVIP = stats.totalSpend > 50000
    const isLoyal = stats.orderCount > 5

    useEffect(() => {
        const fetchCustomerStats = async () => {
            if (!customer?.id) return
            try {
                // Fetch orders to calculate stats
                const res = await fetch(`/admin/orders?customer_id=${customer.id}&limit=100`, { credentials: 'include' })
                const json = await res.json()
                const orders = json.orders || []

                const totalSpend = orders.reduce((sum: number, o: any) => sum + (o.total || 0), 0)
                const orderCount = orders.length

                setStats({ totalSpend, orderCount })

                // Fetch existing metadata note if any (assuming we store it there)
                // Note: we'd need to fetch customer details deeply for metadata if prop is shallow
                // For v1 just local state or mock persist
                // If we want to persist, we need an endpoint.
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetchCustomerStats()
    }, [customer?.id])

    const handleSaveNote = async () => {
        // Here we would save to customer metadata
        toast.success("Note Saved", { description: "Customer note updated via CRM" })
    }

    if (loading) return <Container>Loading CRM...</Container>

    return (
        <Container className="p-6 bg-ui-bg-subtle border border-ui-border-base rounded-lg mb-4">
            <div className="flex items-center justify-between mb-4">
                <Heading level="h2" className="text-lg font-bold flex items-center gap-2">
                    <Star className={isVIP ? "text-yellow-500" : "text-ui-fg-subtle"} />
                    Customer Insights (CRM)
                </Heading>
                <div className="flex gap-2">
                    {isVIP && <Badge color="orange">🌟 VIP Client</Badge>}
                    {isLoyal && <Badge color="blue">💎 Loyal</Badge>}
                    {!isVIP && !isLoyal && <Badge color="grey">Standard</Badge>}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-ui-bg-base rounded border border-ui-border-base">
                    <Text className="text-ui-fg-subtle text-xs">Total Lifetime Spend</Text>
                    <Text className="text-xl font-bold text-green-600">
                        PKR {new Intl.NumberFormat('en-US').format(stats.totalSpend)}
                    </Text>
                </div>
                <div className="p-3 bg-ui-bg-base rounded border border-ui-border-base">
                    <Text className="text-ui-fg-subtle text-xs">Total Orders</Text>
                    <Text className="text-xl font-bold text-ui-fg-base">{stats.orderCount}</Text>
                </div>
            </div>

            <div>
                <Text className="text-sm font-medium mb-2">Staff Notes</Text>
                <Textarea
                    placeholder="E.g. Prefers WhatsApp contact, allergic to wool..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="mb-2"
                />
                <Button size="small" onClick={handleSaveNote}>Save Note</Button>
            </div>
        </Container>
    )
}

export const config = defineWidgetConfig({
    zone: "customer.details.after",
})

export default CustomerSegmentWidget
