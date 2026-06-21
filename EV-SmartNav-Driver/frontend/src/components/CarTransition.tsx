import React from 'react';
import { motion } from 'framer-motion';

interface CarTransitionProps {
  theme: 'driver' | 'gov';
}

export const CarTransition: React.FC<CarTransitionProps> = ({ theme }) => {
  const isDriver = theme === 'driver';
  const glowColor = isDriver ? '#10b981' : '#06b6d4'; // Emerald vs Cyan
  const particleCount = 28;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/95 z-55 rounded-3xl p-6 md:p-8 overflow-hidden select-none">
      
      {/* Background Ambient Glow */}
      <motion.div
        className="absolute w-80 h-32 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: glowColor }}
        animate={{
          scale: [1, 1.4, 0.8],
          opacity: [0.15, 0.4, 0],
        }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
      />

      {/* Luxury Grey Car Outline Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, filter: 'blur(8px)' }}
        animate={{
          opacity: [0, 1, 1, 0],
          scale: [0.85, 1, 1.03, 1.15],
          filter: ['blur(8px)', 'blur(0px)', 'blur(0px)', 'blur(12px)'],
          y: [0, -5, -5, -20]
        }}
        transition={{ duration: 1.3, times: [0, 0.25, 0.75, 1], ease: "easeInOut" }}
        className="w-full max-w-md relative flex items-center justify-center"
      >
        <svg 
          viewBox="0 0 800 300" 
          fill="none" 
          stroke="currentColor" 
          className="w-full h-auto text-zinc-400 drop-shadow-[0_0_15px_rgba(255,255,255,0.08)]"
        >
          {/* Ground Reflection Light */}
          <motion.path
            d="M 50,225 L 750,225"
            stroke={glowColor}
            strokeWidth="2"
            strokeOpacity="0.4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />

          {/* Sleek Luxury EV Body Panel Outline */}
          <motion.path
            d="M 80,220 
               C 80,205 100,192 130,192 
               C 170,187 230,172 270,167 
               C 300,162 330,118 370,108 
               C 450,88 530,88 600,113 
               C 650,128 690,170 710,180 
               C 725,183 740,185 750,190 
               C 755,195 755,210 745,220 
               L 730,220 
               C 720,185 660,185 650,220 
               L 250,220 
               C 240,185 180,185 170,220 
               Z"
            stroke="#9ca3af" // Luxury Grey color
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />

          {/* Cabin Side Windows */}
          <motion.path
            d="M 315,157 
               C 350,122 450,102 520,102 
               C 570,102 625,117 650,147 
               C 653,152 640,157 620,157 
               C 500,157 380,157 315,157 Z"
            stroke="#4b5563" // Darker grey for glass line
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          />

          {/* Front Glowing LED Headlight */}
          <motion.path
            d="M 100,192 C 115,190 125,187 135,192"
            stroke={glowColor}
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.2, times: [0, 0.2, 0.8, 1] }}
          />

          {/* Rear Glowing Taillight */}
          <motion.path
            d="M 740,188 L 748,194 C 750,198 748,202 740,202"
            stroke="#ef4444" // Crimson red taillight
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.2, times: [0, 0.2, 0.8, 1] }}
          />

          {/* Front Wheel Core & Spokes */}
          <circle cx="210" cy="220" r="28" stroke="#4b5563" strokeWidth="2.5" />
          <circle cx="210" cy="220" r="16" stroke={glowColor} strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="210" y1="192" x2="210" y2="248" stroke="#4b5563" strokeWidth="1.5" />
          <line x1="182" y1="220" x2="238" y2="220" stroke="#4b5563" strokeWidth="1.5" />

          {/* Rear Wheel Core & Spokes */}
          <circle cx="690" cy="220" r="28" stroke="#4b5563" strokeWidth="2.5" />
          <circle cx="690" cy="220" r="16" stroke={glowColor} strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="690" y1="192" x2="690" y2="248" stroke="#4b5563" strokeWidth="1.5" />
          <line x1="662" y1="220" x2="718" y2="220" stroke="#4b5563" strokeWidth="1.5" />
        </svg>

        {/* Futuristic Technical Overlay Text */}
        <div className="absolute bottom-2 text-[9px] font-mono tracking-widest text-white/20 uppercase">
          // EV-PLATFORM-TELEMETRY-SYNC
        </div>
      </motion.div>

      {/* Dispersal Particles Layer */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: particleCount }).map((_, i) => {
          // Calculate random circular trajectory offset
          const angle = (i / particleCount) * Math.PI * 2 + (Math.random() * 0.4 - 0.2);
          const distance = 80 + Math.random() * 180;
          const targetX = Math.cos(angle) * distance;
          const targetY = Math.sin(angle) * distance - 20;

          return (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full"
              style={{ 
                backgroundColor: i % 2 === 0 ? '#9ca3af' : glowColor, // Blend grey and glow particles
                left: '50%',
                top: '50%',
                boxShadow: `0 0 8px ${glowColor}`
              }}
              initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
              animate={{ 
                x: [0, targetX * 0.2, targetX], 
                y: [0, targetY * 0.2, targetY], 
                opacity: [0, 1, 0.9, 0],
                scale: [0, 1.8, 1, 0]
              }}
              transition={{ 
                duration: 1.1, 
                delay: 0.35 + Math.random() * 0.25,
                ease: [0.16, 1, 0.3, 1] // Out-expo transition for burst velocity
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
