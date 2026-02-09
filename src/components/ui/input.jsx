import React from "react"

export function Input({ className = "", ...props }) {
  return (
    <input
      className={`
        border
        rounded-xl
        px-3
        py-2
        focus:outline-none
        focus:ring-2
        focus:ring-blue-500
        focus:border-blue-500
        w-full
        ${className}
      `}
      {...props}
    />
  )
}
