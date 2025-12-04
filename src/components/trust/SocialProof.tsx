import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

export function SocialProof({ className }: { className?: string }) {
    return (
        <div className={cn("flex flex-col gap-2", className)}>
            <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                    {/* Placeholder avatars - replace with real images or initials */}
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-blue-500 text-[10px] font-bold text-white">JD</div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-green-500 text-[10px] font-bold text-white">AS</div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-purple-500 text-[10px] font-bold text-white">MK</div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-bold text-muted-foreground">+2k</div>
                </div>
                <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Star key={i} className="h-3 w-3 fill-gold text-gold" />
                        ))}
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                        Trusted by <span className="text-foreground font-bold">50,000+</span> Traders
                    </span>
                </div>
            </div>
        </div>
    );
}
