import * as React from "react"
import * as TogglePrimitive from "@radix-ui/react-toggle"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const toggleVariants = cva(
  "ec:inline-flex ec:items-center ec:justify-center ec:gap-2 ec:rounded-md ec:text-sm ec:font-medium ec:hover:bg-muted ec:hover:text-muted-foreground ec:disabled:pointer-events-none ec:disabled:opacity-50 ec:data-[state=on]:bg-accent ec:data-[state=on]:text-accent-foreground ec:[&_svg]:pointer-events-none ec:[&_svg:not([class*='size-'])]:size-4 ec:[&_svg]:shrink-0 ec:focus-visible:border-ring ec:focus-visible:ring-ring/50 ec:focus-visible:ring-[3px] ec:outline-none ec:transition-[color,box-shadow] ec:aria-invalid:ring-destructive/20 ec:dark:aria-invalid:ring-destructive/40 ec:aria-invalid:border-destructive ec:whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "ec:bg-transparent",
        outline:
          "ec:border ec:border-input ec:bg-transparent ec:shadow-xs ec:hover:bg-accent ec:hover:text-accent-foreground",
      },
      size: {
        default: "ec:h-9 ec:px-2 ec:min-w-9",
        sm: "ec:h-8 ec:px-1.5 ec:min-w-8",
        lg: "ec:h-10 ec:px-2.5 ec:min-w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Toggle({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }
