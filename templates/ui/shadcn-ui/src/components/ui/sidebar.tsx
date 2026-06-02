"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { PanelLeftIcon } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_WIDTH_ICON = "3rem"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

type SidebarContextProps = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContextProps | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }

  return context
}

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const isMobile = useIsMobile()
  const [openMobile, setOpenMobile] = React.useState(false)

  // This is the internal state of the sidebar.
  // We use openProp and setOpenProp for control from outside the component.
  const [_open, _setOpen] = React.useState(defaultOpen)
  const open = openProp ?? _open
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value
      if (setOpenProp) {
        setOpenProp(openState)
      } else {
        _setOpen(openState)
      }

      // This sets the cookie to keep the sidebar state.
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
    },
    [setOpenProp, open]
  )

  // Helper to toggle the sidebar.
  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open)
  }, [isMobile, setOpen, setOpenMobile])

  // Adds a keyboard shortcut to toggle the sidebar.
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault()
        toggleSidebar()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleSidebar])

  // We add a state so that we can do data-state="expanded" or "collapsed".
  // This makes it easier to style the sidebar with Tailwind classes.
  const state = open ? "expanded" : "collapsed"

  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
  )

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          data-slot="sidebar-wrapper"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH,
              "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
              ...style,
            } as React.CSSProperties
          }
          className={cn(
            "ec:group/sidebar-wrapper ec:has-data-[variant=inset]:bg-sidebar ec:flex ec:min-h-svh ec:w-full",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  )
}

function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  side?: "left" | "right"
  variant?: "sidebar" | "floating" | "inset"
  collapsible?: "offcanvas" | "icon" | "none"
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

  if (collapsible === "none") {
    return (
      <div
        data-slot="sidebar"
        className={cn(
          "ec:bg-sidebar ec:text-sidebar-foreground ec:flex ec:h-full ec:w-(--sidebar-width) ec:flex-col",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent
          data-sidebar="sidebar"
          data-slot="sidebar"
          data-mobile="true"
          className="ec:bg-sidebar ec:text-sidebar-foreground ec:w-(--sidebar-width) ec:p-0 ec:[&>button]:hidden"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
            } as React.CSSProperties
          }
          side={side}
        >
          <SheetHeader className="ec:sr-only">
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>Displays the mobile sidebar.</SheetDescription>
          </SheetHeader>
          <div className="ec:flex ec:h-full ec:w-full ec:flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div
      className="ec:group ec:peer ec:text-sidebar-foreground ec:hidden ec:md:block"
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side={side}
      data-slot="sidebar"
    >
      {/* This is what handles the sidebar gap on desktop */}
      <div
        data-slot="sidebar-gap"
        className={cn(
          "ec:relative ec:w-(--sidebar-width) ec:bg-transparent ec:transition-[width] ec:duration-200 ec:ease-linear",
          "ec:group-data-[collapsible=offcanvas]:w-0",
          "ec:group-data-[side=right]:rotate-180",
          variant === "floating" || variant === "inset"
            ? "ec:group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"
            : "ec:group-data-[collapsible=icon]:w-(--sidebar-width-icon)"
        )}
      />
      <div
        data-slot="sidebar-container"
        className={cn(
          "ec:fixed ec:inset-y-0 ec:z-10 ec:hidden ec:h-svh ec:w-(--sidebar-width) ec:transition-[left,right,width] ec:duration-200 ec:ease-linear ec:md:flex",
          side === "left"
            ? "ec:left-0 ec:group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
            : "ec:right-0 ec:group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
          // Adjust the padding for floating and inset variants.
          variant === "floating" || variant === "inset"
            ? "ec:p-2 ec:group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]"
            : "ec:group-data-[collapsible=icon]:w-(--sidebar-width-icon) ec:group-data-[side=left]:border-r ec:group-data-[side=right]:border-l",
          className
        )}
        {...props}
      >
        <div
          data-sidebar="sidebar"
          data-slot="sidebar-inner"
          className="ec:bg-sidebar ec:group-data-[variant=floating]:border-sidebar-border ec:flex ec:h-full ec:w-full ec:flex-col ec:group-data-[variant=floating]:rounded-lg ec:group-data-[variant=floating]:border ec:group-data-[variant=floating]:shadow-sm"
        >
          {children}
        </div>
      </div>
    </div>
  )
}

