"use client"

import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import { DayButton, DayPicker, getDefaultClassNames } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "ec:bg-background ec:group/calendar ec:p-3 ec:[--cell-size:--spacing(8)] ec:[[data-slot=card-content]_&]:bg-transparent ec:[[data-slot=popover-content]_&]:bg-transparent",
        String.raw`ec:rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`ec:rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("ec:w-fit", defaultClassNames.root),
        months: cn(
          "ec:flex ec:gap-4 ec:flex-col ec:md:flex-row ec:relative",
          defaultClassNames.months
        ),
        month: cn("ec:flex ec:flex-col ec:w-full ec:gap-4", defaultClassNames.month),
        nav: cn(
          "ec:flex ec:items-center ec:gap-1 ec:w-full ec:absolute ec:top-0 ec:inset-x-0 ec:justify-between",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "ec:size-(--cell-size) ec:aria-disabled:opacity-50 ec:p-0 ec:select-none",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "ec:size-(--cell-size) ec:aria-disabled:opacity-50 ec:p-0 ec:select-none",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "ec:flex ec:items-center ec:justify-center ec:h-(--cell-size) ec:w-full ec:px-(--cell-size)",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "ec:w-full ec:flex ec:items-center ec:text-sm ec:font-medium ec:justify-center ec:h-(--cell-size) ec:gap-1.5",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "ec:relative ec:has-focus:border-ring ec:border ec:border-input ec:shadow-xs ec:has-focus:ring-ring/50 ec:has-focus:ring-[3px] ec:rounded-md",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "ec:absolute ec:bg-popover ec:inset-0 ec:opacity-0",
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          "ec:select-none ec:font-medium",
          captionLayout === "label"
            ? "ec:text-sm"
            : "ec:rounded-md ec:pl-2 ec:pr-1 ec:flex ec:items-center ec:gap-1 ec:text-sm ec:h-8 ec:[&>svg]:text-muted-foreground ec:[&>svg]:size-3.5",
          defaultClassNames.caption_label
        ),
        table: "ec:w-full ec:border-collapse",
        weekdays: cn("ec:flex", defaultClassNames.weekdays),
        weekday: cn(
          "ec:text-muted-foreground ec:rounded-md ec:flex-1 ec:font-normal ec:text-[0.8rem] ec:select-none",
          defaultClassNames.weekday
        ),
        week: cn("ec:flex ec:w-full ec:mt-2", defaultClassNames.week),
        week_number_header: cn(
          "ec:select-none ec:w-(--cell-size)",
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          "ec:text-[0.8rem] ec:select-none ec:text-muted-foreground",
          defaultClassNames.week_number
        ),
        day: cn(
          "ec:relative ec:w-full ec:h-full ec:p-0 ec:text-center ec:[&:last-child[data-selected=true]_button]:rounded-r-md ec:group/day ec:aspect-square ec:select-none",
          props.showWeekNumber
            ? "ec:[&:nth-child(2)[data-selected=true]_button]:rounded-l-md"
            : "ec:[&:first-child[data-selected=true]_button]:rounded-l-md",
          defaultClassNames.day
        ),
        range_start: cn(
          "ec:rounded-l-md ec:bg-accent",
          defaultClassNames.range_start
        ),
        range_middle: cn("ec:rounded-none", defaultClassNames.range_middle),
        range_end: cn("ec:rounded-r-md ec:bg-accent", defaultClassNames.range_end),
        today: cn(
          "ec:bg-accent ec:text-accent-foreground ec:rounded-md ec:data-[selected=true]:rounded-none",
          defaultClassNames.today
        ),
        outside: cn(
          "ec:text-muted-foreground ec:aria-selected:text-muted-foreground",
          defaultClassNames.outside
        ),
        disabled: cn(
          "ec:text-muted-foreground ec:opacity-50",
          defaultClassNames.disabled
        ),
        hidden: cn("ec:invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          )
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon className={cn("ec:size-4", className)} {...props} />
            )
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon
                className={cn("ec:size-4", className)}
                {...props}
              />
            )
          }

          return (
            <ChevronDownIcon className={cn("ec:size-4", className)} {...props} />
          )
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="ec:flex ec:size-(--cell-size) ec:items-center ec:justify-center ec:text-center">
                {children}
              </div>
            </td>
          )
        },
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "ec:data-[selected-single=true]:bg-primary ec:data-[selected-single=true]:text-primary-foreground ec:data-[range-middle=true]:bg-accent ec:data-[range-middle=true]:text-accent-foreground ec:data-[range-start=true]:bg-primary ec:data-[range-start=true]:text-primary-foreground ec:data-[range-end=true]:bg-primary ec:data-[range-end=true]:text-primary-foreground ec:group-data-[focused=true]/day:border-ring ec:group-data-[focused=true]/day:ring-ring/50 ec:dark:hover:text-accent-foreground ec:flex ec:aspect-square ec:size-auto ec:w-full ec:min-w-(--cell-size) ec:flex-col ec:gap-1 ec:leading-none ec:font-normal ec:group-data-[focused=true]/day:relative ec:group-data-[focused=true]/day:z-10 ec:group-data-[focused=true]/day:ring-[3px] ec:data-[range-end=true]:rounded-md ec:data-[range-end=true]:rounded-r-md ec:data-[range-middle=true]:rounded-none ec:data-[range-start=true]:rounded-md ec:data-[range-start=true]:rounded-l-md ec:[&>span]:text-xs ec:[&>span]:opacity-70",
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
