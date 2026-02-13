import { Sun } from "lucide-react";

export default function Loading({ label = "Loading..." }) {
  return (
    <div className="flex items-center justify-center gap-4 border-[4px] border-black bg-white p-6 shadow-[6px_6px_0px_0px_#FFF500]">
      {/* Spinning sun icon */}
      <div className="flex h-12 w-12 items-center justify-center border-[3px] border-black bg-[#FFF500]">
        <Sun className="h-7 w-7 animate-spin text-black" style={{ animationDuration: '2s' }} />
      </div>
      
      {/* Loading text */}
      <div className="text-base font-bold uppercase text-black">{label}</div>
    </div>
  );
}

export function SkeletonLoader({ count = 1 }) {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="border-[3px] border-black bg-white p-6 shadow-[6px_6px_0px_0px_#000000]"
        >
          {/* Animated stripes effect */}
          <div className="relative overflow-hidden">
            <div className="h-6 w-3/4 bg-black/10 mb-4" />
            <div className="h-4 w-full bg-black/10 mb-2" />
            <div className="h-4 w-5/6 bg-black/10 mb-2" />
            <div className="h-4 w-2/3 bg-black/10" />
            
            {/* Moving diagonal stripe animation */}
            <div 
              className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.1), transparent)',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}