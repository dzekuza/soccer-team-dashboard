"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[#0A165B] group-[.toaster]:text-white group-[.toaster]:border-gray-700 group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-white/90",
          actionButton:
            "group-[.toast]:bg-[#F15601] group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:bg-gray-600 group-[.toast]:text-white",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
