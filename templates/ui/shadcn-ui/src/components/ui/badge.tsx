import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "ec:inline-flex ec:items-center ec:justify-center ec:rounded-full ec:border ec:px-2 ec:py-0.5 ec:text-xs ec:font-medium ec:w-fit ec:whitespace-nowrap ec:shrink-0 ec:[&>svg]:size-3 ec:gap-1 ec:[&>svg]:pointer-events-none ec:focus-visible:border-ring ec:focus-visible:ring-ring/50 ec:focus-visible:ring-[3px] ec:aria-invalid:ring-destructive/20 ec:dark:aria-invalid:ring-destructive/40 ec:aria-invalid:border-destructive ec:transition-[color,box-shadow] ec:overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "ec:border-transparent ec:bg-primary ec:text-primary-foreground ec:[a&]:hover:bg-primary/90",
        secondary:
          "ec:border-transparent ec:bg-secondary ec:text-secondary-foreground ec:[a&]:hover:bg-secondary/90",
        destructive:
          "ec:border-transparent ec:bg-destructive ec:text-white ec:[a&]:hover:bg-destructive/90 ec:focus-visible:ring-destructive/20 ec:dark:focus-visible:ring-destructive/40 ec:dark:bg-destructive/60",
        outline:
          "ec:text-foreground ec:[a&]:hover:bg-accent ec:[a&]:hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
