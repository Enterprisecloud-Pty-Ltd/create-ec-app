import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"

function DropdownMenuPortal(
  props: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>
) {
  return <DropdownMenuPrimitive.Portal {...props} />
}

function DropdownMenuContent({
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content {...props}>
        {children}
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
  )
}

export { DropdownMenuContent, DropdownMenuPortal }
