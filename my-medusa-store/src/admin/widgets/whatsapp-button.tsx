import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Button, Tooltip } from "@medusajs/ui"
import { Phone } from "@medusajs/icons"
import { useEffect, useState } from "react"

type WhatsAppWidgetProps = {
    data: any
}

const WhatsAppWidget = ({ data: order }: WhatsAppWidgetProps) => {
    const [phone, setPhone] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const getPhone = async () => {
            // Check if phone exists in prop
            let foundPhone = order?.shipping_address?.phone || order?.billing_address?.phone || order?.customer?.phone

            // If not found, fetch deep order
            if (!foundPhone && order?.id) {
                try {
                    const res = await fetch(`/admin/orders/${order.id}`, { credentials: 'include' })
                    const json = await res.json()
                    const fullOrder = json.order
                    foundPhone = fullOrder?.shipping_address?.phone || fullOrder?.billing_address?.phone || fullOrder?.customer?.phone
                } catch (e) {
                    console.error("Failed to fetch order for WhatsApp", e)
                }
            }

            setPhone(foundPhone)
            setLoading(false)
        }
        getPhone()
    }, [order?.id])

    if (loading) return null

    const handleWhatsApp = () => {
        if (!phone) return

        // Remove non-numeric chars for the link
        const cleanPhone = phone.replace(/[^\d+]/g, "")

        // Basic check for Pakistani numbers format 03... -> 923...
        // If starts with 03, replace 0 with 92
        let formattedPhone = cleanPhone
        if (formattedPhone.startsWith("03")) {
            formattedPhone = "92" + formattedPhone.substring(1)
        }

        const message = `Hello, regarding your order #${order.display_id}...`
        window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank')
    }

    return (
        <Container className="p-0 border border-ui-border-base rounded-lg mb-4 flex items-center justify-between p-4 bg-green-50 border-green-200">
            <div className="flex items-center gap-4">
                <div className="p-2 bg-green-500 rounded text-white">
                    <Phone />
                </div>
                <div>
                    <div className="font-bold text-green-900">Contact Customer</div>
                    {phone ? (
                        <div className="text-xs text-green-700">Via WhatsApp ({phone})</div>
                    ) : (
                        <div className="text-xs text-red-600">No phone number found</div>
                    )}
                </div>
            </div>
            <Button
                variant="secondary"
                className={`border-green-300 ${!phone ? 'opacity-50 cursor-not-allowed' : 'text-green-800 hover:bg-green-100'}`}
                onClick={handleWhatsApp}
                disabled={!phone}
            >
                {phone ? "Open Chat 💬" : "No Phone 🚫"}
            </Button>
        </Container>
    )
}

export const config = defineWidgetConfig({
    zone: "order.details.before",
})

export default WhatsAppWidget
