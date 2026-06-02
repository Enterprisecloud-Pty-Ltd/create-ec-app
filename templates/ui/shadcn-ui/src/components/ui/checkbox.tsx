"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "ec:peer ec:border-input ec:dark:bg-input/30 ec:data-[state=checked]:bg-primary ec:data-[state=checked]:text-primary-foreground ec:dark:data-[state=checked]:bg-primary ec:data-[state=checked]:border-primary ec:focus-visible:border-ring ec:focus-visible:ring-ring/50 ec:aria-invalid:ring-destructive/20 ec:dark:aria-invalid:ring-destructive/40 ec:aria-invalid:border-destructive ec:size-4 ec:shrink-0 ec:rounded-[4px] ec:border ec:shadow-xs ec:transition-shadow ec:outline-none ec:focus-visible:ring-[3px] ec:disabled:cursor-not-allowed ec:disabled:opacity-50",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="ec:grid ec:place-content-center ec:text-current ec:transition-none"
      >
        <CheckIcon className="ec:size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
