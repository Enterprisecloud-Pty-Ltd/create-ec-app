import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("ec:bg-accent ec:animate-pulse ec:rounded-md", className)}
      {...props}
    />
  )
}

export { Skeleton }
