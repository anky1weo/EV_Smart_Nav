import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

interface AuthBackgroundProps {
  isFlipped: boolean;
}

export const AuthBackground: React.FC<AuthBackgroundProps> = ({ isFlipped }) => {
  const primaryColor = isFlipped ? '#06b6d4' : '#10b981'; // Cyan vs Emerald
  const accentColor = isFlipped ? '#3b82f6' : '#14b8a6'; // Blue vs Teal
  const shadowGlow = isFlipped ? 'rgba(6, 182, 212, 0.25)' : 'rgba(16, 185, 129, 0.25)';

  // Particle configurations
  const particleCount = 20;

  return (
    <div className="absolute inset-0 w-full h-full z-0 overflow-hidden bg-[hsl(260,87%,3%)]">
      {/* Background Video (at lowered opacity) */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-10 mix-blend-screen pointer-events-none"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_105406_16f4600d-7a92-4292-b96e-b19156c7830a.mp4"
      />

      {/* Cyber Grid Lines (moving right-to-left to simulate driving forward) */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        {/* Horizontal perspective lines */}
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `radial-gradient(circle at center, transparent 30%, [hsl(260,87%,3%)] 90%), 
                              linear-gradient(to right, ${primaryColor}1a 1px, transparent 1px)`,
            backgroundSize: '80px 100%',
          }}
        />
        {/* Perspective floor grid */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-1/2 origin-top" 
          style={{
            transform: 'perspective(500px) rotateX(60deg)',
            backgroundImage: `linear-gradient(to bottom, transparent, ${primaryColor}33), 
                              linear-gradient(to right, ${primaryColor}26 1px, transparent 1px), 
                              linear-gradient(to bottom, ${primaryColor}26 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            animation: 'grid-scroll 12s linear infinite',
          }}
        />
      </div>

      {/* Futuristic Energy Waves / Rind Radar Core (Pulsing behind the card center) */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        {[1, 2, 3].map((ring) => (
          <motion.div
            key={ring}
            className="absolute rounded-full border-2 border-dashed"
            style={{
              borderColor: primaryColor,
              opacity: 0.5 / ring,
              width: `${ring * 320}px`,
              height: `${ring * 320}px`,
              boxShadow: `inset 0 0 35px ${primaryColor}40, 0 0 35px ${primaryColor}40`
            }}
            animate={{
              rotate: ring % 2 === 0 ? 360 : -360,
              scale: [1, 1.12, 0.95, 1],
            }}
            transition={{
              duration: 15 + ring * 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Ambient Glows */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-10 pointer-events-none"
        animate={{
          backgroundColor: [primaryColor, accentColor, primaryColor],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-10 pointer-events-none"
        animate={{
          backgroundColor: [accentColor, primaryColor, accentColor],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Speed Particles (flying across the screen, mimicking speed) */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: particleCount }).map((_, i) => {
          const size = 1 + Math.random() * 3;
          const yPosition = 10 + Math.random() * 80; // random percentage height
          const duration = 2 + Math.random() * 3;
          const delay = Math.random() * -5;

          return (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                height: `${size}px`,
                width: `${size * (15 + Math.random() * 20)}px`,
                background: `linear-gradient(to left, ${primaryColor}, transparent)`,
                top: `${yPosition}%`,
                left: '105%',
                opacity: 0.15,
                boxShadow: `0 0 8px ${primaryColor}`
              }}
              animate={{
                left: ['105%', '-20%']
              }}
              transition={{
                duration: duration,
                repeat: Infinity,
                delay: delay,
                ease: "linear"
              }}
            />
          );
        })}
      </div>

      {/* Floating/Driving EV Car Silhouette in the Background (Traveling across screen) */}
      <motion.div
        className="absolute w-64 md:w-[450px] opacity-45 pointer-events-none z-10"
        style={{ bottom: '15%' }}
        animate={{
          x: ['105vw', '-60vw'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatDelay: 3,
          ease: "linear",
        }}
      >
        <motion.div
          className="w-full relative"
          animate={{
            y: [0, -5, 2, -5, 0], // Gentle hover / road bump effect
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <svg 
            viewBox="0 0 800 300" 
            fill="none" 
            stroke="currentColor" 
            className="w-full h-auto text-zinc-500 drop-shadow-[0_0_15px_rgba(255,255,255,0.05)]"
          >
            {/* Energy Stream/Path under the Car */}
            <motion.path
              d="M 20,225 L 780,225"
              stroke={primaryColor}
              strokeWidth="2"
              strokeDasharray="15 10"
              animate={{
                strokeDashoffset: [0, -50]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear"
              }}
            />

            {/* EV Body Outline */}
            <path
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
              stroke={primaryColor}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: `drop-shadow(0 0 5px ${primaryColor})` }}
            />

            {/* Cabin Windows */}
            <path
              d="M 315,157 
                 C 350,122 450,102 520,102 
                 C 570,102 625,117 650,147 
                 C 653,152 640,157 620,157 
                 C 500,157 380,157 315,157 Z"
              stroke="#6b7280"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Front Headlight Glow */}
            <motion.path
              d="M 100,192 C 115,190 125,187 135,192"
              stroke={primaryColor}
              strokeWidth="4"
              strokeLinecap="round"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Rear Taillight Glow */}
            <path
              d="M 740,188 L 748,194 C 750,198 748,202 740,202"
              stroke="#ef4444"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Wheels spinning effect */}
            {/* Front Wheel */}
            <g className="wheel">
              <circle cx="210" cy="220" r="28" stroke="#4b5563" strokeWidth="2.5" />
              <motion.g
                animate={{ rotate: -360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                style={{ originX: '210px', originY: '220px' }}
              >
                <circle cx="210" cy="220" r="16" stroke={primaryColor} strokeWidth="1.5" strokeDasharray="3 3" />
                <line x1="210" y1="192" x2="210" y2="248" stroke="#4b5563" strokeWidth="1.5" />
                <line x1="182" y1="220" x2="238" y2="220" stroke="#4b5563" strokeWidth="1.5" />
              </motion.g>
            </g>

            {/* Rear Wheel */}
            <g className="wheel">
              <circle cx="690" cy="220" r="28" stroke="#4b5563" strokeWidth="2.5" />
              <motion.g
                animate={{ rotate: -360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                style={{ originX: '690px', originY: '220px' }}
              >
                <circle cx="690" cy="220" r="16" stroke={primaryColor} strokeWidth="1.5" strokeDasharray="3 3" />
                <line x1="690" y1="192" x2="690" y2="248" stroke="#4b5563" strokeWidth="1.5" />
                <line x1="662" y1="220" x2="718" y2="220" stroke="#4b5563" strokeWidth="1.5" />
              </motion.g>
            </g>
          </svg>

          {/* Speed Tail effect (little wind particles trailing behind the car) */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-2">
            {[1, 2].map((i) => (
              <motion.div
                key={i}
                className="h-0.5 rounded-full"
                style={{
                  width: '30px',
                  background: `linear-gradient(to right, transparent, ${primaryColor})`
                }}
                animate={{
                  x: [0, 40],
                  opacity: [0.8, 0]
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.4,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Scanlines CSS overlay style */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{
          background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.15) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03))',
          backgroundSize: '100% 4px, 6px 100%',
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,[hsl(260,87%,3%)]_90%)] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(260,87%,3%)]/70 via-[hsl(260,87%,3%)]/40 to-[hsl(260,87%,3%)]/90 pointer-events-none" />
      
      {/* Scroll Keyframes Styles injection */}
      <style>{`
        @keyframes grid-scroll {
          from {
            background-position-y: 0px;
          }
          to {
            background-position-y: 480px;
          }
        }
      `}</style>
    </div>
  );
};
