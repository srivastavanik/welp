"use client"

import { Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface StarRatingDisplayProps {
  rating: number
  totalStars?: number
  size?: number
  className?: string
  showText?: boolean
}

export function StarRatingDisplay({
  rating,
  totalStars = 5,
  size = 20,
  className,
  showText = false,
}: StarRatingDisplayProps) {
  const fullStars = Math.floor(rating)
  const halfStar = rating % 1 >= 0.5 // Consider .5 and above as half/full for display
  const emptyStars = totalStars - fullStars - (halfStar ? 1 : 0)

  const getColor = (value: number) => {
    if (value >= 4) return "text-green-500" // Green for 4-5 stars
    if (value >= 2.5) return "text-yellow-500" // Yellow for 3 stars (2.5 to 3.9)
    return "text-red-500" // Red for 1-2 stars (0 to 2.4)
  }
  const starColor = getColor(rating)

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} fill="currentColor" className={cn(starColor)} style={{ width: size, height: size }} />
      ))}
      {halfStar && ( // This logic might need adjustment if you want actual half-star icons
        <Star
          key="half"
          fill="currentColor"
          className={cn(starColor)} // For simplicity, full color, or use a half-filled icon
          style={{ width: size, height: size }}
        />
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className={cn("text-gray-300")} style={{ width: size, height: size }} />
      ))}
      {showText && <span className={cn("ml-2 text-sm font-medium", starColor)}>{rating.toFixed(1)}</span>}
    </div>
  )
}

interface StarRatingInputProps {
  totalStars?: number
  size?: number
  className?: string
  value: number
  onChange: (rating: number) => void
  label?: string
}

export function StarRatingInput({
  totalStars = 5,
  size = 28,
  className,
  value,
  onChange,
  label,
}: StarRatingInputProps) {
  const [hoverRating, setHoverRating] = useState(0)

  const getColor = (val: number) => {
    if (val === 0) return "text-gray-300"
    if (val >= 4) return "text-green-500"
    if (val >= 3) return "text-yellow-500" // 3 stars is yellow
    return "text-red-500" // 1-2 stars is red
  }

  return (
    <div className={cn("flex flex-col", className)}>
      {label && <span className="mb-1 text-sm font-medium text-text-secondary">{label}</span>}
      <div className="flex items-center gap-1">
        {[...Array(totalStars)].map((_, i) => {
          const ratingValue = i + 1
          const starColor = getColor(hoverRating >= ratingValue ? hoverRating : value >= ratingValue ? value : 0)

          return (
            <button
              type="button"
              key={ratingValue}
              onClick={() => onChange(ratingValue)}
              onMouseEnter={() => setHoverRating(ratingValue)}
              onMouseLeave={() => setHoverRating(0)}
              className="focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red rounded-sm"
              aria-label={`Rate ${ratingValue} out of ${totalStars} stars`}
            >
              <Star
                fill={hoverRating >= ratingValue || value >= ratingValue ? "currentColor" : "none"}
                className={cn(starColor, "cursor-pointer transition-colors")}
                style={{ width: size, height: size }}
              />
            </button>
          )
        })}
        {value > 0 && <span className={cn("ml-2 text-lg font-semibold", getColor(value))}>{value} ★</span>}
      </div>
    </div>
  )
}
