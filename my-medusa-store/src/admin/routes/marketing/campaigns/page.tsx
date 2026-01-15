import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Container,
  Heading,
  Text,
  Button,
  Input,
  Badge,
  Select,
} from "@medusajs/ui"
import { useState, useEffect } from "react"

interface Campaign {
  id: string
  name: string
  type: string
  status: string
  discount: number
  startDate: string
  endDate: string
  usageCount: number
}

const MarketingCampaignsPage = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    type: "percentage",
    discount: "",
    startDate: "",
    endDate: "",
  })

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    try {
      setLoading(true)
      const response = await fetch("/admin/custom/marketing/campaigns")
      if (!response.ok) throw new Error("Failed to fetch campaigns")
      const result = await response.json()
      setCampaigns(result.campaigns || [])
    } catch (error) {
      console.error("Error fetching campaigns:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCampaign = async () => {
    try {
      const response = await fetch("/admin/custom/marketing/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCampaign),
      })

      if (!response.ok) throw new Error("Failed to create campaign")
      setShowCreate(false)
      setNewCampaign({
        name: "",
        type: "percentage",
        discount: "",
        startDate: "",
        endDate: "",
      })
      fetchCampaigns()
    } catch (error) {
      console.error("Error creating campaign:", error)
      alert("Failed to create campaign")
    }
  }

  const generateCouponCode = async (campaignId: string) => {
    try {
      const response = await fetch(
        `/admin/custom/marketing/coupons/generate?campaign_id=${campaignId}`,
        { method: "POST" }
      )
      if (!response.ok) throw new Error("Failed to generate coupon")
      const result = await response.json()
      alert(`Coupon code generated: ${result.code}`)
    } catch (error) {
      console.error("Error generating coupon:", error)
      alert("Failed to generate coupon code")
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-ui-tag-green-bg text-ui-tag-green-text",
      scheduled: "bg-ui-tag-blue-bg text-ui-tag-blue-text",
      expired: "bg-ui-tag-grey-bg text-ui-tag-grey-text",
      paused: "bg-ui-tag-orange-bg text-ui-tag-orange-text",
    }
    return colors[status] || "bg-ui-tag-grey-bg text-ui-tag-grey-text"
  }

  if (loading) {
    return (
      <Container className="p-6">
        <Text>Loading campaigns...</Text>
      </Container>
    )
  }

  return (
    <Container className="p-6">
      <div className="flex items-center justify-between mb-6">
        <Heading level="h1">Marketing Campaigns</Heading>
        <Button onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? "Cancel" : "Create Campaign"}
        </Button>
      </div>

      {showCreate && (
        <div className="bg-ui-bg-subtle p-4 rounded-lg mb-6">
          <Heading level="h2" className="mb-4">
            Create New Campaign
          </Heading>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Text className="text-sm text-ui-fg-subtle mb-2">Campaign Name</Text>
              <Input
                value={newCampaign.name}
                onChange={(e) =>
                  setNewCampaign({ ...newCampaign, name: e.target.value })
                }
                placeholder="Summer Sale 2024"
              />
            </div>
            <div>
              <Text className="text-sm text-ui-fg-subtle mb-2">Discount Type</Text>
              <Select
                value={newCampaign.type}
                onValueChange={(value) =>
                  setNewCampaign({ ...newCampaign, type: value })
                }
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </Select>
            </div>
            <div>
              <Text className="text-sm text-ui-fg-subtle mb-2">
                Discount {newCampaign.type === "percentage" ? "(%)" : "(PKR)"}
              </Text>
              <Input
                type="number"
                value={newCampaign.discount}
                onChange={(e) =>
                  setNewCampaign({ ...newCampaign, discount: e.target.value })
                }
                placeholder="10"
              />
            </div>
            <div>
              <Text className="text-sm text-ui-fg-subtle mb-2">Start Date</Text>
              <Input
                type="date"
                value={newCampaign.startDate}
                onChange={(e) =>
                  setNewCampaign({ ...newCampaign, startDate: e.target.value })
                }
              />
            </div>
            <div>
              <Text className="text-sm text-ui-fg-subtle mb-2">End Date</Text>
              <Input
                type="date"
                value={newCampaign.endDate}
                onChange={(e) =>
                  setNewCampaign({ ...newCampaign, endDate: e.target.value })
                }
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleCreateCampaign} className="w-full">
                Create Campaign
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="border border-ui-border-base rounded-lg overflow-hidden">
        <div className="bg-ui-bg-subtle px-4 py-3 border-b border-ui-border-base">
          <Text className="font-medium">Active Campaigns</Text>
        </div>
        <div className="divide-y divide-ui-border-base">
          {campaigns.length === 0 ? (
            <div className="p-8 text-center">
              <Text className="text-ui-fg-subtle">No campaigns found</Text>
            </div>
          ) : (
            campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-ui-bg-subtle-hover"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Text className="font-medium">{campaign.name}</Text>
                    <Badge size="2xsmall" className={getStatusColor(campaign.status)}>
                      {campaign.status}
                    </Badge>
                  </div>
                  <Text className="text-sm text-ui-fg-subtle">
                    {campaign.type === "percentage"
                      ? `${campaign.discount}% off`
                      : `PKR ${campaign.discount} off`}{" "}
                    • Used {campaign.usageCount} times
                  </Text>
                  <Text className="text-xs text-ui-fg-subtle">
                    {new Date(campaign.startDate).toLocaleDateString()} -{" "}
                    {new Date(campaign.endDate).toLocaleDateString()}
                  </Text>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => generateCouponCode(campaign.id)}
                  >
                    Generate Coupon
                  </Button>
                  <Button
                    variant="transparent"
                    size="small"
                    onClick={() =>
                      (window.location.href = `/marketing/campaigns/${campaign.id}`)
                    }
                  >
                    Edit
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Marketing Campaigns",
  icon: null,
})

export default MarketingCampaignsPage
