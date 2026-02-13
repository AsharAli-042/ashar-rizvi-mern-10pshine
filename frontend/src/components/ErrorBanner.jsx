import { AlertCircle, X } from "lucide-react";
import { useState } from "react";

export default function ErrorBanner({ message, onDismiss }) {
  const [isVisible, setIsVisible] = useState(true);

  if (!message || !isVisible) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) onDismiss();
  };

  return (
    <div className="border-[4px] border-black bg-[#FF0000] p-4 shadow-[6px_6px_0px_0px_#000000]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center border-[2px] border-black bg-white">
            <AlertCircle className="h-5 w-5 text-[#FF0000]" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold uppercase text-white">Error</h4>
            <p className="mt-1 text-sm font-medium text-white/90">{message}</p>
          </div>
        </div>

        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          aria-label="Dismiss error"
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center border-[2px] border-black bg-white text-black transition-all hover:bg-black hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}