function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon"
      className={cn("ec:size-7", className)}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    >
      <PanelLeftIcon />
      <span className="ec:sr-only">Toggle Sidebar</span>
    </Button>
  )
}

function SidebarRail({ className, ...props }: React.ComponentProps<"button">) {
  const { toggleSidebar } = useSidebar()

  return (
    <button
      data-sidebar="rail"
      data-slot="sidebar-rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={cn(
        "ec:hover:after:bg-sidebar-border ec:absolute ec:inset-y-0 ec:z-20 ec:hidden ec:w-4 ec:-translate-x-1/2 ec:transition-all ec:ease-linear ec:group-data-[side=left]:-right-4 ec:group-data-[side=right]:left-0 ec:after:absolute ec:after:inset-y-0 ec:after:left-1/2 ec:after:w-[2px] ec:sm:flex",
        "ec:in-data-[side=left]:cursor-w-resize ec:in-data-[side=right]:cursor-e-resize",
        "ec:[[data-side=left][data-state=collapsed]_&]:cursor-e-resize ec:[[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "ec:hover:group-data-[collapsible=offcanvas]:bg-sidebar ec:group-data-[collapsible=offcanvas]:translate-x-0 ec:group-data-[collapsible=offcanvas]:after:left-full",
        "ec:[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
        "ec:[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        className
      )}
      {...props}
    />
  )
}

function SidebarInset({ className, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(
        "ec:bg-background ec:relative ec:flex ec:w-full ec:flex-1 ec:flex-col",
        "ec:md:peer-data-[variant=inset]:m-2 ec:md:peer-data-[variant=inset]:ml-0 ec:md:peer-data-[variant=inset]:rounded-xl ec:md:peer-data-[variant=inset]:shadow-sm ec:md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2",
        className
      )}
      {...props}
    />
  )
}

function SidebarInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      data-slot="sidebar-input"
      data-sidebar="input"
      className={cn("ec:bg-background ec:h-8 ec:w-full ec:shadow-none", className)}
      {...props}
    />
  )
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      data-sidebar="header"
      className={cn("ec:flex ec:flex-col ec:gap-2 ec:p-2", className)}
      {...props}
    />
  )
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      data-sidebar="footer"
      className={cn("ec:flex ec:flex-col ec:gap-2 ec:p-2", className)}
      {...props}
    />
  )
}

function SidebarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="sidebar-separator"
      data-sidebar="separator"
      className={cn("ec:bg-sidebar-border ec:mx-2 ec:w-auto", className)}
      {...props}
    />
  )
}

function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-content"
      data-sidebar="content"
      className={cn(
        "ec:flex ec:min-h-0 ec:flex-1 ec:flex-col ec:gap-2 ec:overflow-auto ec:group-data-[collapsible=icon]:overflow-hidden",
        className
      )}
      {...props}
    />
  )
}

function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group"
      data-sidebar="group"
      className={cn("ec:relative ec:flex ec:w-full ec:min-w-0 ec:flex-col ec:p-2", className)}
      {...props}
    />
  )
}

function SidebarGroupLabel({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "div"

  return (
    <Comp
      data-slot="sidebar-group-label"
      data-sidebar="group-label"
      className={cn(
        "ec:text-sidebar-foreground/70 ec:ring-sidebar-ring ec:flex ec:h-8 ec:shrink-0 ec:items-center ec:rounded-md ec:px-2 ec:text-xs ec:font-medium ec:outline-hidden ec:transition-[margin,opacity] ec:duration-200 ec:ease-linear ec:focus-visible:ring-2 ec:[&>svg]:size-4 ec:[&>svg]:shrink-0",
        "ec:group-data-[collapsible=icon]:-mt-8 ec:group-data-[collapsible=icon]:opacity-0",
        className
      )}
      {...props}
    />
  )
}

function SidebarGroupAction({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="sidebar-group-action"
      data-sidebar="group-action"
      className={cn(
        "ec:text-sidebar-foreground ec:ring-sidebar-ring ec:hover:bg-sidebar-accent ec:hover:text-sidebar-accent-foreground ec:absolute ec:top-3.5 ec:right-3 ec:flex ec:aspect-square ec:w-5 ec:items-center ec:justify-center ec:rounded-md ec:p-0 ec:outline-hidden ec:transition-transform ec:focus-visible:ring-2 ec:[&>svg]:size-4 ec:[&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "ec:after:absolute ec:after:-inset-2 ec:md:after:hidden",
        "ec:group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

function SidebarGroupContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group-content"
      data-sidebar="group-content"
      className={cn("ec:w-full ec:text-sm", className)}
      {...props}
    />
  )
}

function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu"
      data-sidebar="menu"
      className={cn("ec:flex ec:w-full ec:min-w-0 ec:flex-col ec:gap-1", className)}
      {...props}
    />
  )
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      className={cn("ec:group/menu-item ec:relative", className)}
      {...props}
    />
  )
}

