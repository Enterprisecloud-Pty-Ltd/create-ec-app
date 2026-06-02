import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { useEcPortalContainer } from "@/runtime/EcAppShell"

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({
  container,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  const portalContainer = useEcPortalContainer()

  return (
    <SheetPrimitive.Portal
      data-slot="sheet-portal"
      container={container ?? portalContainer ?? undefined}
      {...props}
    />
  )
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "ec:data-[state=open]:animate-in ec:data-[state=closed]:animate-out ec:data-[state=closed]:fade-out-0 ec:data-[state=open]:fade-in-0 ec:fixed ec:inset-0 ec:z-50 ec:bg-black/50",
        className
      )}
      {...props}
    />
  )
}

function SheetContent({
  className,
  children,
  side = "right",
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left"
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          "ec:bg-background ec:data-[state=open]:animate-in ec:data-[state=closed]:animate-out ec:fixed ec:z-50 ec:flex ec:flex-col ec:gap-4 ec:shadow-lg transition ec:ease-in-out ec:data-[state=closed]:duration-300 ec:data-[state=open]:duration-500",
          side === "right" &&
            "ec:data-[state=closed]:slide-out-to-right ec:data-[state=open]:slide-in-from-right ec:inset-y-0 ec:right-0 ec:h-full ec:w-3/4 ec:border-l ec:sm:max-w-sm",
          side === "left" &&
            "ec:data-[state=closed]:slide-out-to-left ec:data-[state=open]:slide-in-from-left ec:inset-y-0 ec:left-0 ec:h-full ec:w-3/4 ec:border-r ec:sm:max-w-sm",
          side === "top" &&
            "ec:data-[state=closed]:slide-out-to-top ec:data-[state=open]:slide-in-from-top ec:inset-x-0 ec:top-0 ec:h-auto ec:border-b",
          side === "bottom" &&
            "ec:data-[state=closed]:slide-out-to-bottom ec:data-[state=open]:slide-in-from-bottom ec:inset-x-0 ec:bottom-0 ec:h-auto ec:border-t",
          className
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className="ec:ring-offset-background ec:focus:ring-ring ec:data-[state=open]:bg-secondary ec:absolute ec:top-4 ec:right-4 ec:rounded-xs ec:opacity-70 ec:transition-opacity ec:hover:opacity-100 ec:focus:ring-2 ec:focus:ring-offset-2 ec:focus:outline-hidden ec:disabled:pointer-events-none">
          <XIcon className="ec:size-4" />
          <span className="ec:sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("ec:flex ec:flex-col ec:gap-1.5 ec:p-4", className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("ec:mt-auto ec:flex ec:flex-col ec:gap-2 ec:p-4", className)}
      {...props}
    />
  )
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("ec:text-foreground ec:font-semibold", className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("ec:text-muted-foreground ec:text-sm", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
