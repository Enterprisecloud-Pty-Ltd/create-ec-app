import * as React from "react"
import { GripVerticalIcon } from "lucide-react"
import * as ResizablePrimitive from "react-resizable-panels"

import { cn } from "@/lib/utils"

function ResizablePanelGroup({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) {
  return (
    <ResizablePrimitive.PanelGroup
      data-slot="resizable-panel-group"
      className={cn(
        "ec:flex ec:h-full ec:w-full ec:data-[panel-group-direction=vertical]:flex-col",
        className
      )}
      {...props}
    />
  )
}

function ResizablePanel({
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.Panel>) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean
}) {
  return (
    <ResizablePrimitive.PanelResizeHandle
      data-slot="resizable-handle"
      className={cn(
        "ec:bg-border ec:focus-visible:ring-ring ec:relative ec:flex ec:w-px ec:items-center ec:justify-center ec:after:absolute ec:after:inset-y-0 ec:after:left-1/2 ec:after:w-1 ec:after:-translate-x-1/2 ec:focus-visible:ring-1 ec:focus-visible:ring-offset-1 ec:focus-visible:outline-hidden ec:data-[panel-group-direction=vertical]:h-px ec:data-[panel-group-direction=vertical]:w-full ec:data-[panel-group-direction=vertical]:after:left-0 ec:data-[panel-group-direction=vertical]:after:h-1 ec:data-[panel-group-direction=vertical]:after:w-full ec:data-[panel-group-direction=vertical]:after:translate-x-0 ec:data-[panel-group-direction=vertical]:after:-translate-y-1/2 ec:[&[data-panel-group-direction=vertical]>div]:rotate-90",
        className
      )}
      {...props}
    >
      {withHandle && (
        <div className="ec:bg-border ec:z-10 ec:flex ec:h-4 ec:w-3 ec:items-center ec:justify-center ec:rounded-xs ec:border">
          <GripVerticalIcon className="ec:size-2.5" />
        </div>
      )}
    </ResizablePrimitive.PanelResizeHandle>
  )
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
