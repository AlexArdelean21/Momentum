"use client"

import { motion } from "framer-motion"
import { useId } from "react"

type Props = {
  value: number // 0..1
  "aria-label"?: string
}

export function ProjectRadialFuel({ value, ...props }: Props) {
  const id = useId()
  const radius = 32
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(1, value))
  const offset = circumference * (1 - clamped)

  return (
    <svg
      width={88}
      height={88}
      viewBox="0 0 88 88"
      role="meter"
      aria-labelledby={id}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped * 100)}
      {...props}
    >
      <title id={id}>Project progress</title>
      <defs>
        <linearGradient id="fuel" x1="0" x2="1">
          <stop offset="0%" stopColor="#FF7A18" />
          <stop offset="50%" stopColor="#FF3D54" />
          <stop offset="100%" stopColor="#FFB800" />
        </linearGradient>
      </defs>
      <circle cx="44" cy="44" r={radius} stroke="currentColor" strokeOpacity="0.15" strokeWidth="8" fill="none" />
      <motion.circle
        cx="44"
        cy="44"
        r={radius}
        stroke="url(#fuel)"
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ type: "spring", stiffness: 160, damping: 24 }}
        transform="rotate(-90 44 44)"
      />
    </svg>
  )
}


