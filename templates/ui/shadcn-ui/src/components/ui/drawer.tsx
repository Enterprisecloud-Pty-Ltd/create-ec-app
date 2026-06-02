"use client"

import * as React from "react"
import { Drawer as DrawerPrimitive } from "vaul"

import { cn } from "@/lib/utils"
import { useEcPortalContainer } from "@/runtime/EcAppShell"

function Drawer({
  container,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) {
  const portalContainer = useEcPortalContainer()

  return (
    <DrawerPrimitive.Root
      data-slot="drawer"
      container={container ?? portalContainer ?? undefined}
      {...props}
    />
  )
}

function DrawerTrigger({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />
}

function DrawerPortal({
  container,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
  const portalContainer = useEcPortalContainer()

  return (
    <DrawerPrimitive.Portal
      data-slot="drawer-portal"
      container={container ?? portalContainer ?? undefined}
      {...props}
    />
  )
}

function DrawerClose({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Close>) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />
}

function DrawerOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
  return (
    <DrawerPrimitive.Overlay
      data-slot="drawer-overlay"
      className={cn(
        "ec:data-[state=open]:animate-in ec:data-[state=closed]:animate-out ec:data-[state=closed]:fade-out-0 ec:data-[state=open]:fade-in-0 ec:fixed ec:inset-0 ec:z-50 ec:bg-black/50",
        className
      )}
      {...props}
    />
  )
}

function DrawerContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Content>) {
  return (
    <DrawerPortal data-slot="drawer-portal">
      <DrawerOverlay />
      <DrawerPrimitive.Content
        data-slot="drawer-content"
        className={cn(
          "ec:group/drawer-content ec:bg-background ec:fixed ec:z-50 ec:flex ec:h-auto ec:flex-col",
          "ec:data-[vaul-drawer-direction=top]:inset-x-0 ec:data-[vaul-drawer-direction=top]:top-0 ec:data-[vaul-drawer-direction=top]:mb-24 ec:data-[vaul-drawer-direction=top]:max-h-[80vh] ec:data-[vaul-drawer-direction=top]:rounded-b-lg ec:data-[vaul-drawer-direction=top]:border-b",
          "ec:data-[vaul-drawer-direction=bottom]:inset-x-0 ec:data-[vaul-drawer-direction=bottom]:bottom-0 ec:data-[vaul-drawer-direction=bottom]:mt-24 ec:data-[vaul-drawer-direction=bottom]:max-h-[80vh] ec:data-[vaul-drawer-direction=bottom]:rounded-t-lg ec:data-[vaul-drawer-direction=bottom]:border-t",
          "ec:data-[vaul-drawer-direction=right]:inset-y-0 ec:data-[vaul-drawer-direction=right]:right-0 ec:data-[vaul-drawer-direction=right]:w-3/4 ec:data-[vaul-drawer-direction=right]:border-l ec:data-[vaul-drawer-direction=right]:sm:max-w-sm",
          "ec:data-[vaul-drawer-direction=left]:inset-y-0 ec:data-[vaul-drawer-direction=left]:left-0 ec:data-[vaul-drawer-direction=left]:w-3/4 ec:data-[vaul-drawer-direction=left]:border-r ec:data-[vaul-drawer-direction=left]:sm:max-w-sm",
          className
        )}
        {...props}
      >
        <div className="ec:bg-muted ec:mx-auto ec:mt-4 ec:hidden ec:h-2 ec:w-[100px] ec:shrink-0 ec:rounded-full ec:group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  )
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-header"
      className={cn(
        "ec:flex ec:flex-col ec:gap-0.5 ec:p-4 ec:group-data-[vaul-drawer-direction=bottom]/drawer-content:text-center ec:group-data-[vaul-drawer-direction=top]/drawer-content:text-center ec:md:gap-1.5 ec:md:text-left",
        className
      )}
      {...props}
    />
  )
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn("ec:mt-auto ec:flex ec:flex-col ec:gap-2 ec:p-4", className)}
      {...props}
    />
  )
}

function DrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn("ec:text-foreground ec:font-semibold", className)}
      {...props}
    />
  )
}

function DrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn("ec:text-muted-foreground ec:text-sm", className)}
      {...props}
    />
  )
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}
