import { useState } from "react"
import { Text } from "@medusajs/ui"

interface HelpTooltipProps {
  content: string
  className?: string
}

export const HelpTooltip = ({ content, className = "" }: HelpTooltipProps) => {
  const [show, setShow] = useState(false)

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="text-ui-fg-subtle hover:text-ui-fg-base transition-colors"
        aria-label="Help"
      >
        <span className="text-lg">ℹ️</span>
      </button>
      {show && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-ui-bg-base border border-ui-border-base rounded-lg shadow-lg">
          <Text className="text-sm">{content}</Text>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="w-2 h-2 bg-ui-bg-base border-r border-b border-ui-border-base transform rotate-45"></div>
          </div>
        </div>
      )}
    </div>
  )
}
