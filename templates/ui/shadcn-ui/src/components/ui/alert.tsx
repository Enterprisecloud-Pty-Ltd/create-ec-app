import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "ec:relative ec:w-full ec:rounded-lg ec:border ec:px-4 ec:py-3 ec:text-sm ec:grid ec:has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] ec:grid-cols-[0_1fr] ec:has-[>svg]:gap-x-3 ec:gap-y-0.5 ec:items-start ec:[&>svg]:size-4 ec:[&>svg]:translate-y-0.5 ec:[&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "ec:bg-card ec:text-card-foreground",
        destructive:
          "ec:text-destructive ec:bg-card ec:[&>svg]:text-current ec:*:data-[slot=alert-description]:text-destructive/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "ec:col-start-2 ec:line-clamp-1 ec:min-h-4 ec:font-medium ec:tracking-tight",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "ec:text-muted-foreground ec:col-start-2 ec:grid ec:justify-items-start ec:gap-1 ec:text-sm ec:[&_p]:leading-relaxed",
        className
      )}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription }
