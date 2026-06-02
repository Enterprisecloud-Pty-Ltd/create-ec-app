"use client"

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { CircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("ec:grid ec:gap-3", className)}
      {...props}
    />
  )
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "ec:border-input ec:text-primary ec:focus-visible:border-ring ec:focus-visible:ring-ring/50 ec:aria-invalid:ring-destructive/20 ec:dark:aria-invalid:ring-destructive/40 ec:aria-invalid:border-destructive ec:dark:bg-input/30 ec:aspect-square ec:size-4 ec:shrink-0 ec:rounded-full ec:border ec:shadow-xs ec:transition-[color,box-shadow] ec:outline-none ec:focus-visible:ring-[3px] ec:disabled:cursor-not-allowed ec:disabled:opacity-50",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="ec:relative ec:flex ec:items-center ec:justify-center"
      >
        <CircleIcon className="ec:fill-primary ec:absolute ec:top-1/2 ec:left-1/2 ec:size-2 ec:-translate-x-1/2 ec:-translate-y-1/2" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}

export { RadioGroup, RadioGroupItem }
