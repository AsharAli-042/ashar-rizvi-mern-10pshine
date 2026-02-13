import React from "react";
import { cn } from "../lib/utils";

export default function Button({
  children,
  type = "button",
  variant = "primary",
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center px-6 py-3 text-sm font-bold uppercase transition-all " +
    "focus:outline-none border-[3px] border-black disabled:opacity-50 disabled:cursor-not-allowed " +
    "active:translate-x-[5px] active:translate-y-[5px]";

  const styles = {
    primary:
      "bg-black text-[#FFF500] shadow-[5px_5px_0px_0px_#FFF500] " +
      "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_#FFF500] " +
      "active:shadow-[0px_0px_0px_0px_#FFF500] disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[5px_5px_0px_0px_#FFF500]",
    
    secondary:
      "bg-white text-black shadow-[5px_5px_0px_0px_#000000] " +
      "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_#000000] " +
      "active:shadow-[0px_0px_0px_0px_#000000] disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[5px_5px_0px_0px_#000000]",
    
    ghost:
      "bg-transparent text-black shadow-none border-[3px] border-transparent " +
      "hover:bg-[#FFF500] hover:border-black " +
      "active:translate-x-0 active:translate-y-0",
    
    danger:
      "bg-[#FF0000] text-white shadow-[5px_5px_0px_0px_#000000] " +
      "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_#000000] " +
      "active:shadow-[0px_0px_0px_0px_#000000] disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[5px_5px_0px_0px_#000000]",
  };

  return (
    <button
      type={type}
      className={cn(base, styles[variant] || styles.primary, className)}
      {...props}
    >
      {children}
    </button>
  );
}