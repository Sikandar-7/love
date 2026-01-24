import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Textarea, Button, toast, Text } from "@medusajs/ui"
import { useState, useEffect } from "react"
import { ChatBubbleLeftRight } from "@medusajs/icons"

type OrderNotesProps = {
    data: any
}

const OrderNotesWidget = ({ data: order }: OrderNotesProps) => {
    const [note, setNote] = useState("")
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (order?.metadata?.notes) {
            setNote(order.metadata.notes as string)
        }
    }, [order])

    const handleSave = async () => {
        setSaving(true)
        try {
            await fetch(`/admin/orders/${order.id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ metadata: { notes: note } })
            })
            toast.success("Note Saved", { description: "Order note updated successfully" })
        } catch (e) {
            toast.error("Error", { description: "Failed to save note" })
        } finally {
            setSaving(false)
        }
    }

    return (
        <Container className="p-4 bg-ui-bg-subtle border border-ui-border-base rounded-lg mb-4">
            <div className="flex items-center gap-2 mb-2">
                <ChatBubbleLeftRight className="text-ui-fg-subtle" />
                <Heading level="h2" className="text-lg font-bold">Internal Notes</Heading>
            </div>
            <Text className="text-xs text-ui-fg-subtle mb-2">
                Staff only. Use this for delivery instructions or customer requests.
            </Text>
            <Textarea
                placeholder="e.g. Customer requested evening delivery..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mb-2 min-h-[100px] bg-yellow-50 text-ui-fg-base border-yellow-200 focus:border-yellow-400"
            />
            <div className="flex justify-end">
                <Button size="small" onClick={handleSave} isLoading={saving}>Save Note</Button>
            </div>
        </Container>
    )
}

export const config = defineWidgetConfig({
    zone: "order.details.before",
})

export default OrderNotesWidget
