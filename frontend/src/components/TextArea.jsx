import React from "react";
import { cn } from "../lib/utils";

export default function TextArea({ label, error, className = "", rows = 4, ...props }) {
  return (
    <label className="block">
      {label ? (
        <div className="mb-2 text-sm font-bold uppercase text-black">{label}</div>
      ) : null}
      <textarea
        rows={rows}
        className={cn(
          "w-full border-[3px] border-black bg-white px-4 py-3 text-base font-medium",
          "shadow-[4px_4px_0px_0px_#FFF500] transition-all",
          "placeholder:text-black placeholder:opacity-50",
          "focus:outline-none focus:border-[#FF00FF] focus:shadow-[4px_4px_0px_0px_#FF00FF]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "resize-vertical min-h-[100px]",
          error && "border-[#FF0000] shadow-[4px_4px_0px_0px_#FF0000]",
          className
        )}
        {...props}
      />
      {error ? (
        <div className="mt-2 border-l-[4px] border-[#FF0000] bg-[#FF0000]/10 px-3 py-2">
          <p className="text-xs font-bold uppercase text-[#FF0000]">{error}</p>
        </div>
      ) : null}
    </label>
  );
}