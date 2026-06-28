import * as PopoverPrimitive from "@radix-ui/react-popover"

function PopoverContent({
  children,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content {...props}>{children}</PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  )
}

export { PopoverContent }
