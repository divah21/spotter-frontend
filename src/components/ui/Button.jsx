import * as React from "react"
import { cn } from "@/lib/utils"

const Button = React.forwardRef(
  ({ className, variant = "default", size = "default", children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
    
    const variants = {
      default: "bg-[#053E4F] text-white hover:bg-[#042f3d] shadow-md hover:shadow-lg",
      outline: "border-2 border-[#053E4F] text-[#053E4F] hover:bg-[#053E4F] hover:text-white",
      ghost: "hover:bg-slate-100 text-slate-900",
      secondary: "bg-[#AEC3DD] text-[#053E4F] hover:bg-[#9ab3d0]",
      destructive: "bg-red-500 text-white hover:bg-red-600",
    }
    
    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-8 px-3 text-xs",
      lg: "h-12 px-8 text-base",
      icon: "h-10 w-10",
    }
    
    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }
