"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max]
  )

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "ec:relative ec:flex ec:w-full ec:touch-none ec:items-center ec:select-none ec:data-[disabled]:opacity-50 ec:data-[orientation=vertical]:h-full ec:data-[orientation=vertical]:min-h-44 ec:data-[orientation=vertical]:w-auto ec:data-[orientation=vertical]:flex-col",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          "ec:bg-muted ec:relative grow ec:overflow-hidden ec:rounded-full ec:data-[orientation=horizontal]:h-1.5 ec:data-[orientation=horizontal]:w-full ec:data-[orientation=vertical]:h-full ec:data-[orientation=vertical]:w-1.5"
        )}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            "ec:bg-primary ec:absolute ec:data-[orientation=horizontal]:h-full ec:data-[orientation=vertical]:w-full"
          )}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className="ec:border-primary ec:ring-ring/50 ec:block ec:size-4 ec:shrink-0 ec:rounded-full ec:border ec:bg-white ec:shadow-sm ec:transition-[color,box-shadow] ec:hover:ring-4 ec:focus-visible:ring-4 ec:focus-visible:outline-hidden ec:disabled:pointer-events-none ec:disabled:opacity-50"
        />
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }
