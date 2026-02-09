import React from "react"

export function Card({ className = "", children, ...props }) {
  return (
    <div
      className={`
        rounded-2xl
        border
        bg-white
        shadow-sm
        p-4
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardContent({ className = "", children, ...props }) {
  return (
    <div className={`p-2 ${className}`} {...props}>
      {children}
    </div>
  )
}
