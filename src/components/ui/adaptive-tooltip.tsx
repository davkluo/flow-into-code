"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { useIsMobile } from "@/hooks/useIsMobile"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { TooltipContentProps } from "@radix-ui/react-tooltip"
import type { PopoverContentProps } from "@radix-ui/react-popover"

// Shared context so Trigger and Content know which mode is active
const AdaptiveTooltipContext = React.createContext(false)

function AdaptiveTooltip({
  children,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root> &
  React.ComponentProps<typeof Tooltip>) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <AdaptiveTooltipContext.Provider value={true}>
        <PopoverPrimitive.Root data-slot="adaptive-tooltip" {...props}>
          {children}
        </PopoverPrimitive.Root>
      </AdaptiveTooltipContext.Provider>
    )
  }

  return (
    <AdaptiveTooltipContext.Provider value={false}>
      <Tooltip data-slot="adaptive-tooltip" {...props}>
        {children}
      </Tooltip>
    </AdaptiveTooltipContext.Provider>
  )
}

function AdaptiveTooltipTrigger({
  children,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  const isMobile = React.useContext(AdaptiveTooltipContext)

  if (isMobile) {
    return (
      <PopoverPrimitive.Trigger data-slot="adaptive-tooltip-trigger" {...props}>
        {children}
      </PopoverPrimitive.Trigger>
    )
  }

  return (
    <TooltipTrigger data-slot="adaptive-tooltip-trigger" {...props}>
      {children}
    </TooltipTrigger>
  )
}

function AdaptiveTooltipContent({
  className,
  children,
  // TODO(human): implement the mobile branch styling below
  ...props
}: (TooltipContentProps | PopoverContentProps) & { className?: string }) {
  const isMobile = React.useContext(AdaptiveTooltipContext)

  if (isMobile) {
    const { sideOffset = 0, side, align, ...rest } = props as PopoverContentProps
    return (
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          data-slot="adaptive-tooltip-content"
          sideOffset={sideOffset}
          side={side}
          align={align}
          className={cn(
            "bg-card text-card-foreground border shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-popover-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance outline-hidden",
            className
          )}
          {...rest}
        >
          {children}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    )
  }

  return (
    <TooltipContent className={className} {...(props as TooltipContentProps)}>
      {children}
    </TooltipContent>
  )
}

export { AdaptiveTooltip, AdaptiveTooltipTrigger, AdaptiveTooltipContent }
