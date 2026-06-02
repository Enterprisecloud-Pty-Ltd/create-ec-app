"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(
        "ec:group/input-group ec:border-input ec:dark:bg-input/30 ec:relative ec:flex ec:w-full ec:items-center ec:rounded-md ec:border ec:shadow-xs ec:transition-[color,box-shadow] ec:outline-none",
        "ec:h-9 ec:min-w-0 ec:has-[>textarea]:h-auto",

        // Variants based on alignment.
        "ec:has-[>[data-align=inline-start]]:[&>input]:pl-2",
        "ec:has-[>[data-align=inline-end]]:[&>input]:pr-2",
        "ec:has-[>[data-align=block-start]]:h-auto ec:has-[>[data-align=block-start]]:flex-col ec:has-[>[data-align=block-start]]:[&>input]:pb-3",
        "ec:has-[>[data-align=block-end]]:h-auto ec:has-[>[data-align=block-end]]:flex-col ec:has-[>[data-align=block-end]]:[&>input]:pt-3",

        // Focus state.
        "ec:has-[[data-slot=input-group-control]:focus-visible]:border-ring ec:has-[[data-slot=input-group-control]:focus-visible]:ring-ring/50 ec:has-[[data-slot=input-group-control]:focus-visible]:ring-[3px]",

        // Error state.
        "ec:has-[[data-slot][aria-invalid=true]]:ring-destructive/20 ec:has-[[data-slot][aria-invalid=true]]:border-destructive ec:dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40",

        className
      )}
      {...props}
    />
  )
}

const inputGroupAddonVariants = cva(
  "ec:text-muted-foreground ec:flex ec:h-auto ec:cursor-text ec:items-center ec:justify-center ec:gap-2 ec:py-1.5 ec:text-sm ec:font-medium ec:select-none ec:[&>svg:not([class*='size-'])]:size-4 ec:[&>kbd]:rounded-[calc(var(--radius)-5px)] ec:group-data-[disabled=true]/input-group:opacity-50",
  {
    variants: {
      align: {
        "inline-start":
          "ec:order-first ec:pl-3 ec:has-[>button]:ml-[-0.45rem] ec:has-[>kbd]:ml-[-0.35rem]",
        "inline-end":
          "ec:order-last ec:pr-3 ec:has-[>button]:mr-[-0.45rem] ec:has-[>kbd]:mr-[-0.35rem]",
        "block-start":
          "ec:order-first ec:w-full ec:justify-start ec:px-3 ec:pt-3 ec:[.border-b]:pb-3 ec:group-has-[>input]/input-group:pt-2.5",
        "block-end":
          "ec:order-last ec:w-full ec:justify-start ec:px-3 ec:pb-3 ec:[.border-t]:pt-3 ec:group-has-[>input]/input-group:pb-2.5",
      },
    },
    defaultVariants: {
      align: "inline-start",
    },
  }
)

function InputGroupAddon({
  className,
  align = "inline-start",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof inputGroupAddonVariants>) {
  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button")) {
          return
        }
        e.currentTarget.parentElement?.querySelector("input")?.focus()
      }}
      {...props}
    />
  )
}

const inputGroupButtonVariants = cva(
  "ec:text-sm ec:shadow-none ec:flex ec:gap-2 ec:items-center",
  {
    variants: {
      size: {
        xs: "ec:h-6 ec:gap-1 ec:px-2 ec:rounded-[calc(var(--radius)-5px)] ec:[&>svg:not([class*='size-'])]:size-3.5 ec:has-[>svg]:px-2",
        sm: "ec:h-8 ec:px-2.5 ec:gap-1.5 ec:rounded-md ec:has-[>svg]:px-2.5",
        "icon-xs":
          "ec:size-6 ec:rounded-[calc(var(--radius)-5px)] ec:p-0 ec:has-[>svg]:p-0",
        "icon-sm": "ec:size-8 ec:p-0 ec:has-[>svg]:p-0",
      },
    },
    defaultVariants: {
      size: "xs",
    },
  }
)

function InputGroupButton({
  className,
  type = "button",
  variant = "ghost",
  size = "xs",
  ...props
}: Omit<React.ComponentProps<typeof Button>, "size"> &
  VariantProps<typeof inputGroupButtonVariants>) {
  return (
    <Button
      type={type}
      data-size={size}
      variant={variant}
      className={cn(inputGroupButtonVariants({ size }), className)}
      {...props}
    />
  )
}

function InputGroupText({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "ec:text-muted-foreground ec:flex ec:items-center ec:gap-2 ec:text-sm ec:[&_svg]:pointer-events-none ec:[&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function InputGroupInput({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <Input
      data-slot="input-group-control"
      className={cn(
        "ec:flex-1 ec:rounded-none ec:border-0 ec:bg-transparent ec:shadow-none ec:focus-visible:ring-0 ec:dark:bg-transparent",
        className
      )}
      {...props}
    />
  )
}

function InputGroupTextarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <Textarea
      data-slot="input-group-control"
      className={cn(
        "ec:flex-1 ec:resize-none ec:rounded-none ec:border-0 ec:bg-transparent ec:py-3 ec:shadow-none ec:focus-visible:ring-0 ec:dark:bg-transparent",
        className
      )}
      {...props}
    />
  )
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea,
}
