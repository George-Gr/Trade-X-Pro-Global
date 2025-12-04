import * as React from "react"
import { cn } from "@/lib/utils"

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "hover" | "interactive"
    intensity?: "low" | "medium" | "high"
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
    ({ className, variant = "default", intensity = "medium", ...props }, ref) => {
        const intensityStyles = {
            low: "bg-background/40 backdrop-blur-sm border-white/5",
            medium: "bg-background/60 backdrop-blur-md border-white/10",
            high: "bg-background/80 backdrop-blur-lg border-white/20",
        }

        return (
            <div
                ref={ref}
                className={cn(
                    "rounded-lg border shadow-sm transition-all duration-300",
                    intensityStyles[intensity],
                    variant === "hover" && "hover:bg-background/70 hover:shadow-md hover:border-white/20",
                    variant === "interactive" && "cursor-pointer hover:scale-[1.02] active:scale-[0.98] hover:bg-background/70 hover:shadow-lg hover:border-primary/30",
                    className
                )}
                {...props}
            />
        )
    }
)
GlassCard.displayName = "GlassCard"

export { GlassCard }
