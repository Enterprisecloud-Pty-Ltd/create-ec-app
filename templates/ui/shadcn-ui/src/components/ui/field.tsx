import { useMemo } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

function FieldSet({ className, ...props }: React.ComponentProps<"fieldset">) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn(
        "ec:flex ec:flex-col ec:gap-6",
        "ec:has-[>[data-slot=checkbox-group]]:gap-3 ec:has-[>[data-slot=radio-group]]:gap-3",
        className
      )}
      {...props}
    />
  )
}

function FieldLegend({
  className,
  variant = "legend",
  ...props
}: React.ComponentProps<"legend"> & { variant?: "legend" | "label" }) {
  return (
    <legend
      data-slot="field-legend"
      data-variant={variant}
      className={cn(
        "ec:mb-3 ec:font-medium",
        "ec:data-[variant=legend]:text-base",
        "ec:data-[variant=label]:text-sm",
        className
      )}
      {...props}
    />
  )
}

function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-group"
      className={cn(
        "ec:group/field-group ec:@container/field-group ec:flex ec:w-full ec:flex-col ec:gap-7 ec:data-[slot=checkbox-group]:gap-3 ec:[&>[data-slot=field-group]]:gap-4",
        className
      )}
      {...props}
    />
  )
}

const fieldVariants = cva(
  "ec:group/field ec:flex ec:w-full ec:gap-3 ec:data-[invalid=true]:text-destructive",
  {
    variants: {
      orientation: {
        vertical: ["ec:flex-col ec:[&>*]:w-full ec:[&>.sr-only]:w-auto"],
        horizontal: [
          "ec:flex-row ec:items-center",
          "ec:[&>[data-slot=field-label]]:flex-auto",
          "ec:has-[>[data-slot=field-content]]:items-start ec:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
        ],
        responsive: [
          "ec:flex-col ec:[&>*]:w-full ec:[&>.sr-only]:w-auto ec:@md/field-group:flex-row ec:@md/field-group:items-center ec:@md/field-group:[&>*]:w-auto",
          "ec:@md/field-group:[&>[data-slot=field-label]]:flex-auto",
          "ec:@md/field-group:has-[>[data-slot=field-content]]:items-start ec:@md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
        ],
      },
    },
    defaultVariants: {
      orientation: "vertical",
    },
  }
)

function Field({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof fieldVariants>) {
  return (
    <div
      role="group"
      data-slot="field"
      data-orientation={orientation}
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  )
}

function FieldContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-content"
      className={cn(
        "ec:group/field-content ec:flex ec:flex-1 ec:flex-col ec:gap-1.5 ec:leading-snug",
        className
      )}
      {...props}
    />
  )
}

function FieldLabel({
  className,
  ...props
}: React.ComponentProps<typeof Label>) {
  return (
    <Label
      data-slot="field-label"
      className={cn(
        "ec:group/field-label ec:peer/field-label ec:flex ec:w-fit ec:gap-2 ec:leading-snug ec:group-data-[disabled=true]/field:opacity-50",
        "ec:has-[>[data-slot=field]]:w-full ec:has-[>[data-slot=field]]:flex-col ec:has-[>[data-slot=field]]:rounded-md ec:has-[>[data-slot=field]]:border ec:[&>*]:data-[slot=field]:p-4",
        "ec:has-data-[state=checked]:bg-primary/5 ec:has-data-[state=checked]:border-primary ec:dark:has-data-[state=checked]:bg-primary/10",
        className
      )}
      {...props}
    />
  )
}

function FieldTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-label"
      className={cn(
        "ec:flex ec:w-fit ec:items-center ec:gap-2 ec:text-sm ec:leading-snug ec:font-medium ec:group-data-[disabled=true]/field:opacity-50",
        className
      )}
      {...props}
    />
  )
}

function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-description"
      className={cn(
        "ec:text-muted-foreground ec:text-sm ec:leading-normal ec:font-normal ec:group-has-[[data-orientation=horizontal]]/field:text-balance",
        "ec:last:mt-0 ec:nth-last-2:-mt-1 ec:[[data-variant=legend]+&]:-mt-1.5",
        "ec:[&>a:hover]:text-primary ec:[&>a]:underline ec:[&>a]:underline-offset-4",
        className
      )}
      {...props}
    />
  )
}

function FieldSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  children?: React.ReactNode
}) {
  return (
    <div
      data-slot="field-separator"
      data-content={!!children}
      className={cn(
        "ec:relative ec:-my-2 ec:h-5 ec:text-sm ec:group-data-[variant=outline]/field-group:-mb-2",
        className
      )}
      {...props}
    >
      <Separator className="ec:absolute ec:inset-0 ec:top-1/2" />
      {children && (
        <span
          className="ec:bg-background ec:text-muted-foreground ec:relative ec:mx-auto ec:block ec:w-fit ec:px-2"
          data-slot="field-separator-content"
        >
          {children}
        </span>
      )}
    </div>
  )
}

function FieldError({
  className,
  children,
  errors,
  ...props
}: React.ComponentProps<"div"> & {
  errors?: Array<{ message?: string } | undefined>
}) {
  const content = useMemo(() => {
    if (children) {
      return children
    }

    if (!errors?.length) {
      return null
    }

    const uniqueErrors = [
      ...new Map(errors.map((error) => [error?.message, error])).values(),
    ]

    if (uniqueErrors?.length == 1) {
      return uniqueErrors[0]?.message
    }

    return (
      <ul className="ec:ml-4 ec:flex ec:list-disc ec:flex-col ec:gap-1">
        {uniqueErrors.map(
          (error, index) =>
            error?.message && <li key={index}>{error.message}</li>
        )}
      </ul>
    )
  }, [children, errors])

  if (!content) {
    return null
  }

  return (
    <div
      role="alert"
      data-slot="field-error"
      className={cn("ec:text-destructive ec:text-sm ec:font-normal", className)}
      {...props}
    >
      {content}
    </div>
  )
}

export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldContent,
  FieldTitle,
}
