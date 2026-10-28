import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          className={cn(
            "flex h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-dark placeholder:text-slate-400 focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50 transition-all cursor-pointer pr-9",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
