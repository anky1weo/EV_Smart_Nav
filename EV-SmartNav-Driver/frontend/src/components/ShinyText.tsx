import React from 'react';
import { motion } from 'framer-motion';

interface ShinyTextProps {
  text: string;
  className?: string;
}

export const ShinyText: React.FC<ShinyTextProps> = ({ text, className = '' }) => {
  return (
    <motion.span
      className={`inline-block ${className}`}
      style={{
        backgroundImage: 'linear-gradient(100deg, #64CEFB 25%, #ffffff 50%, #64CEFB 75%)',
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}
      animate={{
        backgroundPosition: ['100% 0%', '-100% 0%'],
      }}
      transition={{
        repeat: Infinity,
        duration: 3,
        ease: 'linear',
      }}
    >
      {text}
    </motion.span>
  );
};