const sidebarMenuButtonVariants = cva(
  "ec:peer/menu-button ec:flex ec:w-full ec:items-center ec:gap-2 ec:overflow-hidden ec:rounded-md ec:p-2 ec:text-left ec:text-sm ec:outline-hidden ec:ring-sidebar-ring ec:transition-[width,height,padding] ec:hover:bg-sidebar-accent ec:hover:text-sidebar-accent-foreground ec:focus-visible:ring-2 ec:active:bg-sidebar-accent ec:active:text-sidebar-accent-foreground ec:disabled:pointer-events-none ec:disabled:opacity-50 ec:group-has-data-[sidebar=menu-action]/menu-item:pr-8 ec:aria-disabled:pointer-events-none ec:aria-disabled:opacity-50 ec:data-[active=true]:bg-sidebar-accent ec:data-[active=true]:font-medium ec:data-[active=true]:text-sidebar-accent-foreground ec:data-[state=open]:hover:bg-sidebar-accent ec:data-[state=open]:hover:text-sidebar-accent-foreground ec:group-data-[collapsible=icon]:size-8! ec:group-data-[collapsible=icon]:p-2! ec:[&>span:last-child]:truncate ec:[&>svg]:size-4 ec:[&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "ec:hover:bg-sidebar-accent ec:hover:text-sidebar-accent-foreground",
        outline:
          "ec:bg-background ec:shadow-[0_0_0_1px_hsl(var(--sidebar-border))] ec:hover:bg-sidebar-accent ec:hover:text-sidebar-accent-foreground ec:hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
      },
      size: {
        default: "ec:h-8 ec:text-sm",
        sm: "ec:h-7 ec:text-xs",
        lg: "ec:h-12 ec:text-sm ec:group-data-[collapsible=icon]:p-0!",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function SidebarMenuButton({
  asChild = false,
  isActive = false,
  variant = "default",
  size = "default",
  tooltip,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean
  isActive?: boolean
  tooltip?: string | React.ComponentProps<typeof TooltipContent>
} & VariantProps<typeof sidebarMenuButtonVariants>) {
  const Comp = asChild ? Slot : "button"
  const { isMobile, state } = useSidebar()

  const button = (
    <Comp
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      data-size={size}
      data-active={isActive}
      className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
      {...props}
    />
  )

  if (!tooltip) {
    return button
  }

  if (typeof tooltip === "string") {
    tooltip = {
      children: tooltip,
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        side="right"
        align="center"
        hidden={state !== "collapsed" || isMobile}
        {...tooltip}
      />
    </Tooltip>
  )
}

function SidebarMenuAction({
  className,
  asChild = false,
  showOnHover = false,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean
  showOnHover?: boolean
}) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="sidebar-menu-action"
      data-sidebar="menu-action"
      className={cn(
        "ec:text-sidebar-foreground ec:ring-sidebar-ring ec:hover:bg-sidebar-accent ec:hover:text-sidebar-accent-foreground ec:peer-hover/menu-button:text-sidebar-accent-foreground ec:absolute ec:top-1.5 ec:right-1 ec:flex ec:aspect-square ec:w-5 ec:items-center ec:justify-center ec:rounded-md ec:p-0 ec:outline-hidden ec:transition-transform ec:focus-visible:ring-2 ec:[&>svg]:size-4 ec:[&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "ec:after:absolute ec:after:-inset-2 ec:md:after:hidden",
        "ec:peer-data-[size=sm]/menu-button:top-1",
        "ec:peer-data-[size=default]/menu-button:top-1.5",
        "ec:peer-data-[size=lg]/menu-button:top-2.5",
        "ec:group-data-[collapsible=icon]:hidden",
        showOnHover &&
          "ec:peer-data-[active=true]/menu-button:text-sidebar-accent-foreground ec:group-focus-within/menu-item:opacity-100 ec:group-hover/menu-item:opacity-100 ec:data-[state=open]:opacity-100 ec:md:opacity-0",
        className
      )}
      {...props}
    />
  )
}

