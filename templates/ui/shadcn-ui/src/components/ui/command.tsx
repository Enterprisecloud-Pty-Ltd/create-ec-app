import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import { SearchIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

function Command({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        "ec:bg-popover ec:text-popover-foreground ec:flex ec:h-full ec:w-full ec:flex-col ec:overflow-hidden ec:rounded-md",
        className
      )}
      {...props}
    />
  )
}

function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  className,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string
  description?: string
  className?: string
  showCloseButton?: boolean
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className="ec:sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent
        className={cn("ec:overflow-hidden ec:p-0", className)}
        showCloseButton={showCloseButton}
      >
        <Command className="ec:[&_[cmdk-group-heading]]:text-muted-foreground ec:**:data-[slot=command-input-wrapper]:h-12 ec:[&_[cmdk-group-heading]]:px-2 ec:[&_[cmdk-group-heading]]:font-medium ec:[&_[cmdk-group]]:px-2 ec:[&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 ec:[&_[cmdk-input-wrapper]_svg]:h-5 ec:[&_[cmdk-input-wrapper]_svg]:w-5 ec:[&_[cmdk-input]]:h-12 ec:[&_[cmdk-item]]:px-2 ec:[&_[cmdk-item]]:py-3 ec:[&_[cmdk-item]_svg]:h-5 ec:[&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  )
}

function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div
      data-slot="command-input-wrapper"
      className="ec:flex ec:h-9 ec:items-center ec:gap-2 ec:border-b ec:px-3"
    >
      <SearchIcon className="ec:size-4 ec:shrink-0 ec:opacity-50" />
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          "ec:placeholder:text-muted-foreground ec:flex ec:h-10 ec:w-full ec:rounded-md ec:bg-transparent ec:py-3 ec:text-sm ec:outline-hidden ec:disabled:cursor-not-allowed ec:disabled:opacity-50",
          className
        )}
        {...props}
      />
    </div>
  )
}

function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn(
        "ec:max-h-[300px] ec:scroll-py-1 ec:overflow-x-hidden ec:overflow-y-auto",
        className
      )}
      {...props}
    />
  )
}

function CommandEmpty({
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className="ec:py-6 ec:text-center ec:text-sm"
      {...props}
    />
  )
}

function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        "ec:text-foreground ec:[&_[cmdk-group-heading]]:text-muted-foreground ec:overflow-hidden ec:p-1 ec:[&_[cmdk-group-heading]]:px-2 ec:[&_[cmdk-group-heading]]:py-1.5 ec:[&_[cmdk-group-heading]]:text-xs ec:[&_[cmdk-group-heading]]:font-medium",
        className
      )}
      {...props}
    />
  )
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn("ec:bg-border ec:-mx-1 ec:h-px", className)}
      {...props}
    />
  )
}

function CommandItem({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "ec:data-[selected=true]:bg-accent ec:data-[selected=true]:text-accent-foreground ec:[&_svg:not([class*='text-'])]:text-muted-foreground ec:relative ec:flex ec:cursor-default ec:items-center ec:gap-2 ec:rounded-sm ec:px-2 ec:py-1.5 ec:text-sm ec:outline-hidden ec:select-none ec:data-[disabled=true]:pointer-events-none ec:data-[disabled=true]:opacity-50 ec:[&_svg]:pointer-events-none ec:[&_svg]:shrink-0 ec:[&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        "ec:text-muted-foreground ec:ml-auto ec:text-xs ec:tracking-widest",
        className
      )}
      {...props}
    />
  )
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}
