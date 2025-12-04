import React from "react";
import { cn } from "@/lib/utils";

type AnimationType =
    | "fade-in"
    | "slide-in-up"
    | "scale-in"
    | "accordion-down"
    | "accordion-up"
    | "none";

interface AnimationWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
    animation?: AnimationType;
    duration?: "default" | "fast" | "slow" | "none";
    delay?: "none" | "short" | "medium" | "long";
    children: React.ReactNode;
    asChild?: boolean;
}

export function AnimationWrapper({
    animation = "fade-in",
    duration = "default",
    delay = "none",
    className,
    children,
    ...props
}: AnimationWrapperProps) {
    const durationClass = {
        default: "duration-500",
        fast: "duration-300",
        slow: "duration-700",
        none: "duration-0",
    }[duration];

    const delayClass = {
        none: "delay-0",
        short: "delay-100",
        medium: "delay-300",
        long: "delay-500",
    }[delay];

    return (
        <div
            className={cn(
                `animate-${animation}`,
                durationClass,
                delayClass,
                "fill-mode-forwards",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
