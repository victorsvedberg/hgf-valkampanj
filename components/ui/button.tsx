import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-base font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-95",
  {
    variants: {
      variant: {
        default:
          "bg-hgf-blue border-2 border-hgf-blue text-white hover:bg-hgf-blue-dark hover:border-hgf-blue-dark focus-visible:ring-hgf-blue rounded-[2em]",
        red:
          "bg-hgf-red border-2 border-hgf-red text-white hover:bg-hgf-red-dark hover:border-hgf-red-dark focus-visible:ring-hgf-red rounded-[2em]",
        outline:
          "border-2 border-hgf-blue text-hgf-blue bg-transparent hover:bg-hgf-blue-dark hover:border-hgf-blue-dark hover:text-white focus-visible:ring-hgf-blue rounded-[2em]",
        "outline-white":
          "border-2 border-white text-white bg-transparent hover:bg-white hover:border-white hover:text-hgf-red focus-visible:ring-white rounded-[2em]",
        white:
          "bg-white border-2 border-white text-hgf-red hover:bg-white/90 hover:border-white/90 focus-visible:ring-white rounded-[2em]",
        ghost:
          "text-hgf-black hover:bg-hgf-neutral/50 focus-visible:ring-hgf-black rounded-lg",
        link: "text-hgf-blue underline-offset-4 hover:underline",
      },
      size: {
        default: "py-3 px-5",
        sm: "py-2 px-4 text-sm",
        lg: "py-4 px-8 text-lg",
        icon: "h-12 w-12 rounded-full",
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
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Laddar...
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
