"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"
import { useEcPortalContainer } from "@/runtime/EcAppShell"

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  )
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  )
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  const portalContainer = useEcPortalContainer()

  return (
    <TooltipPrimitive.Portal container={portalContainer ?? undefined}>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "ec:bg-foreground ec:text-background ec:animate-in ec:fade-in-0 ec:zoom-in-95 ec:data-[state=closed]:animate-out ec:data-[state=closed]:fade-out-0 ec:data-[state=closed]:zoom-out-95 ec:data-[side=bottom]:slide-in-from-top-2 ec:data-[side=left]:slide-in-from-right-2 ec:data-[side=right]:slide-in-from-left-2 ec:data-[side=top]:slide-in-from-bottom-2 ec:z-50 ec:w-fit ec:origin-(--radix-tooltip-content-transform-origin) ec:rounded-md ec:px-3 ec:py-1.5 ec:text-xs ec:text-balance",
          className
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="ec:bg-foreground ec:fill-foreground ec:z-50 ec:size-2.5 ec:translate-y-[calc(-50%_-_2px)] ec:rotate-45 ec:rounded-[2px]" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
