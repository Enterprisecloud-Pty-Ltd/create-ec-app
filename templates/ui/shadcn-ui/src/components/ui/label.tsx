"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"

import { cn } from "@/lib/utils"

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "ec:flex ec:items-center ec:gap-2 ec:text-sm ec:leading-none ec:font-medium ec:select-none ec:group-data-[disabled=true]:pointer-events-none ec:group-data-[disabled=true]:opacity-50 ec:peer-disabled:cursor-not-allowed ec:peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }
