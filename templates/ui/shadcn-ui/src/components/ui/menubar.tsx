import * as React from "react"
import * as MenubarPrimitive from "@radix-ui/react-menubar"
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { useEcPortalContainer } from "@/runtime/EcAppShell"

function Menubar({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Root>) {
  return (
    <MenubarPrimitive.Root
      data-slot="menubar"
      className={cn(
        "ec:bg-background ec:flex ec:h-9 ec:items-center ec:gap-1 ec:rounded-md ec:border ec:p-1 ec:shadow-xs",
        className
      )}
      {...props}
    />
  )
}

function MenubarMenu({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Menu>) {
  return <MenubarPrimitive.Menu data-slot="menubar-menu" {...props} />
}

function MenubarGroup({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Group>) {
  return <MenubarPrimitive.Group data-slot="menubar-group" {...props} />
}

function MenubarPortal({
  container,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Portal>) {
  const portalContainer = useEcPortalContainer()

  return (
    <MenubarPrimitive.Portal
      data-slot="menubar-portal"
      container={container ?? portalContainer ?? undefined}
      {...props}
    />
  )
}

function MenubarRadioGroup({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.RadioGroup>) {
  return (
    <MenubarPrimitive.RadioGroup data-slot="menubar-radio-group" {...props} />
  )
}

function MenubarTrigger({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Trigger>) {
  return (
    <MenubarPrimitive.Trigger
      data-slot="menubar-trigger"
      className={cn(
        "ec:focus:bg-accent ec:focus:text-accent-foreground ec:data-[state=open]:bg-accent ec:data-[state=open]:text-accent-foreground ec:flex ec:items-center ec:rounded-sm ec:px-2 ec:py-1 ec:text-sm ec:font-medium ec:outline-hidden ec:select-none",
        className
      )}
      {...props}
    />
  )
}

function MenubarContent({
  className,
  align = "start",
  alignOffset = -4,
  sideOffset = 8,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Content>) {
  return (
    <MenubarPortal>
      <MenubarPrimitive.Content
        data-slot="menubar-content"
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        className={cn(
          "ec:bg-popover ec:text-popover-foreground ec:data-[state=open]:animate-in ec:data-[state=closed]:fade-out-0 ec:data-[state=open]:fade-in-0 ec:data-[state=closed]:zoom-out-95 ec:data-[state=open]:zoom-in-95 ec:data-[side=bottom]:slide-in-from-top-2 ec:data-[side=left]:slide-in-from-right-2 ec:data-[side=right]:slide-in-from-left-2 ec:data-[side=top]:slide-in-from-bottom-2 ec:z-50 ec:min-w-[12rem] ec:origin-(--radix-menubar-content-transform-origin) ec:overflow-hidden ec:rounded-md ec:border ec:p-1 ec:shadow-md",
          className
        )}
        {...props}
      />
    </MenubarPortal>
  )
}

function MenubarItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Item> & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  return (
    <MenubarPrimitive.Item
      data-slot="menubar-item"
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

function MenubarCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.CheckboxItem>) {
  return (
    <MenubarPrimitive.CheckboxItem
      data-slot="menubar-checkbox-item"
      className={cn(
        "ec:focus:bg-accent ec:focus:text-accent-foreground ec:relative ec:flex ec:cursor-default ec:items-center ec:gap-2 ec:rounded-xs ec:py-1.5 ec:pr-2 ec:pl-8 ec:text-sm ec:outline-hidden ec:select-none ec:data-[disabled]:pointer-events-none ec:data-[disabled]:opacity-50 ec:[&_svg]:pointer-events-none ec:[&_svg]:shrink-0 ec:[&_svg:not([class*='size-'])]:size-4",
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="ec:pointer-events-none ec:absolute ec:left-2 ec:flex ec:size-3.5 ec:items-center ec:justify-center">
        <MenubarPrimitive.ItemIndicator>
          <CheckIcon className="ec:size-4" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.CheckboxItem>
  )
}

function MenubarRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.RadioItem>) {
  return (
    <MenubarPrimitive.RadioItem
      data-slot="menubar-radio-item"
      className={cn(
        "ec:focus:bg-accent ec:focus:text-accent-foreground ec:relative ec:flex ec:cursor-default ec:items-center ec:gap-2 ec:rounded-xs ec:py-1.5 ec:pr-2 ec:pl-8 ec:text-sm ec:outline-hidden ec:select-none ec:data-[disabled]:pointer-events-none ec:data-[disabled]:opacity-50 ec:[&_svg]:pointer-events-none ec:[&_svg]:shrink-0 ec:[&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span className="ec:pointer-events-none ec:absolute ec:left-2 ec:flex ec:size-3.5 ec:items-center ec:justify-center">
        <MenubarPrimitive.ItemIndicator>
          <CircleIcon className="ec:size-2 ec:fill-current" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.RadioItem>
  )
}

function MenubarLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Label> & {
  inset?: boolean
}) {
  return (
    <MenubarPrimitive.Label
      data-slot="menubar-label"
      data-inset={inset}
      className={cn(
        "ec:px-2 ec:py-1.5 ec:text-sm ec:font-medium ec:data-[inset]:pl-8",
        className
      )}
      {...props}
    />
  )
}

function MenubarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Separator>) {
  return (
    <MenubarPrimitive.Separator
      data-slot="menubar-separator"
      className={cn("ec:bg-border ec:-mx-1 ec:my-1 ec:h-px", className)}
      {...props}
    />
  )
}

function MenubarShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="menubar-shortcut"
      className={cn(
        "ec:text-muted-foreground ec:ml-auto ec:text-xs ec:tracking-widest",
        className
      )}
      {...props}
    />
  )
}

function MenubarSub({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Sub>) {
  return <MenubarPrimitive.Sub data-slot="menubar-sub" {...props} />
}

function MenubarSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.SubTrigger> & {
  inset?: boolean
}) {
  return (
    <MenubarPrimitive.SubTrigger
      data-slot="menubar-sub-trigger"
      data-inset={inset}
      className={cn(
        "ec:focus:bg-accent ec:focus:text-accent-foreground ec:data-[state=open]:bg-accent ec:data-[state=open]:text-accent-foreground ec:flex ec:cursor-default ec:items-center ec:rounded-sm ec:px-2 ec:py-1.5 ec:text-sm ec:outline-none ec:select-none ec:data-[inset]:pl-8",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ec:ml-auto ec:h-4 ec:w-4" />
    </MenubarPrimitive.SubTrigger>
  )
}

function MenubarSubContent({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.SubContent>) {
  return (
    <MenubarPrimitive.SubContent
      data-slot="menubar-sub-content"
      className={cn(
        "ec:bg-popover ec:text-popover-foreground ec:data-[state=open]:animate-in ec:data-[state=closed]:animate-out ec:data-[state=closed]:fade-out-0 ec:data-[state=open]:fade-in-0 ec:data-[state=closed]:zoom-out-95 ec:data-[state=open]:zoom-in-95 ec:data-[side=bottom]:slide-in-from-top-2 ec:data-[side=left]:slide-in-from-right-2 ec:data-[side=right]:slide-in-from-left-2 ec:data-[side=top]:slide-in-from-bottom-2 ec:z-50 ec:min-w-[8rem] ec:origin-(--radix-menubar-content-transform-origin) ec:overflow-hidden ec:rounded-md ec:border ec:p-1 ec:shadow-lg",
        className
      )}
      {...props}
    />
  )
}

export {
  Menubar,
  MenubarPortal,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarGroup,
  MenubarSeparator,
  MenubarLabel,
  MenubarItem,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
}
