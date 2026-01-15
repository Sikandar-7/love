import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

// GET /store/reviews/:productId - Get reviews for a product
export async function GET(
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> {
    const productId = req.params.productId
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

    try {
        // In a real implementation, you would query a reviews table
        // For now, returning mock data
        const reviews = {
            product_id: productId,
            reviews: [
                {
                    id: "rev_1",
                    customer_name: "Ahmed Khan",
                    rating: 5,
                    title: "Excellent Product!",
                    comment: "Amazing quality and fast delivery. Highly recommended!",
                    created_at: new Date().toISOString(),
                    verified_purchase: true
                },
                {
                    id: "rev_2",
                    customer_name: "Fatima Ali",
                    rating: 4,
                    title: "Good value for money",
                    comment: "Product is good but delivery took a bit longer than expected.",
                    created_at: new Date().toISOString(),
                    verified_purchase: true
                }
            ],
            average_rating: 4.5,
            total_reviews: 2
        }

        res.json({ reviews })
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch reviews" })
    }
}

// POST /store/reviews - Submit a new review
export async function POST(
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> {
    const { product_id, rating, title, comment, customer_id } = req.body

    try {
        // Validate input
        if (!product_id || !rating || !comment) {
            res.status(400).json({ error: "Missing required fields" })
            return
        }

        if (rating < 1 || rating > 5) {
            res.status(400).json({ error: "Rating must be between 1 and 5" })
            return
        }

        // In a real implementation, you would save to database
        const newReview = {
            id: `rev_${Date.now()}`,
            product_id,
            customer_id,
            rating,
            title,
            comment,
            created_at: new Date().toISOString(),
            verified_purchase: false
        }

        res.status(201).json({
            message: "Review submitted successfully",
            review: newReview
        })
    } catch (error) {
        res.status(500).json({ error: "Failed to submit review" })
    }
}
