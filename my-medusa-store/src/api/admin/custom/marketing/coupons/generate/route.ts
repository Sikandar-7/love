import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const campaignId = req.query.campaign_id as string

    // Generate a random coupon code
    const generateCode = () => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
      let code = ""
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return code
    }

    const code = generateCode()

    // In production, save coupon code to database linked to campaign
    // For now, return the generated code

    res.json({
      code,
      campaign_id: campaignId,
      message: "Coupon code generated successfully",
    })
  } catch (error) {
    console.error("Coupon generation error:", error)
    res.status(500).json({
      message: "Failed to generate coupon code",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
