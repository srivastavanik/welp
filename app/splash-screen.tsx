"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"

export default function SplashScreen({ onStart }: { onStart: () => void }) {
  const [isClicked, setIsClicked] = useState(false)

  const handleLogoClick = () => {
    setIsClicked(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#5A0000] p-8">
      {/* Pulsating Logo Button */}
      <motion.button
        onClick={handleLogoClick}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{
          scale: [1, 1.05, 1],
          opacity: 1,
        }}
        transition={{
          opacity: { delay: 0.2, duration: 0.5, ease: "easeOut" },
          scale: {
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "mirror",
            ease: "easeInOut",
          },
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="relative rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-[#5A0000]"
      >
        <Image
          src="/logo-transparent.png"
          alt="Welp Logo - Click to Start"
          width={256}
          height={256}
          priority
          className="h-auto w-48 cursor-pointer md:w-64"
        />
      </motion.button>

      {/* White Flash Animation on Click */}
      {isClicked && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.6, times: [0, 0.1, 1] }}
          onAnimationComplete={onStart}
          className="absolute inset-0 z-10 bg-white"
        />
      )}
    </div>
  )
}
