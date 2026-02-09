import React from "react"

export function Button({
  children,
  className = "",
  variant = "default",
  size = "md",
  ...props
}) {

  /* ---------- VARIANTS ---------- */
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-300 bg-white hover:bg-gray-50",
    ghost: "bg-transparent hover:bg-gray-100",
    danger: "bg-red-600 text-white hover:bg-red-700",
  }

  /* ---------- SIZES ---------- */
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2 text-base",
    lg: "px-8 py-3 text-lg",
  }

  return (
    <button
      className={`
        rounded-xl
        font-medium
        transition
        active:scale-95
        disabled:opacity-50
        disabled:pointer-events-none
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}
