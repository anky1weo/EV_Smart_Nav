import React from 'react';
import { Shield, User } from 'lucide-react';

interface NavbarProps {
  isFlipped: boolean;
  setIsFlipped: (flipped: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ isFlipped, setIsFlipped }) => {
  return (
    <header className="relative w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Branding */}
          <a href="#" className="flex items-center gap-4 group focus:outline-none">
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 blur-md rounded-full"></div>
              <img 
                src="/logo.png" 
                alt="EV SmartNav Logo" 
                className="relative h-24 w-auto object-contain rounded-lg shadow-lg" 
              />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold tracking-tight text-white drop-shadow-sm">
                EV SmartNav
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 drop-shadow-sm">
                Smart EV Route Planning Platform
              </span>
            </div>
          </a>

          {/* Quick Portal Switcher */}
          <button
            className={`flex items-center gap-2 border px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
              isFlipped 
                ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10' 
                : 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10'
            }`}
            onClick={() => setIsFlipped(!isFlipped)}
            id="navbar-portal-toggle"
          >
            {isFlipped ? (
              <>
                <User className="w-3.5 h-3.5" />
                <span>Switch to Driver App</span>
              </>
            ) : (
              <>
                <Shield className="w-3.5 h-3.5" />
                <span>Switch to Gov/Operator Dashboard</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
