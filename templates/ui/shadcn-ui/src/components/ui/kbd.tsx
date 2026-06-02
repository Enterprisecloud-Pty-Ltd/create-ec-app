import { cn } from "@/lib/utils"

function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "ec:bg-muted ec:text-muted-foreground ec:pointer-events-none ec:inline-flex ec:h-5 ec:w-fit ec:min-w-5 ec:items-center ec:justify-center ec:gap-1 ec:rounded-sm ec:px-1 ec:font-sans ec:text-xs ec:font-medium ec:select-none",
        "ec:[&_svg:not([class*='size-'])]:size-3",
        "ec:[[data-slot=tooltip-content]_&]:bg-background/20 ec:[[data-slot=tooltip-content]_&]:text-background ec:dark:[[data-slot=tooltip-content]_&]:bg-background/10",
        className
      )}
      {...props}
    />
  )
}

function KbdGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <kbd
      data-slot="kbd-group"
      className={cn("ec:inline-flex ec:items-center ec:gap-1", className)}
      {...props}
    />
  )
}

export { Kbd, KbdGroup }
