"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("ec:flex ec:flex-col ec:gap-2", className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "ec:bg-muted ec:text-muted-foreground ec:inline-flex ec:h-9 ec:w-fit ec:items-center ec:justify-center ec:rounded-lg ec:p-[3px]",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "ec:data-[state=active]:bg-background ec:dark:data-[state=active]:text-foreground ec:focus-visible:border-ring ec:focus-visible:ring-ring/50 ec:focus-visible:outline-ring ec:dark:data-[state=active]:border-input ec:dark:data-[state=active]:bg-input/30 ec:text-foreground ec:dark:text-muted-foreground ec:inline-flex ec:h-[calc(100%-1px)] ec:flex-1 ec:items-center ec:justify-center ec:gap-1.5 ec:rounded-md ec:border ec:border-transparent ec:px-2 ec:py-1 ec:text-sm ec:font-medium ec:whitespace-nowrap ec:transition-[color,box-shadow] ec:focus-visible:ring-[3px] ec:focus-visible:outline-1 ec:disabled:pointer-events-none ec:disabled:opacity-50 ec:data-[state=active]:shadow-sm ec:[&_svg]:pointer-events-none ec:[&_svg]:shrink-0 ec:[&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("ec:flex-1 ec:outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
