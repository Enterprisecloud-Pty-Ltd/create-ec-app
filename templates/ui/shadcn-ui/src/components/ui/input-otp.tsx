import * as React from "react"
import { OTPInput, OTPInputContext } from "input-otp"
import { MinusIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string
}) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        "ec:flex ec:items-center ec:gap-2 ec:has-disabled:opacity-50",
        containerClassName
      )}
      className={cn("ec:disabled:cursor-not-allowed", className)}
      {...props}
    />
  )
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn("ec:flex ec:items-center", className)}
      {...props}
    />
  )
}

function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  index: number
}) {
  const inputOTPContext = React.useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {}

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        "ec:data-[active=true]:border-ring ec:data-[active=true]:ring-ring/50 ec:data-[active=true]:aria-invalid:ring-destructive/20 ec:dark:data-[active=true]:aria-invalid:ring-destructive/40 ec:aria-invalid:border-destructive ec:data-[active=true]:aria-invalid:border-destructive ec:dark:bg-input/30 ec:border-input ec:relative ec:flex ec:h-9 ec:w-9 ec:items-center ec:justify-center ec:border-y ec:border-r ec:text-sm ec:shadow-xs ec:transition-all ec:outline-none ec:first:rounded-l-md ec:first:border-l ec:last:rounded-r-md ec:data-[active=true]:z-10 ec:data-[active=true]:ring-[3px]",
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="ec:pointer-events-none ec:absolute ec:inset-0 ec:flex ec:items-center ec:justify-center">
          <div className="ec:animate-caret-blink ec:bg-foreground ec:h-4 ec:w-px ec:duration-1000" />
        </div>
      )}
    </div>
  )
}

function InputOTPSeparator({ ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="input-otp-separator" role="separator" {...props}>
      <MinusIcon />
    </div>
  )
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
