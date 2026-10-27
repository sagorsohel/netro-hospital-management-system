import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer shadow-sm active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:bg-primary-hover shadow-primary/20 focus-visible:ring-primary",
        secondary: "bg-secondary text-white hover:bg-secondary-hover shadow-secondary/20 focus-visible:ring-secondary",
        destructive: "bg-accent text-white hover:bg-accent-hover shadow-accent/20 focus-visible:ring-accent",
        outline: "border border-slate-300 bg-white hover:bg-cream/40 text-dark hover:text-secondary",
        ghost: "hover:bg-cream/50 text-dark hover:text-secondary shadow-none",
        cream: "bg-cream text-dark border border-amber-200/80 hover:bg-amber-100",
        link: "text-secondary underline-offset-4 hover:underline hover:text-primary shadow-none",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-11 rounded-xl px-6 text-base",
        icon: "h-9 w-9 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
