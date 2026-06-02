import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  // Sonner 2.0.7 renders in place and does not expose a portal container prop.
  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster ec:group"
      icons={{
        success: <CircleCheckIcon className="ec:size-4" />,
        info: <InfoIcon className="ec:size-4" />,
        warning: <TriangleAlertIcon className="ec:size-4" />,
        error: <OctagonXIcon className="ec:size-4" />,
        loading: <Loader2Icon className="ec:size-4 ec:animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
