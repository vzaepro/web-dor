import { cn } from "@/lib/utils"

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  glow?: boolean
}

export function GlassCard({ children, className, glow = false, ...props }: GlassCardProps) {
  return (
    <div 
      className={cn(
        "glass-card rounded-lg p-6 transition-all duration-300 hover:scale-[1.02]",
        glow && "glow-effect",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}