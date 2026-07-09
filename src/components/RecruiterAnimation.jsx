import React from 'react';
import { motion } from 'framer-motion';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const RecruiterAnimation = () => {
  // Delicate float transitions for subtle decorative elements
  const floatTransition = (delay = 0) => ({
    y: [0, -8, 0],
    x: [0, 5, 0],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut",
      delay
    }
  });

  return (
    <motion.div
      className="relative w-full h-full flex items-center justify-center"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Radial soft glow backdrop behind Lottie */}
      <div className="absolute w-[130%] h-[130%] z-10 pointer-events-none bg-[radial-gradient(circle,rgba(59,130,246,0.07)_0%,rgba(6,182,212,0.03)_40%,rgba(255,255,255,0)_70%)]" />

      {/* Dynamic Lottie player wrapper */}
      <div className="relative w-full max-w-[920px] flex items-center justify-center z-20">
        <DotLottieReact
          src="https://lottie.host/75ef6d24-b576-44d3-8d87-37edf84620e4/oXHl4mISvG.lottie"
          loop
          autoplay
          style={{ width: '110%', height: '110%', minHeight: '520px', transform: 'scale(1.15)', transformOrigin: 'center center' }}
        />
      </div>

      {/* Subtle AI-inspired floating geometric nodes */}
      <motion.div
        className="absolute top-[15%] left-[12%] w-2 h-2 rounded-full bg-[#2563eb]/20 shadow-[0_0_10px_rgba(37,99,235,0.1)] z-30"
        animate={floatTransition(0)}
      />
      <motion.div
        className="absolute bottom-[20%] right-[10%] w-3 h-3 rounded-full bg-[#06b6d4]/15 z-30"
        animate={floatTransition(1.5)}
      />
      <motion.div
        className="absolute top-[25%] right-[15%] w-1.5 h-1.5 rounded-full bg-[#7c3aed]/15 z-30"
        animate={floatTransition(0.8)}
      />

      {/* Fine connection grid lines */}
      <svg 
        className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-15 z-10"
        viewBox="0 0 500 500"
      >
        <path d="M 50,100 L 450,100 M 50,400 L 450,400 M 100,50 L 100,450 M 400,50 L 400,450" stroke="rgba(15, 23, 42, 0.2)" strokeWidth="0.5" strokeDasharray="5 5" />
      </svg>
    </motion.div>
  );
};

export default RecruiterAnimation;
