import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

function ItemGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="list"
      data-slot="item-group"
      className={cn("ec:group/item-group ec:flex ec:flex-col", className)}
      {...props}
    />
  )
}

function ItemSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="item-separator"
      orientation="horizontal"
      className={cn("ec:my-0", className)}
      {...props}
    />
  )
}

const itemVariants = cva(
  "ec:group/item ec:flex ec:items-center ec:border ec:border-transparent ec:text-sm ec:rounded-md ec:transition-colors ec:[a]:hover:bg-accent/50 ec:[a]:transition-colors ec:duration-100 ec:flex-wrap ec:outline-none ec:focus-visible:border-ring ec:focus-visible:ring-ring/50 ec:focus-visible:ring-[3px]",
  {
    variants: {
      variant: {
        default: "ec:bg-transparent",
        outline: "ec:border-border",
        muted: "ec:bg-muted/50",
      },
      size: {
        default: "ec:p-4 ec:gap-4 ",
        sm: "ec:py-3 ec:px-4 ec:gap-2.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Item({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof itemVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "div"
  return (
    <Comp
      data-slot="item"
      data-variant={variant}
      data-size={size}
      className={cn(itemVariants({ variant, size, className }))}
      {...props}
    />
  )
}

const itemMediaVariants = cva(
  "ec:flex ec:shrink-0 ec:items-center ec:justify-center ec:gap-2 ec:group-has-[[data-slot=item-description]]/item:self-start ec:[&_svg]:pointer-events-none ec:group-has-[[data-slot=item-description]]/item:translate-y-0.5",
  {
    variants: {
      variant: {
        default: "ec:bg-transparent",
        icon: "ec:size-8 ec:border ec:rounded-sm ec:bg-muted ec:[&_svg:not([class*='size-'])]:size-4",
        image:
          "ec:size-10 ec:rounded-sm ec:overflow-hidden ec:[&_img]:size-full ec:[&_img]:object-cover",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function ItemMedia({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof itemMediaVariants>) {
  return (
    <div
      data-slot="item-media"
      data-variant={variant}
      className={cn(itemMediaVariants({ variant, className }))}
      {...props}
    />
  )
}

function ItemContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-content"
      className={cn(
        "ec:flex ec:flex-1 ec:flex-col ec:gap-1 ec:[&+[data-slot=item-content]]:flex-none",
        className
      )}
      {...props}
    />
  )
}

function ItemTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-title"
      className={cn(
        "ec:flex ec:w-fit ec:items-center ec:gap-2 ec:text-sm ec:leading-snug ec:font-medium",
        className
      )}
      {...props}
    />
  )
}

function ItemDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="item-description"
      className={cn(
        "ec:text-muted-foreground ec:line-clamp-2 ec:text-sm ec:leading-normal ec:font-normal ec:text-balance",
        "ec:[&>a:hover]:text-primary ec:[&>a]:underline ec:[&>a]:underline-offset-4",
        className
      )}
      {...props}
    />
  )
}

function ItemActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-actions"
      className={cn("ec:flex ec:items-center ec:gap-2", className)}
      {...props}
    />
  )
}

function ItemHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-header"
      className={cn(
        "ec:flex ec:basis-full ec:items-center ec:justify-between ec:gap-2",
        className
      )}
      {...props}
    />
  )
}

function ItemFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-footer"
      className={cn(
        "ec:flex ec:basis-full ec:items-center ec:justify-between ec:gap-2",
        className
      )}
      {...props}
    />
  )
}

export {
  Item,
  ItemMedia,
  ItemContent,
  ItemActions,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
  ItemDescription,
  ItemHeader,
  ItemFooter,
}
