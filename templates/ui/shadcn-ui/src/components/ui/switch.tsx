"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "ec:peer ec:data-[state=checked]:bg-primary ec:data-[state=unchecked]:bg-input ec:focus-visible:border-ring ec:focus-visible:ring-ring/50 ec:dark:data-[state=unchecked]:bg-input/80 ec:inline-flex ec:h-[1.15rem] ec:w-8 ec:shrink-0 ec:items-center ec:rounded-full ec:border ec:border-transparent ec:shadow-xs ec:transition-all ec:outline-none ec:focus-visible:ring-[3px] ec:disabled:cursor-not-allowed ec:disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "ec:bg-background ec:dark:data-[state=unchecked]:bg-foreground ec:dark:data-[state=checked]:bg-primary-foreground ec:pointer-events-none ec:block ec:size-4 ec:rounded-full ec:ring-0 ec:transition-transform ec:data-[state=checked]:translate-x-[calc(100%-2px)] ec:data-[state=unchecked]:translate-x-0"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
