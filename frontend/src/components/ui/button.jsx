import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold uppercase transition-all " +
    "focus-visible:outline-none border-[3px] border-black " +
    "disabled:pointer-events-none disabled:opacity-50 active:translate-x-[5px] active:translate-y-[5px]",
  {
    variants: {
      variant: {
        default: 
          "bg-black text-[#FFF500] shadow-[5px_5px_0px_0px_#FF00FF] " +
          "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_#FF00FF] " +
          "active:shadow-[0px_0px_0px_0px_#FF00FF]",
        secondary: 
          "bg-white text-black shadow-[5px_5px_0px_0px_#FFF500] " +
          "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_#FFF500] " +
          "active:shadow-[0px_0px_0px_0px_#FFF500]",
        outline: 
          "bg-white text-black shadow-[5px_5px_0px_0px_#000000] " +
          "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_#000000] " +
          "active:shadow-[0px_0px_0px_0px_#000000]",
        ghost: 
          "bg-transparent text-black shadow-none border-[3px] border-transparent " +
          "hover:bg-[#FFF500] hover:border-black",
        destructive: 
          "bg-[#FF0000] text-white shadow-[5px_5px_0px_0px_#000000] " +
          "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_#000000] " +
          "active:shadow-[0px_0px_0px_0px_#000000]",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 px-4 py-2",
        lg: "h-14 px-8 py-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants };