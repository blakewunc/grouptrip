import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils/cn"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[5px] text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#70798C] focus-visible:ring-opacity-20 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        default: "bg-[#70798C] text-white hover:bg-[#5A6270] active:bg-[#4A505C]",
        outline: "border border-[#252323] bg-transparent text-[#252323] hover:bg-[#F5F1ED]",
        secondary: "bg-[#DAD2BC] text-[#252323] hover:bg-[#CEC5B0]",
        ghost: "text-[#252323] hover:bg-[#F5F1ED]",
        link: "text-[#252323] underline-offset-4 hover:underline hover:text-[#70798C]",
        destructive: "bg-[#8B4444] text-white hover:bg-[#734040]",
      },
      size: {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 px-4 py-2 text-sm",
        lg: "h-13 px-8 py-3 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
