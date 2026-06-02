import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Accordion({
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("ec:border-b ec:last:border-b-0", className)}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="ec:flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "ec:focus-visible:border-ring ec:focus-visible:ring-ring/50 ec:flex ec:flex-1 ec:items-start ec:justify-between ec:gap-4 ec:rounded-md ec:py-4 ec:text-left ec:text-sm ec:font-medium ec:transition-all ec:outline-none ec:hover:underline ec:focus-visible:ring-[3px] ec:disabled:pointer-events-none ec:disabled:opacity-50 ec:[&[data-state=open]>svg]:rotate-180",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon className="ec:text-muted-foreground ec:pointer-events-none ec:size-4 ec:shrink-0 ec:translate-y-0.5 ec:transition-transform ec:duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="ec:data-[state=closed]:animate-accordion-up ec:data-[state=open]:animate-accordion-down ec:overflow-hidden ec:text-sm"
      {...props}
    >
      <div className={cn("ec:pt-0 ec:pb-4", className)}>{children}</div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
