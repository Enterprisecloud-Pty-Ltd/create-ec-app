"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@/lib/utils"
import { useEcPortalContainer } from "@/runtime/EcAppShell"

function Popover({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  const portalContainer = useEcPortalContainer()

  return (
    <PopoverPrimitive.Portal container={portalContainer ?? undefined}>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "ec:bg-popover ec:text-popover-foreground ec:data-[state=open]:animate-in ec:data-[state=closed]:animate-out ec:data-[state=closed]:fade-out-0 ec:data-[state=open]:fade-in-0 ec:data-[state=closed]:zoom-out-95 ec:data-[state=open]:zoom-in-95 ec:data-[side=bottom]:slide-in-from-top-2 ec:data-[side=left]:slide-in-from-right-2 ec:data-[side=right]:slide-in-from-left-2 ec:data-[side=top]:slide-in-from-bottom-2 ec:z-50 ec:w-72 ec:origin-(--radix-popover-content-transform-origin) ec:rounded-md ec:border ec:p-4 ec:shadow-md ec:outline-hidden",
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
}

function PopoverAnchor({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }
