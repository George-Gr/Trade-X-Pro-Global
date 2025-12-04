import { Shield, Lock, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrustBadgeProps {
    className?: string;
    variant?: "dark" | "light";
}

export function TrustBadge({ className, variant = "dark" }: TrustBadgeProps) {
    return (
        <div className={cn("flex flex-wrap items-center gap-4 py-4", className)}>
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Shield className="h-4 w-4 text-emerald-500" />
                <span>Bank-Grade Security</span>
            </div>
            <div className="hidden h-4 w-px bg-border sm:block" />
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Lock className="h-4 w-4 text-emerald-500" />
                <span>256-bit Encryption</span>
            </div>
            <div className="hidden h-4 w-px bg-border sm:block" />
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span>GDPR Compliant</span>
            </div>
        </div>
    );
}
