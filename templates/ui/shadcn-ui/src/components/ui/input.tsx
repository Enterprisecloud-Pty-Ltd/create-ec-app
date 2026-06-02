import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "ec:file:text-foreground ec:placeholder:text-muted-foreground ec:selection:bg-primary ec:selection:text-primary-foreground ec:dark:bg-input/30 ec:border-input ec:h-9 ec:w-full ec:min-w-0 ec:rounded-md ec:border ec:bg-transparent ec:px-3 ec:py-1 ec:text-base ec:shadow-xs ec:transition-[color,box-shadow] ec:outline-none ec:file:inline-flex ec:file:h-7 ec:file:border-0 ec:file:bg-transparent ec:file:text-sm ec:file:font-medium ec:disabled:pointer-events-none ec:disabled:cursor-not-allowed ec:disabled:opacity-50 ec:md:text-sm",
        "ec:focus-visible:border-ring ec:focus-visible:ring-ring/50 ec:focus-visible:ring-[3px]",
        "ec:aria-invalid:ring-destructive/20 ec:dark:aria-invalid:ring-destructive/40 ec:aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
