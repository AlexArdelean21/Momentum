"use client"

import { motion } from "framer-motion"

export function ConfettiEffect() {
  const confettiPieces = Array.from({ length: 20 }, (_, i) => i)

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {confettiPieces.map((i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
          initial={{
            x: "50%",
            y: "50%",
            scale: 0,
            rotate: 0,
          }}
          animate={{
            x: `${50 + (Math.random() - 0.5) * 200}%`,
            y: `${50 + (Math.random() - 0.5) * 200}%`,
            scale: [0, 1, 0],
            rotate: 360,
          }}
          transition={{
            duration: 1.5,
            delay: Math.random() * 0.5,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  )
}
