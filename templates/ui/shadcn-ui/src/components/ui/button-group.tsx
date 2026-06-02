import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

const buttonGroupVariants = cva(
  "ec:flex ec:w-fit ec:items-stretch ec:[&>*]:focus-visible:z-10 ec:[&>*]:focus-visible:relative ec:[&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit ec:[&>input]:flex-1 ec:has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-md ec:has-[>[data-slot=button-group]]:gap-2",
  {
    variants: {
      orientation: {
        horizontal:
          "ec:[&>*:not(:first-child)]:rounded-l-none ec:[&>*:not(:first-child)]:border-l-0 ec:[&>*:not(:last-child)]:rounded-r-none",
        vertical:
          "ec:flex-col ec:[&>*:not(:first-child)]:rounded-t-none ec:[&>*:not(:first-child)]:border-t-0 ec:[&>*:not(:last-child)]:rounded-b-none",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  }
)

function ButtonGroup({
  className,
  orientation,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof buttonGroupVariants>) {
  return (
    <div
      role="group"
      data-slot="button-group"
      data-orientation={orientation}
      className={cn(buttonGroupVariants({ orientation }), className)}
      {...props}
    />
  )
}

function ButtonGroupText({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & {
  asChild?: boolean
}) {
  const Comp = asChild ? Slot : "div"

  return (
    <Comp
      className={cn(
        "ec:bg-muted ec:flex ec:items-center ec:gap-2 ec:rounded-md ec:border ec:px-4 ec:text-sm ec:font-medium ec:shadow-xs ec:[&_svg]:pointer-events-none ec:[&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function ButtonGroupSeparator({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="button-group-separator"
      orientation={orientation}
      className={cn(
        "ec:bg-input ec:relative ec:!m-0 ec:self-stretch ec:data-[orientation=vertical]:h-auto",
        className
      )}
      {...props}
    />
  )
}

export {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
  buttonGroupVariants,
}
