import * as React from "react";
import { cn } from "../../lib/utils";

const Input = React.forwardRef(({ className, type, error, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-12 w-full border-[3px] border-black bg-white px-4 py-3 text-base font-medium " +
          "shadow-[4px_4px_0px_0px_#FFF500] transition-all " +
          "placeholder:text-black placeholder:opacity-50 " +
          "focus:outline-none focus:border-[#FF00FF] focus:shadow-[4px_4px_0px_0px_#FF00FF] " +
          "disabled:cursor-not-allowed disabled:opacity-50 " +
          "file:border-0 file:bg-transparent file:text-sm file:font-bold file:text-black",
        error && "border-[#FF0000] shadow-[4px_4px_0px_0px_#FF0000]",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };