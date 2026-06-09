import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium tracking-wide transition-all active:scale-95 select-none",
  {
    variants: {
      variant: {
        gold:
          "bg-gradient-to-b from-[#F5E9C8] via-[#C9A961] to-[#9B7A3A] text-[#3C2E1A] shadow-[inset_0_1px_1px_rgba(255,255,255,.6),inset_0_-2px_4px_rgba(0,0,0,.15),0_8px_16px_rgba(155,122,58,.3)] border border-[#9B7A3A]/40",
        soft:
          "bg-white text-[#3A2E1E] shadow-[0_2px_8px_rgba(155,122,58,0.08)] border border-[#e8d9a8]/40 hover:shadow-md",
        ghost: "text-[#9B7A3A] hover:bg-[#F4ECDC]",
      },
      size: {
        sm: "h-9 px-3 text-sm rounded-lg",
        md: "h-11 px-5 text-sm rounded-xl",
        lg: "h-14 px-8 text-base rounded-2xl",
        pill: "h-12 px-10 text-base rounded-full tracking-[2px]",
      },
    },
    defaultVariants: { variant: "soft", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
);
Button.displayName = "Button";
