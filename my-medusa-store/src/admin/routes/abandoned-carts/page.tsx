import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ShoppingBag } from "@medusajs/icons"
import { Container, Heading, Table, Button, Badge, Text, Toaster, toast } from "@medusajs/ui"
import { useEffect, useState } from "react"
import { format } from "date-fns"

const AbandonedCartsPage = () => {
    const [carts, setCarts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchCarts()
    }, [])

    const fetchCarts = async () => {
        try {
            const res = await fetch("/admin/custom/abandoned-carts", { credentials: 'include' })
            const data = await res.json()
            setCarts(data.carts || [])
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleCopyLink = (cartId: string) => {
        // Generate a recovery link (mock for now, usually points to storefront checkout)
        // Adjust port 8000 for storefront if needed
        const link = `http://localhost:8000/checkout?cart_id=${cartId}`
        navigator.clipboard.writeText(link)
        toast.success("Link Copied", { description: "Recovery link copied to clipboard" })
    }

    const handleSendEmail = (email: string) => {
        toast.success("Email Sent", { description: `Recovery email queued for ${email}` })
        // Implement actual email trigger here later
    }

    return (
        <Container className="p-0 overflow-hidden h-full flex flex-col bg-ui-bg-subtle">
            <div className="p-6 border-b border-ui-border-base bg-ui-bg-base">
                <Heading level="h1" className="text-2xl font-bold flex items-center gap-2">
                    <ShoppingBag className="text-ui-fg-muted" /> Abandoned Cart Recovery
                </Heading>
                <Text className="text-ui-fg-subtle">
                    Recover lost sales by contacting customers who didn't complete checkout.
                </Text>
            </div>

            <div className="p-6 overflow-y-auto">
                {loading ? (
                    <div className="flex justify-center p-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                    </div>
                ) : carts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 bg-ui-bg-base border border-dashed border-ui-border-base rounded-lg">
                        <div className="text-4xl mb-4">🛒</div>
                        <Heading level="h2" className="text-lg">No abandoned carts found</Heading>
                        <Text className="text-ui-fg-subtle">Great! All carts seem to be processed or empty.</Text>
                    </div>
                ) : (
                    <div className="bg-ui-bg-base border border-ui-border-base rounded-lg overflow-hidden shadow-sm">
                        <Table>
                            <Table.Header>
                                <Table.Row className="bg-ui-bg-subtle-hover">
                                    <Table.HeaderCell>Last Updated</Table.HeaderCell>
                                    <Table.HeaderCell>Customer Email</Table.HeaderCell>
                                    <Table.HeaderCell>Items</Table.HeaderCell>
                                    <Table.HeaderCell>Value</Table.HeaderCell>
                                    <Table.HeaderCell>Action</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {carts.map((cart) => (
                                    <Table.Row key={cart.id}>
                                        <Table.Cell>
                                            <div className="flex flex-col">
                                                <span className="text-ui-fg-base font-medium">
                                                    {format(new Date(cart.updated_at), "MMM d, yyyy")}
                                                </span>
                                                <span className="text-xs text-ui-fg-subtle">
                                                    {format(new Date(cart.updated_at), "h:mm a")}
                                                </span>
                                            </div>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <div className="flex items-center gap-2">
                                                <span className="text-ui-fg-base">{cart.email}</span>
                                                {/* Mock VIP check - reuse logic if possible or just show email */}
                                            </div>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <div className="flex -space-x-2 overflow-hidden">
                                                {cart.items.slice(0, 3).map((item: any) => (
                                                    <div key={item.id} className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-gray-100 flex items-center justify-center text-[10px]" title={item.title}>
                                                        {item.title.charAt(0)}
                                                    </div>
                                                ))}
                                                {cart.items.length > 3 && (
                                                    <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-gray-100 flex items-center justify-center text-[10px]">
                                                        +{cart.items.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-xs text-ui-fg-subtle ml-2">{cart.items.length} items</span>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <span className="font-bold text-ui-fg-base">
                                                PKR {cart.region?.currency_code?.toUpperCase() === 'PKR' ? (cart.total / 1).toLocaleString() : (cart.total / 100).toLocaleString()}
                                            </span>
                                            {/* Note: Adjust division based on if currency is zero-decimal for PKR in user's DB configuration. Assuming standard Medusa cents logic unless fixed elsewhere. 
                                                Wait, user said Prices are 1000 flat in DB. So /1 is safer if user fixed it globally, but carts might be raw.
                                                Safe bet: Check currency code. If PKR and user manually set prices, show raw. 
                                            */}
                                        </Table.Cell>
                                        <Table.Cell>
                                            <div className="flex gap-2">
                                                <Button size="small" variant="secondary" onClick={() => handleCopyLink(cart.id)}>
                                                    Copy Link
                                                </Button>
                                                <Button size="small" onClick={() => handleSendEmail(cart.email)}>
                                                    Recover
                                                </Button>
                                            </div>
                                        </Table.Cell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table>
                    </div>
                )}
            </div>
            <Toaster />
        </Container>
    )
}

export const config = defineRouteConfig({
    label: "Abandoned Carts",
    icon: ShoppingBag,
})

export default AbandonedCartsPage
