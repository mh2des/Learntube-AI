import * as React from "react"

import { cn } from "@/lib/utils"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-[16px] border border-border p-6 shadow-sm transition-all duration-200 ease-out",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "flex flex-col gap-1.5",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="card-title"
      className={cn(
        "text-lg font-semibold leading-tight tracking-tight",
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground leading-relaxed", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "flex items-center gap-2",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center gap-4 pt-2", className)}
      {...props}
    />
  )
}

// Interactive card variant with hover effects
function CardInteractive({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-interactive"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-[16px] border border-border p-6 shadow-sm",
        "transition-all duration-200 ease-out cursor-pointer",
        "hover:border-border-strong hover:shadow-md hover:-translate-y-0.5",
        "active:scale-[0.99]",
        className
      )}
      {...props}
    />
  )
}

// Glass card variant for overlays
function CardGlass({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-glass"
      className={cn(
        "flex flex-col gap-6 rounded-[16px] border border-border p-6",
        "bg-card/80 backdrop-blur-xl",
        "shadow-lg",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  CardInteractive,
  CardGlass,
}
