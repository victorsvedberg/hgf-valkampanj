import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const generatedId = React.useId();
    const checkboxId = id || generatedId;

    return (
      <div className="flex items-start gap-3">
        <div className="relative flex items-center">
          <input
            type="checkbox"
            id={checkboxId}
            className="peer sr-only"
            ref={ref}
            aria-invalid={error ? "true" : "false"}
            {...props}
          />
          <div
            className={cn(
              "h-5 w-5 rounded border-2 border-hgf-neutral bg-white transition-colors duration-200 cursor-pointer",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-hgf-blue/20 peer-focus-visible:border-hgf-blue",
              "peer-checked:bg-hgf-blue peer-checked:border-hgf-blue",
              "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
              error && "border-red-500",
              className
            )}
          >
            <Check className="h-full w-full text-white opacity-0 peer-checked:opacity-100 transition-opacity p-0.5" />
          </div>
          <label
            htmlFor={checkboxId}
            className="absolute inset-0 cursor-pointer"
          />
        </div>
        {label && (
          <label
            htmlFor={checkboxId}
            className={cn(
              "text-sm text-hgf-black cursor-pointer select-none",
              error && "text-red-600"
            )}
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
