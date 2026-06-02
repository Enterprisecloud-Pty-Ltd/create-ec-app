import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "ec:border-input ec:placeholder:text-muted-foreground ec:focus-visible:border-ring ec:focus-visible:ring-ring/50 ec:aria-invalid:ring-destructive/20 ec:dark:aria-invalid:ring-destructive/40 ec:aria-invalid:border-destructive ec:dark:bg-input/30 ec:flex ec:field-sizing-content ec:min-h-16 ec:w-full ec:rounded-md ec:border ec:bg-transparent ec:px-3 ec:py-2 ec:text-base ec:shadow-xs ec:transition-[color,box-shadow] ec:outline-none ec:focus-visible:ring-[3px] ec:disabled:cursor-not-allowed ec:disabled:opacity-50 ec:md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
