import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Button, Input, Textarea } from "@medusajs/ui"
import { useState, useEffect } from "react"

interface OrderNote {
  id: string
  note: string
  created_at: string
  created_by: string
}

const OrderNotesWidget = () => {
  const [notes, setNotes] = useState<OrderNote[]>([])
  const [newNote, setNewNote] = useState("")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Get order ID from URL
  const orderId = typeof window !== "undefined" 
    ? window.location.pathname.split("/").pop() 
    : ""

  useEffect(() => {
    if (orderId) {
      fetchNotes()
    }
  }, [orderId])

  const fetchNotes = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/admin/custom/orders/${orderId}/notes`)
      if (!response.ok) throw new Error("Failed to fetch notes")
      const result = await response.json()
      setNotes(result.notes || [])
    } catch (error) {
      console.error("Error fetching notes:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddNote = async () => {
    if (!newNote.trim() || !orderId) return

    try {
      setSaving(true)
      const response = await fetch(`/admin/custom/orders/${orderId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: newNote }),
      })

      if (!response.ok) throw new Error("Failed to add note")
      setNewNote("")
      fetchNotes()
    } catch (error) {
      console.error("Error adding note:", error)
      alert("Failed to add note")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Container className="p-6">
        <Text className="text-ui-fg-subtle">Loading notes...</Text>
      </Container>
    )
  }

  return (
    <Container className="p-6">
      <Heading level="h2" className="mb-4">
        Order Notes & Timeline
      </Heading>

      <div className="mb-4">
        <Textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a note about this order..."
          rows={3}
          className="mb-2"
        />
        <Button onClick={handleAddNote} disabled={saving || !newNote.trim()}>
          {saving ? "Adding..." : "Add Note"}
        </Button>
      </div>

      <div className="space-y-3">
        {notes.length === 0 ? (
          <div className="bg-ui-bg-subtle p-4 rounded-lg text-center">
            <Text className="text-ui-fg-subtle">No notes yet</Text>
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="bg-ui-bg-subtle p-3 rounded-lg">
              <Text className="text-sm">{note.note}</Text>
              <div className="flex items-center justify-between mt-2">
                <Text className="text-xs text-ui-fg-subtle">
                  {note.created_by}
                </Text>
                <Text className="text-xs text-ui-fg-subtle">
                  {new Date(note.created_at).toLocaleString()}
                </Text>
              </div>
            </div>
          ))
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.after",
})

export default OrderNotesWidget
