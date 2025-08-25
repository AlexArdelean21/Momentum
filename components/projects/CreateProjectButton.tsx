"use client"

import Link from "next/link"

type Props = {
  href?: string
  onClick?: () => void
  variant?: "button" | "fab"
  ariaLabel?: string
}

export function CreateProjectButton({ href = "/projects/new", onClick, variant = "button", ariaLabel }: Props) {
  if (variant === "fab") {
    if (onClick) {
      return (
        <button
          type="button"
          onClick={onClick}
          aria-label={ariaLabel || "Add Project"}
          className="fixed bottom-4 right-4 h-12 w-12 rounded-full grid place-items-center text-white bg-gradient-to-r from-orange-500 to-rose-500 shadow-lg hover:scale-[1.02] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
        >
          <span className="text-2xl leading-none">+</span>
        </button>
      )
    }
    return (
      <Link
        href={href}
        aria-label={ariaLabel || "Add Project"}
        className="fixed bottom-4 right-4 h-12 w-12 rounded-full grid place-items-center text-white bg-gradient-to-r from-orange-500 to-rose-500 shadow-lg hover:scale-[1.02] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
      >
        <span className="text-2xl leading-none">+</span>
      </Link>
    )
  }
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel || "Add Project"}
        className="inline-flex items-center gap-2 rounded-xl px-4 py-2 font-medium text-white bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
      >
        <span className="text-lg leading-none">＋</span>
        <span>Add Project</span>
      </button>
    )
  }
  return (
    <Link
      href={href}
      aria-label={ariaLabel || "Add Project"}
      className="inline-flex items-center gap-2 rounded-xl px-4 py-2 font-medium text-white bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
    >
      <span className="text-lg leading-none">＋</span>
      <span>Add Project</span>
    </Link>
  )
}


