import React from "react";
import { useEffect } from "react";
import { cn } from "../../lib/utils";

/**
 * Modal component with Solar Brutalism design
 * Props:
 * - open (bool) - Controls visibility
 * - onClose (fn) - Close handler
 * - title (string) - Modal title
 * - description (string, optional) - Modal description
 * - children - Modal content
 * - className (string, optional) - Additional classes for content
 * - maxWidth (string, optional) - Max width class (default: 'max-w-2xl')
 */
export default function Modal({ 
  open, 
  onClose, 
  title, 
  description,
  children, 
  className,
  maxWidth = "max-w-2xl"
}) {
  // Prevent scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  // Close on ESC key
  useEffect(() => {
    if (!open) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-[4px] animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Content */}
      <div 
        className={cn(
          "relative z-10 w-full border-[4px] border-black bg-white p-8 shadow-[12px_12px_0px_0px_#FF00FF]",
          "animate-in zoom-in-95 fade-in duration-200",
          maxWidth,
          className
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b-[3px] border-black pb-4">
          <div className="flex-1">
            <h3 id="modal-title" className="text-2xl font-bold uppercase text-black">
              {title}
            </h3>
            {description && (
              <p className="mt-2 text-sm font-medium text-black">
                {description}
              </p>
            )}
          </div>

          {/* Close button */}
          <button
            aria-label="Close modal"
            onClick={onClose}
            className={cn(
              "flex h-10 w-10 items-center justify-center",
              "border-[3px] border-black bg-[#FF0000] text-white font-bold text-lg",
              "shadow-[3px_3px_0px_0px_#000000] transition-all",
              "hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#000000]",
              "active:translate-x-[3px] active:translate-y-[3px] active:shadow-[0px_0px_0px_0px_#000000]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
            )}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

// Optional: Modal footer component for consistent button layouts
export function ModalFooter({ children, className }) {
  return (
    <div className={cn("mt-6 flex flex-col-reverse gap-3 border-t-[3px] border-black pt-6 sm:flex-row sm:justify-end", className)}>
      {children}
    </div>
  );
}