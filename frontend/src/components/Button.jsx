export default function Button({
    children,
    type = "button",
    variant = "primary",
    className = "",
    ...props
  }) {
    const base =
      "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition " +
      "focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
    const styles = {
      primary: "bg-slate-900 text-white hover:bg-slate-800",
      ghost: "bg-transparent text-slate-900 hover:bg-slate-100",
      danger: "bg-red-600 text-white hover:bg-red-700",
    };
  
    return (
      <button
        type={type}
        className={`${base} ${styles[variant] || styles.primary} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
  