function SidebarMenuBadge({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-menu-badge"
      data-sidebar="menu-badge"
      className={cn(
        "ec:text-sidebar-foreground ec:pointer-events-none ec:absolute ec:right-1 ec:flex ec:h-5 ec:min-w-5 ec:items-center ec:justify-center ec:rounded-md ec:px-1 ec:text-xs ec:font-medium ec:tabular-nums ec:select-none",
        "ec:peer-hover/menu-button:text-sidebar-accent-foreground ec:peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
        "ec:peer-data-[size=sm]/menu-button:top-1",
        "ec:peer-data-[size=default]/menu-button:top-1.5",
        "ec:peer-data-[size=lg]/menu-button:top-2.5",
        "ec:group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

function SidebarMenuSkeleton({
  className,
  showIcon = false,
  ...props
}: React.ComponentProps<"div"> & {
  showIcon?: boolean
}) {
  // Random width between 50 to 90%.
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`
  }, [])

  return (
    <div
      data-slot="sidebar-menu-skeleton"
      data-sidebar="menu-skeleton"
      className={cn("ec:flex ec:h-8 ec:items-center ec:gap-2 ec:rounded-md ec:px-2", className)}
      {...props}
    >
      {showIcon && (
        <Skeleton
          className="ec:size-4 ec:rounded-md"
          data-sidebar="menu-skeleton-icon"
        />
      )}
      <Skeleton
        className="ec:h-4 ec:max-w-(--skeleton-width) ec:flex-1"
        data-sidebar="menu-skeleton-text"
        style={
          {
            "--skeleton-width": width,
          } as React.CSSProperties
        }
      />
    </div>
  )
}

function SidebarMenuSub({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu-sub"
      data-sidebar="menu-sub"
      className={cn(
        "ec:border-sidebar-border ec:mx-3.5 ec:flex ec:min-w-0 ec:translate-x-px ec:flex-col ec:gap-1 ec:border-l ec:px-2.5 ec:py-0.5",
        "ec:group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

function SidebarMenuSubItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-sub-item"
      data-sidebar="menu-sub-item"
      className={cn("ec:group/menu-sub-item ec:relative", className)}
      {...props}
    />
  )
}

function SidebarMenuSubButton({
  asChild = false,
  size = "md",
  isActive = false,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean
  size?: "sm" | "md"
  isActive?: boolean
}) {
  const Comp = asChild ? Slot : "a"

  return (
    <Comp
      data-slot="sidebar-menu-sub-button"
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        "ec:text-sidebar-foreground ec:ring-sidebar-ring ec:hover:bg-sidebar-accent ec:hover:text-sidebar-accent-foreground ec:active:bg-sidebar-accent ec:active:text-sidebar-accent-foreground ec:[&>svg]:text-sidebar-accent-foreground ec:flex ec:h-7 ec:min-w-0 ec:-translate-x-px ec:items-center ec:gap-2 ec:overflow-hidden ec:rounded-md ec:px-2 ec:outline-hidden ec:focus-visible:ring-2 ec:disabled:pointer-events-none ec:disabled:opacity-50 ec:aria-disabled:pointer-events-none ec:aria-disabled:opacity-50 ec:[&>span:last-child]:truncate ec:[&>svg]:size-4 ec:[&>svg]:shrink-0",
        "ec:data-[active=true]:bg-sidebar-accent ec:data-[active=true]:text-sidebar-accent-foreground",
        size === "sm" && "ec:text-xs",
        size === "md" && "ec:text-sm",
        "ec:group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
}
