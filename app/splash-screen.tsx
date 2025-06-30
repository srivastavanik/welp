"use client"

import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"

export default function SplashScreen({ onStart }: { onStart: () => void }) {
  const [isClicked, setIsClicked] = useState(false)

  const handleLogoClick = () => {
    setIsClicked(true)
  }

  return (
    <AnimatePresence mode="wait">
      {!isClicked ? (
        <motion.div 
          key="splash"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-brand p-8 overflow-hidden"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Animated background elements */}
          <div className="absolute inset-0">
            <motion.div
              className="absolute top-0 right-0 w-96 h-96 bg-red-600/30 rounded-full blur-3xl"
              animate={{ 
                x: [0, 100, 0],
                y: [0, -50, 0],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500/30 rounded-full blur-3xl"
              animate={{ 
                x: [0, -100, 0],
                y: [0, 50, 0],
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            />
          </div>

          {/* Logo and content */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 200,
              damping: 20,
              delay: 0.2 
            }}
            className="relative z-10"
          >
            <motion.button
              onClick={handleLogoClick}
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                scale: {
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "mirror",
                  ease: "easeInOut",
                },
              }}
              whileHover={{ 
                scale: 1.1,
                filter: "drop-shadow(0 0 40px rgba(255, 255, 255, 0.5))"
              }}
              whileTap={{ scale: 0.95 }}
              className="relative rounded-full focus:outline-none focus-visible:ring-4 focus-visible:ring-white/50 group"
            >
              <div className="relative">
                <Image
                  src="/logo-transparent.png"
                  alt="Welp Logo - Click to Start"
                  width={256}
                  height={256}
                  priority
                  className="h-auto w-48 cursor-pointer md:w-64 relative z-10"
                />
                <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-all duration-300" />
              </div>
            </motion.button>
          </motion.div>

          {/* Text below logo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="relative z-10 text-center mt-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 font-['Bebas_Neue']">
              WELP
            </h1>
            <p className="text-red-100 text-lg md:text-xl">
              Click to rate your customers
            </p>
            <motion.p
              className="text-red-200/70 text-sm mt-4"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Tap the logo to begin
            </motion.p>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          key="flash"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.6 }}
          onAnimationComplete={onStart}
          className="fixed inset-0 z-50 flex items-center justify-center bg-white"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 0.6, ease: "linear" }}
          >
            <Image
              src="/logo-transparent.png"
              alt="Welp Logo"
              width={128}
              height={128}
              className="h-auto w-32"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
