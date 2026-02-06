import * as React from "react";
import { cn } from "../../lib/utils";

const Alert = React.forwardRef(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "bg-white text-black border-black",
    destructive: "bg-[#FF0000] text-white border-black",
    success: "bg-[#00FF00] text-black border-black",
    warning: "bg-[#FFA500] text-black border-black",
  };

  return (
    <div
      ref={ref}
      role="alert"
      className={cn(
        "relative w-full border-[3px] px-4 py-4 text-sm font-bold shadow-[6px_6px_0px_0px_#000000]",
        variants[variant] || variants.default,
        className
      )}
      {...props}
    />
  );
});
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h5 
    ref={ref} 
    className={cn("mb-2 font-bold uppercase leading-none tracking-tight text-base", className)} 
    {...props} 
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn("text-sm font-medium [&_p]:leading-relaxed", className)} 
    {...props} 
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };