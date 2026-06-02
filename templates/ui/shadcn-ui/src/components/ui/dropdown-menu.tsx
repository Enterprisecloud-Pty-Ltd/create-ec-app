import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { useEcPortalContainer } from "@/runtime/EcAppShell"

function DropdownMenu({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

function DropdownMenuPortal({
  container,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  const portalContainer = useEcPortalContainer()

  return (
    <DropdownMenuPrimitive.Portal
      data-slot="dropdown-menu-portal"
      container={container ?? portalContainer ?? undefined}
      {...props}
    />
  )
}

function DropdownMenuTrigger({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      {...props}
    />
  )
}

function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPortal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(
          "ec:bg-popover ec:text-popover-foreground ec:data-[state=open]:animate-in ec:data-[state=closed]:animate-out ec:data-[state=closed]:fade-out-0 ec:data-[state=open]:fade-in-0 ec:data-[state=closed]:zoom-out-95 ec:data-[state=open]:zoom-in-95 ec:data-[side=bottom]:slide-in-from-top-2 ec:data-[side=left]:slide-in-from-right-2 ec:data-[side=right]:slide-in-from-left-2 ec:data-[side=top]:slide-in-from-bottom-2 ec:z-50 ec:max-h-(--radix-dropdown-menu-content-available-height) ec:min-w-[8rem] ec:origin-(--radix-dropdown-menu-content-transform-origin) ec:overflow-x-hidden ec:overflow-y-auto ec:rounded-md ec:border ec:p-1 ec:shadow-md",
          className
        )}
        {...props}
      />
    </DropdownMenuPortal>
  )
}

function DropdownMenuGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return (
    <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
  )
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "ec:focus:bg-accent ec:focus:text-accent-foreground ec:data-[variant=destructive]:text-destructive ec:data-[variant=destructive]:focus:bg-destructive/10 ec:dark:data-[variant=destructive]:focus:bg-destructive/20 ec:data-[variant=destructive]:focus:text-destructive ec:data-[variant=destructive]:*:[svg]:!text-destructive ec:[&_svg:not([class*='text-'])]:text-muted-foreground ec:relative ec:flex ec:cursor-default ec:items-center ec:gap-2 ec:rounded-sm ec:px-2 ec:py-1.5 ec:text-sm ec:outline-hidden ec:select-none ec:data-[disabled]:pointer-events-none ec:data-[disabled]:opacity-50 ec:data-[inset]:pl-8 ec:[&_svg]:pointer-events-none ec:[&_svg]:shrink-0 ec:[&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(
        "ec:focus:bg-accent ec:focus:text-accent-foreground ec:relative ec:flex ec:cursor-default ec:items-center ec:gap-2 ec:rounded-sm ec:py-1.5 ec:pr-2 ec:pl-8 ec:text-sm ec:outline-hidden ec:select-none ec:data-[disabled]:pointer-events-none ec:data-[disabled]:opacity-50 ec:[&_svg]:pointer-events-none ec:[&_svg]:shrink-0 ec:[&_svg:not([class*='size-'])]:size-4",
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="ec:pointer-events-none ec:absolute ec:left-2 ec:flex ec:size-3.5 ec:items-center ec:justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon className="ec:size-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  )
}

function DropdownMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
  return (
    <DropdownMenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  )
}

function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(
        "ec:focus:bg-accent ec:focus:text-accent-foreground ec:relative ec:flex ec:cursor-default ec:items-center ec:gap-2 ec:rounded-sm ec:py-1.5 ec:pr-2 ec:pl-8 ec:text-sm ec:outline-hidden ec:select-none ec:data-[disabled]:pointer-events-none ec:data-[disabled]:opacity-50 ec:[&_svg]:pointer-events-none ec:[&_svg]:shrink-0 ec:[&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span className="ec:pointer-events-none ec:absolute ec:left-2 ec:flex ec:size-3.5 ec:items-center ec:justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CircleIcon className="ec:size-2 ec:fill-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  )
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        "ec:px-2 ec:py-1.5 ec:text-sm ec:font-medium ec:data-[inset]:pl-8",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("ec:bg-border ec:-mx-1 ec:my-1 ec:h-px", className)}
      {...props}
    />
  )
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "ec:text-muted-foreground ec:ml-auto ec:text-xs ec:tracking-widest",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSub({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "ec:focus:bg-accent ec:focus:text-accent-foreground ec:data-[state=open]:bg-accent ec:data-[state=open]:text-accent-foreground ec:[&_svg:not([class*='text-'])]:text-muted-foreground ec:flex ec:cursor-default ec:items-center ec:gap-2 ec:rounded-sm ec:px-2 ec:py-1.5 ec:text-sm ec:outline-hidden ec:select-none ec:data-[inset]:pl-8 ec:[&_svg]:pointer-events-none ec:[&_svg]:shrink-0 ec:[&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ec:ml-auto ec:size-4" />
    </DropdownMenuPrimitive.SubTrigger>
  )
}

function DropdownMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <DropdownMenuPrimitive.SubContent
      data-slot="dropdown-menu-sub-content"
      className={cn(
        "ec:bg-popover ec:text-popover-foreground ec:data-[state=open]:animate-in ec:data-[state=closed]:animate-out ec:data-[state=closed]:fade-out-0 ec:data-[state=open]:fade-in-0 ec:data-[state=closed]:zoom-out-95 ec:data-[state=open]:zoom-in-95 ec:data-[side=bottom]:slide-in-from-top-2 ec:data-[side=left]:slide-in-from-right-2 ec:data-[side=right]:slide-in-from-left-2 ec:data-[side=top]:slide-in-from-bottom-2 ec:z-50 ec:min-w-[8rem] ec:origin-(--radix-dropdown-menu-content-transform-origin) ec:overflow-hidden ec:rounded-md ec:border ec:p-1 ec:shadow-lg",
        className
      )}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}
