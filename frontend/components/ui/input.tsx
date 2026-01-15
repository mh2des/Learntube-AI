import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base styles
        "flex h-10 w-full rounded-[12px] border border-border bg-background px-4 py-2 text-sm",
        // Placeholder
        "placeholder:text-muted-foreground",
        // Focus states
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background focus:border-transparent",
        // Transitions
        "transition-all duration-200 ease-out",
        // Hover
        "hover:border-border-strong",
        // File input styling
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        // Disabled state
        "disabled:cursor-not-allowed disabled:opacity-50",
        // Invalid state
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    />
  )
}

// Textarea component with same styling
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // Base styles
        "flex min-h-[120px] w-full rounded-[12px] border border-border bg-background px-4 py-3 text-sm",
        // Placeholder
        "placeholder:text-muted-foreground",
        // Focus states
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background focus:border-transparent",
        // Transitions
        "transition-all duration-200 ease-out",
        // Hover
        "hover:border-border-strong",
        // Disabled state
        "disabled:cursor-not-allowed disabled:opacity-50",
        // Invalid state
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        // Resize
        "resize-none",
        className
      )}
      {...props}
    />
  )
}

export { Input, Textarea }
