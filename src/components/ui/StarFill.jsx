import React from "react";

export default function StarFill({ rating = 0, size = 20, className = "" }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  const stars = [];

  // Full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <svg
        viewBox="0 0 24 24"
        fill="gray"
        stroke="gray"
        width={size}
        height={size}
        key={`full-${i}`}
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
      </svg>
    );
  }

  // Half star
  if (hasHalfStar) {
    stars.push(
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        key="half"
      >
        <defs>
          <linearGradient id="half-grad">
            <stop offset="50%" stopColor="gray" />
            <stop offset="50%" stopColor="lightgray" />
          </linearGradient>
        </defs>
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z"
          fill="url(#half-grad)"
          stroke="gray"
        />
      </svg>
    );
  }

  // Empty stars
  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="lightgray"
        width={size}
        height={size}
        key={`empty-${i}`}
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
      </svg>
    );
  }

  return <div className={`flex gap-1 ${className}`}>{stars}</div>;
}
