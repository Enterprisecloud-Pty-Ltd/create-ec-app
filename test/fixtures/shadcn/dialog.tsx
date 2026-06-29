import * as DialogPrimitive from "@radix-ui/react-dialog"

function DialogContent({
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Content {...props}>{children}</DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

export { DialogContent }
