import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

function Empty({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty"
      className={cn(
        "ec:flex ec:min-w-0 ec:flex-1 ec:flex-col ec:items-center ec:justify-center ec:gap-6 ec:rounded-lg ec:border-dashed ec:p-6 ec:text-center ec:text-balance ec:md:p-12",
        className
      )}
      {...props}
    />
  )
}

function EmptyHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-header"
      className={cn(
        "ec:flex ec:max-w-sm ec:flex-col ec:items-center ec:gap-2 ec:text-center",
        className
      )}
      {...props}
    />
  )
}

const emptyMediaVariants = cva(
  "ec:flex ec:shrink-0 ec:items-center ec:justify-center ec:mb-2 ec:[&_svg]:pointer-events-none ec:[&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "ec:bg-transparent",
        icon: "ec:bg-muted ec:text-foreground ec:flex ec:size-10 ec:shrink-0 ec:items-center ec:justify-center ec:rounded-lg ec:[&_svg:not([class*='size-'])]:size-6",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function EmptyMedia({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof emptyMediaVariants>) {
  return (
    <div
      data-slot="empty-icon"
      data-variant={variant}
      className={cn(emptyMediaVariants({ variant, className }))}
      {...props}
    />
  )
}

function EmptyTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-title"
      className={cn("ec:text-lg ec:font-medium ec:tracking-tight", className)}
      {...props}
    />
  )
}

function EmptyDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <div
      data-slot="empty-description"
      className={cn(
        "ec:text-muted-foreground ec:[&>a:hover]:text-primary ec:text-sm/relaxed ec:[&>a]:underline ec:[&>a]:underline-offset-4",
        className
      )}
      {...props}
    />
  )
}

function EmptyContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-content"
      className={cn(
        "ec:flex ec:w-full ec:max-w-sm ec:min-w-0 ec:flex-col ec:items-center ec:gap-4 ec:text-sm ec:text-balance",
        className
      )}
      {...props}
    />
  )
}

export {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
}
