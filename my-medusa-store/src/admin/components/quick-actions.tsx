import { Button } from "@medusajs/ui"

export const QuickActions = () => {
  const actions = [
    {
      label: "New Product",
      icon: "➕",
      href: "/products/create",
    },
    {
      label: "New Order",
      icon: "🛒",
      href: "/orders/create",
    },
    {
      label: "Reports",
      icon: "📊",
      href: "/reports/sales",
    },
    {
      label: "Customers",
      icon: "👥",
      href: "/customers",
    },
  ]

  return (
    <div className="flex items-center gap-2 p-2 bg-ui-bg-subtle rounded-lg">
      {actions.map((action) => (
        <Button
          key={action.label}
          variant="transparent"
          size="small"
          onClick={() => (window.location.href = action.href)}
          className="flex items-center gap-2"
        >
          <span>{action.icon}</span>
          <span className="text-sm">{action.label}</span>
        </Button>
      ))}
    </div>
  )
}
