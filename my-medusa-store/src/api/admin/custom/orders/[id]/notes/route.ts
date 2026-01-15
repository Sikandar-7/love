import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

// In production, store notes in database
// For now, this is a placeholder

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const orderId = req.params.id

    // Mock notes - in production, fetch from database
    const notes = [
      {
        id: "1",
        note: "Customer requested express shipping",
        created_at: new Date().toISOString(),
        created_by: "Admin User",
      },
    ]

    res.json({ notes })
  } catch (error) {
    console.error("Notes error:", error)
    res.status(500).json({
      message: "Failed to fetch notes",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const orderId = req.params.id
    const { note } = req.body

    // In production, save note to database
    const newNote = {
      id: Date.now().toString(),
      note,
      created_at: new Date().toISOString(),
      created_by: "Admin User", // Get from auth context
    }

    res.json({ note: newNote, message: "Note added successfully" })
  } catch (error) {
    console.error("Add note error:", error)
    res.status(500).json({
      message: "Failed to add note",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
