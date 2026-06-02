import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { useEcPortalContainer } from "@/runtime/EcAppShell"

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default"
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "ec:border-input ec:data-[placeholder]:text-muted-foreground ec:[&_svg:not([class*='text-'])]:text-muted-foreground ec:focus-visible:border-ring ec:focus-visible:ring-ring/50 ec:aria-invalid:ring-destructive/20 ec:dark:aria-invalid:ring-destructive/40 ec:aria-invalid:border-destructive ec:dark:bg-input/30 ec:dark:hover:bg-input/50 ec:flex ec:w-fit ec:items-center ec:justify-between ec:gap-2 ec:rounded-md ec:border ec:bg-transparent ec:px-3 ec:py-2 ec:text-sm ec:whitespace-nowrap ec:shadow-xs ec:transition-[color,box-shadow] ec:outline-none ec:focus-visible:ring-[3px] ec:disabled:cursor-not-allowed ec:disabled:opacity-50 ec:data-[size=default]:h-9 ec:data-[size=sm]:h-8 ec:*:data-[slot=select-value]:line-clamp-1 ec:*:data-[slot=select-value]:flex ec:*:data-[slot=select-value]:items-center ec:*:data-[slot=select-value]:gap-2 ec:[&_svg]:pointer-events-none ec:[&_svg]:shrink-0 ec:[&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="ec:size-4 ec:opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  position = "popper",
  align = "center",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  const portalContainer = useEcPortalContainer()

  return (
    <SelectPrimitive.Portal container={portalContainer ?? undefined}>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          "ec:bg-popover ec:text-popover-foreground ec:data-[state=open]:animate-in ec:data-[state=closed]:animate-out ec:data-[state=closed]:fade-out-0 ec:data-[state=open]:fade-in-0 ec:data-[state=closed]:zoom-out-95 ec:data-[state=open]:zoom-in-95 ec:data-[side=bottom]:slide-in-from-top-2 ec:data-[side=left]:slide-in-from-right-2 ec:data-[side=right]:slide-in-from-left-2 ec:data-[side=top]:slide-in-from-bottom-2 ec:relative ec:z-50 ec:max-h-(--radix-select-content-available-height) ec:min-w-[8rem] ec:origin-(--radix-select-content-transform-origin) ec:overflow-x-hidden ec:overflow-y-auto ec:rounded-md ec:border ec:shadow-md",
          position === "popper" &&
            "ec:data-[side=bottom]:translate-y-1 ec:data-[side=left]:-translate-x-1 ec:data-[side=right]:translate-x-1 ec:data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        align={align}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "ec:p-1",
            position === "popper" &&
              "ec:h-[var(--radix-select-trigger-height)] ec:w-full ec:min-w-[var(--radix-select-trigger-width)] ec:scroll-my-1"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("ec:text-muted-foreground ec:px-2 ec:py-1.5 ec:text-xs", className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "ec:focus:bg-accent ec:focus:text-accent-foreground ec:[&_svg:not([class*='text-'])]:text-muted-foreground ec:relative ec:flex ec:w-full ec:cursor-default ec:items-center ec:gap-2 ec:rounded-sm ec:py-1.5 ec:pr-8 ec:pl-2 ec:text-sm ec:outline-hidden ec:select-none ec:data-[disabled]:pointer-events-none ec:data-[disabled]:opacity-50 ec:[&_svg]:pointer-events-none ec:[&_svg]:shrink-0 ec:[&_svg:not([class*='size-'])]:size-4 ec:*:[span]:last:flex ec:*:[span]:last:items-center ec:*:[span]:last:gap-2",
        className
      )}
      {...props}
    >
      <span className="ec:absolute ec:right-2 ec:flex ec:size-3.5 ec:items-center ec:justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="ec:size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("ec:bg-border ec:pointer-events-none ec:-mx-1 ec:my-1 ec:h-px", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "ec:flex ec:cursor-default ec:items-center ec:justify-center ec:py-1",
        className
      )}
      {...props}
    >
      <ChevronUpIcon className="ec:size-4" />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "ec:flex ec:cursor-default ec:items-center ec:justify-center ec:py-1",
        className
      )}
      {...props}
    >
      <ChevronDownIcon className="ec:size-4" />
    </SelectPrimitive.ScrollDownButton>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
