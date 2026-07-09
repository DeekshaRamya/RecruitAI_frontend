import React from 'react';
import { motion } from 'framer-motion';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const CandidateAnimation = () => {
  // Float transitions for subtle background shapes
  const floatTransition = (delay = 0) => ({
    y: [0, -10, 0],
    x: [0, 6, 0],
    transition: {
      duration: 6,
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
      {/* Soft warm neutral backdrop glow for Candidate */}
      <div className="absolute w-[120%] h-[120%] z-10 pointer-events-none bg-[radial-gradient(circle,rgba(124,58,237,0.05)_0%,rgba(236,72,153,0.02)_40%,rgba(255,255,255,0)_70%)]" />

      {/* Hero Lottie Player */}
      <div className="relative w-full max-w-[920px] flex items-center justify-center z-20">
        <DotLottieReact
          src="https://lottie.host/031b5a98-2d0b-4e59-8821-3bf9bcb1dedf/lAcjM2adlG.lottie"
          loop
          autoplay
          style={{ width: '110%', height: '110%', minHeight: '520px', transform: 'scale(1.15)', transformOrigin: 'center center' }}
        />
      </div>

      {/* Faint network nodes decoration */}
      <motion.div
        className="absolute top-[20%] right-[12%] w-2.5 h-2.5 rounded-full bg-[#7c3aed]/20 z-30"
        animate={floatTransition(0.5)}
      />
      <motion.div
        className="absolute bottom-[15%] left-[15%] w-2 h-2 rounded-full bg-[#ec4899]/20 z-30"
        animate={floatTransition(2)}
      />
    </motion.div>
  );
};

export default CandidateAnimation;
