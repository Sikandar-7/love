import { MedusaRequest, MedusaResponse } from "@medusajs/medusa"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
    const cartService = req.scope.resolve("cartService")

    // Logic: Get carts with email (so we can contact) but no payment session completed
    // Medusa Carts don't inherently track "abandoned" status easily without plugin
    // But we can look for carts updated > 1 hour ago, with email, and no completed_at

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const carts = await cartService.list(
        {
            updated_at: { gt: yesterday }, // Last 24 hours for now
            completed_at: null,
        },
        {
            relations: ["items", "items.variant", "region"],
            order: { updated_at: "DESC" },
            take: 50
        }
    )

    // Filter for carts that actually have items and email
    // (Medusa list filter for email might be tricky if not strict, so filtering in memory for safety on v1)
    const abandoned = carts.filter(c => c.email && c.items.length > 0)

    res.json({
        carts: abandoned,
        count: abandoned.length
    })
}
