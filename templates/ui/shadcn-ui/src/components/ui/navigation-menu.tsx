import * as React from "react"
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu"
import { cva } from "class-variance-authority"
import { ChevronDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function NavigationMenu({
  className,
  children,
  viewport = true,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Root> & {
  viewport?: boolean
}) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      data-viewport={viewport}
      className={cn(
        "ec:group/navigation-menu ec:relative ec:flex ec:max-w-max ec:flex-1 ec:items-center ec:justify-center",
        className
      )}
      {...props}
    >
      {children}
      {viewport && <NavigationMenuViewport />}
    </NavigationMenuPrimitive.Root>
  )
}

function NavigationMenuList({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn(
        "ec:group ec:flex ec:flex-1 ec:list-none ec:items-center ec:justify-center ec:gap-1",
        className
      )}
      {...props}
    />
  )
}

function NavigationMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) {
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      className={cn("ec:relative", className)}
      {...props}
    />
  )
}

const navigationMenuTriggerStyle = cva(
  "ec:group ec:inline-flex ec:h-9 ec:w-max ec:items-center ec:justify-center ec:rounded-md ec:bg-background ec:px-4 ec:py-2 ec:text-sm ec:font-medium ec:hover:bg-accent ec:hover:text-accent-foreground ec:focus:bg-accent ec:focus:text-accent-foreground ec:disabled:pointer-events-none ec:disabled:opacity-50 ec:data-[state=open]:hover:bg-accent ec:data-[state=open]:text-accent-foreground ec:data-[state=open]:focus:bg-accent ec:data-[state=open]:bg-accent/50 ec:focus-visible:ring-ring/50 ec:outline-none ec:transition-[color,box-shadow] ec:focus-visible:ring-[3px] ec:focus-visible:outline-1"
)

function NavigationMenuTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      className={cn(navigationMenuTriggerStyle(), "ec:group", className)}
      {...props}
    >
      {children}{" "}
      <ChevronDownIcon
        className="ec:relative ec:top-[1px] ec:ml-1 ec:size-3 transition ec:duration-300 ec:group-data-[state=open]:rotate-180"
        aria-hidden="true"
      />
    </NavigationMenuPrimitive.Trigger>
  )
}

function NavigationMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Content>) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        "ec:data-[motion^=from-]:animate-in ec:data-[motion^=to-]:animate-out ec:data-[motion^=from-]:fade-in ec:data-[motion^=to-]:fade-out ec:data-[motion=from-end]:slide-in-from-right-52 ec:data-[motion=from-start]:slide-in-from-left-52 ec:data-[motion=to-end]:slide-out-to-right-52 ec:data-[motion=to-start]:slide-out-to-left-52 ec:top-0 ec:left-0 ec:w-full ec:p-2 ec:pr-2.5 ec:md:absolute ec:md:w-auto",
        "ec:group-data-[viewport=false]/navigation-menu:bg-popover ec:group-data-[viewport=false]/navigation-menu:text-popover-foreground ec:group-data-[viewport=false]/navigation-menu:data-[state=open]:animate-in ec:group-data-[viewport=false]/navigation-menu:data-[state=closed]:animate-out ec:group-data-[viewport=false]/navigation-menu:data-[state=closed]:zoom-out-95 ec:group-data-[viewport=false]/navigation-menu:data-[state=open]:zoom-in-95 ec:group-data-[viewport=false]/navigation-menu:data-[state=open]:fade-in-0 ec:group-data-[viewport=false]/navigation-menu:data-[state=closed]:fade-out-0 ec:group-data-[viewport=false]/navigation-menu:top-full ec:group-data-[viewport=false]/navigation-menu:mt-1.5 ec:group-data-[viewport=false]/navigation-menu:overflow-hidden ec:group-data-[viewport=false]/navigation-menu:rounded-md ec:group-data-[viewport=false]/navigation-menu:border ec:group-data-[viewport=false]/navigation-menu:shadow ec:group-data-[viewport=false]/navigation-menu:duration-200 ec:**:data-[slot=navigation-menu-link]:focus:ring-0 ec:**:data-[slot=navigation-menu-link]:focus:outline-none",
        className
      )}
      {...props}
    />
  )
}

function NavigationMenuViewport({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Viewport>) {
  return (
    <div
      className={cn(
        "ec:absolute ec:top-full ec:left-0 isolate ec:z-50 ec:flex ec:justify-center"
      )}
    >
      <NavigationMenuPrimitive.Viewport
        data-slot="navigation-menu-viewport"
        className={cn(
          "ec:origin-top-center ec:bg-popover ec:text-popover-foreground ec:data-[state=open]:animate-in ec:data-[state=closed]:animate-out ec:data-[state=closed]:zoom-out-95 ec:data-[state=open]:zoom-in-90 ec:relative ec:mt-1.5 ec:h-[var(--radix-navigation-menu-viewport-height)] ec:w-full ec:overflow-hidden ec:rounded-md ec:border shadow ec:md:w-[var(--radix-navigation-menu-viewport-width)]",
          className
        )}
        {...props}
      />
    </div>
  )
}

function NavigationMenuLink({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Link>) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(
        "ec:data-[active=true]:focus:bg-accent ec:data-[active=true]:hover:bg-accent ec:data-[active=true]:bg-accent/50 ec:data-[active=true]:text-accent-foreground ec:hover:bg-accent ec:hover:text-accent-foreground ec:focus:bg-accent ec:focus:text-accent-foreground ec:focus-visible:ring-ring/50 ec:[&_svg:not([class*='text-'])]:text-muted-foreground ec:flex ec:flex-col ec:gap-1 ec:rounded-sm ec:p-2 ec:text-sm ec:transition-all ec:outline-none ec:focus-visible:ring-[3px] ec:focus-visible:outline-1 ec:[&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function NavigationMenuIndicator({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Indicator>) {
  return (
    <NavigationMenuPrimitive.Indicator
      data-slot="navigation-menu-indicator"
      className={cn(
        "ec:data-[state=visible]:animate-in ec:data-[state=hidden]:animate-out ec:data-[state=hidden]:fade-out ec:data-[state=visible]:fade-in ec:top-full ec:z-[1] ec:flex ec:h-1.5 ec:items-end ec:justify-center ec:overflow-hidden",
        className
      )}
      {...props}
    >
      <div className="ec:bg-border ec:relative ec:top-[60%] ec:h-2 ec:w-2 ec:rotate-45 ec:rounded-tl-sm ec:shadow-md" />
    </NavigationMenuPrimitive.Indicator>
  )
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
}
