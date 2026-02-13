import { Link } from "react-router-dom";
import { Home, Sun, AlertCircle } from "lucide-react";
import { useEffect } from "react";

export default function NotFound() {
  useEffect(() => {
    document.title = "Not Found";
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FFF500] p-6">
      {/* Simplified background patterns */}
      <div className="fixed inset-0 -z-10">
        {/* Subtle diagonal stripes */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute h-full w-[60px] bg-black"
              style={{
                left: `${i * 100}px`,
                transform: 'rotate(45deg)',
                transformOrigin: 'top left',
              }}
            />
          ))}
        </div>

        {/* Subtle dots pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle, #000000 2px, transparent 2px)',
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Centered content */}
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-lg">
          {/* Logo at top */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-3 border-[4px] border-black bg-white p-4 shadow-[6px_6px_0px_0px_#000000]">
              <div className="flex h-12 w-12 items-center justify-center border-[3px] border-black bg-[#FFF500]">
                <Sun className="h-7 w-7 text-black" />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold uppercase tracking-tight text-black">
                  Solar Notes
                </h1>
              </div>
            </div>
          </div>

          {/* 404 Card */}
          <div className="border-[4px] border-black bg-white p-8 shadow-[8px_8px_0px_0px_#000000] text-center">
            {/* 404 Icon */}
            <div className="mb-6 flex justify-center">
              <div className="flex h-24 w-24 items-center justify-center border-[4px] border-black bg-[#FFE5B4]">
                <AlertCircle className="h-12 w-12 text-black" />
              </div>
            </div>

            {/* 404 Number - Large and bold */}
            <div className="mb-4">
              <h2 className="text-8xl font-bold uppercase text-black" style={{ lineHeight: '1' }}>
                404
              </h2>
            </div>

            {/* Message */}
            <div className="mb-6 border-t-[3px] border-black pt-6">
              <h3 className="text-2xl font-bold uppercase text-black mb-2">
                Page Not Found
              </h3>
              <p className="text-sm font-medium text-black/70">
                The page you're looking for doesn't exist or has been moved.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center border-t-[3px] border-black pt-6">
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-2 border-[3px] border-black bg-black px-6 py-3 font-bold uppercase text-[#FFF500] shadow-[5px_5px_0px_0px_#FFF500] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_#FFF500] active:translate-x-[5px] active:translate-y-[5px] active:shadow-[0px_0px_0px_0px_#FFF500]"
              >
                <Home className="h-4 w-4" />
                Go to Dashboard
              </Link>

              <Link
                to="/auth"
                className="inline-flex items-center justify-center gap-2 border-[3px] border-black bg-white px-6 py-3 font-bold uppercase text-black shadow-[5px_5px_0px_0px_#000000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_#000000] active:translate-x-[5px] active:translate-y-[5px] active:shadow-[0px_0px_0px_0px_#000000]"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Helpful tip at bottom */}
          <div className="mt-6 border-[3px] border-black bg-[#B4E4FF] p-4 shadow-[4px_4px_0px_0px_#000000]">
            <p className="text-center text-xs font-bold uppercase text-black">
              💡 Try checking the URL or use the navigation above
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}