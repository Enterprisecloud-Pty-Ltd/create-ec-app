"use client"

import * as React from "react"
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu"
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { useEcPortalContainer } from "@/runtime/EcAppShell"

function ContextMenu({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Root>) {
  return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />
}

function ContextMenuTrigger({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Trigger>) {
  return (
    <ContextMenuPrimitive.Trigger data-slot="context-menu-trigger" {...props} />
  )
}

function ContextMenuGroup({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Group>) {
  return (
    <ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />
  )
}

function ContextMenuPortal({
  container,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Portal>) {
  const portalContainer = useEcPortalContainer()

  return (
    <ContextMenuPrimitive.Portal
      data-slot="context-menu-portal"
      container={container ?? portalContainer ?? undefined}
      {...props}
    />
  )
}

function ContextMenuSub({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Sub>) {
  return <ContextMenuPrimitive.Sub data-slot="context-menu-sub" {...props} />
}

function ContextMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.RadioGroup>) {
  return (
    <ContextMenuPrimitive.RadioGroup
      data-slot="context-menu-radio-group"
      {...props}
    />
  )
}

function ContextMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.SubTrigger> & {
  inset?: boolean
}) {
  return (
    <ContextMenuPrimitive.SubTrigger
      data-slot="context-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "ec:focus:bg-accent ec:focus:text-accent-foreground ec:data-[state=open]:bg-accent ec:data-[state=open]:text-accent-foreground ec:[&_svg:not([class*='text-'])]:text-muted-foreground ec:flex ec:cursor-default ec:items-center ec:rounded-sm ec:px-2 ec:py-1.5 ec:text-sm ec:outline-hidden ec:select-none ec:data-[inset]:pl-8 ec:[&_svg]:pointer-events-none ec:[&_svg]:shrink-0 ec:[&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ec:ml-auto" />
    </ContextMenuPrimitive.SubTrigger>
  )
}

function ContextMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.SubContent>) {
  return (
    <ContextMenuPrimitive.SubContent
      data-slot="context-menu-sub-content"
      className={cn(
        "ec:bg-popover ec:text-popover-foreground ec:data-[state=open]:animate-in ec:data-[state=closed]:animate-out ec:data-[state=closed]:fade-out-0 ec:data-[state=open]:fade-in-0 ec:data-[state=closed]:zoom-out-95 ec:data-[state=open]:zoom-in-95 ec:data-[side=bottom]:slide-in-from-top-2 ec:data-[side=left]:slide-in-from-right-2 ec:data-[side=right]:slide-in-from-left-2 ec:data-[side=top]:slide-in-from-bottom-2 ec:z-50 ec:min-w-[8rem] ec:origin-(--radix-context-menu-content-transform-origin) ec:overflow-hidden ec:rounded-md ec:border ec:p-1 ec:shadow-lg",
        className
      )}
      {...props}
    />
  )
}

function ContextMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Content>) {
  return (
    <ContextMenuPortal>
      <ContextMenuPrimitive.Content
        data-slot="context-menu-content"
        className={cn(
          "ec:bg-popover ec:text-popover-foreground ec:data-[state=open]:animate-in ec:data-[state=closed]:animate-out ec:data-[state=closed]:fade-out-0 ec:data-[state=open]:fade-in-0 ec:data-[state=closed]:zoom-out-95 ec:data-[state=open]:zoom-in-95 ec:data-[side=bottom]:slide-in-from-top-2 ec:data-[side=left]:slide-in-from-right-2 ec:data-[side=right]:slide-in-from-left-2 ec:data-[side=top]:slide-in-from-bottom-2 ec:z-50 ec:max-h-(--radix-context-menu-content-available-height) ec:min-w-[8rem] ec:origin-(--radix-context-menu-content-transform-origin) ec:overflow-x-hidden ec:overflow-y-auto ec:rounded-md ec:border ec:p-1 ec:shadow-md",
          className
        )}
        {...props}
      />
    </ContextMenuPortal>
  )
}

function ContextMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Item> & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  return (
    <ContextMenuPrimitive.Item
      data-slot="context-menu-item"
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

function ContextMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.CheckboxItem>) {
  return (
    <ContextMenuPrimitive.CheckboxItem
      data-slot="context-menu-checkbox-item"
      className={cn(
        "ec:focus:bg-accent ec:focus:text-accent-foreground ec:relative ec:flex ec:cursor-default ec:items-center ec:gap-2 ec:rounded-sm ec:py-1.5 ec:pr-2 ec:pl-8 ec:text-sm ec:outline-hidden ec:select-none ec:data-[disabled]:pointer-events-none ec:data-[disabled]:opacity-50 ec:[&_svg]:pointer-events-none ec:[&_svg]:shrink-0 ec:[&_svg:not([class*='size-'])]:size-4",
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="ec:pointer-events-none ec:absolute ec:left-2 ec:flex ec:size-3.5 ec:items-center ec:justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <CheckIcon className="ec:size-4" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.CheckboxItem>
  )
}

function ContextMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.RadioItem>) {
  return (
    <ContextMenuPrimitive.RadioItem
      data-slot="context-menu-radio-item"
      className={cn(
        "ec:focus:bg-accent ec:focus:text-accent-foreground ec:relative ec:flex ec:cursor-default ec:items-center ec:gap-2 ec:rounded-sm ec:py-1.5 ec:pr-2 ec:pl-8 ec:text-sm ec:outline-hidden ec:select-none ec:data-[disabled]:pointer-events-none ec:data-[disabled]:opacity-50 ec:[&_svg]:pointer-events-none ec:[&_svg]:shrink-0 ec:[&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span className="ec:pointer-events-none ec:absolute ec:left-2 ec:flex ec:size-3.5 ec:items-center ec:justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <CircleIcon className="ec:size-2 ec:fill-current" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  )
}

function ContextMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Label> & {
  inset?: boolean
}) {
  return (
    <ContextMenuPrimitive.Label
      data-slot="context-menu-label"
      data-inset={inset}
      className={cn(
        "ec:text-foreground ec:px-2 ec:py-1.5 ec:text-sm ec:font-medium ec:data-[inset]:pl-8",
        className
      )}
      {...props}
    />
  )
}

function ContextMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Separator>) {
  return (
    <ContextMenuPrimitive.Separator
      data-slot="context-menu-separator"
      className={cn("ec:bg-border ec:-mx-1 ec:my-1 ec:h-px", className)}
      {...props}
    />
  )
}

function ContextMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="context-menu-shortcut"
      className={cn(
        "ec:text-muted-foreground ec:ml-auto ec:text-xs ec:tracking-widest",
        className
      )}
      {...props}
    />
  )
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
}
