import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "ec:inline-flex ec:items-center ec:justify-center ec:gap-2 ec:whitespace-nowrap ec:rounded-md ec:text-sm ec:font-medium ec:transition-all ec:disabled:pointer-events-none ec:disabled:opacity-50 ec:[&_svg]:pointer-events-none ec:[&_svg:not([class*='size-'])]:size-4 ec:shrink-0 ec:[&_svg]:shrink-0 ec:outline-none ec:focus-visible:border-ring ec:focus-visible:ring-ring/50 ec:focus-visible:ring-[3px] ec:aria-invalid:ring-destructive/20 ec:dark:aria-invalid:ring-destructive/40 ec:aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "ec:bg-primary ec:text-primary-foreground ec:hover:bg-primary/90",
        destructive:
          "ec:bg-destructive ec:text-white ec:hover:bg-destructive/90 ec:focus-visible:ring-destructive/20 ec:dark:focus-visible:ring-destructive/40 ec:dark:bg-destructive/60",
        outline:
          "ec:border ec:bg-background ec:shadow-xs ec:hover:bg-accent ec:hover:text-accent-foreground ec:dark:bg-input/30 ec:dark:border-input ec:dark:hover:bg-input/50",
        secondary:
          "ec:bg-secondary ec:text-secondary-foreground ec:hover:bg-secondary/80",
        ghost:
          "ec:hover:bg-accent ec:hover:text-accent-foreground ec:dark:hover:bg-accent/50",
        link: "ec:text-primary ec:underline-offset-4 ec:hover:underline",
      },
      size: {
        default: "ec:h-9 ec:px-4 ec:py-2 ec:has-[>svg]:px-3",
        sm: "ec:h-8 ec:rounded-md ec:gap-1.5 ec:px-3 ec:has-[>svg]:px-2.5",
        lg: "ec:h-10 ec:rounded-md ec:px-6 ec:has-[>svg]:px-4",
        icon: "ec:size-9",
        "icon-sm": "ec:size-8",
        "icon-lg": "ec:size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
