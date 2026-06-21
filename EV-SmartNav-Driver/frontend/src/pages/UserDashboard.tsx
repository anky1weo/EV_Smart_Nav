import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';
import { DashboardGrid } from '../components/DashboardGrid';

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentBattery, setCurrentBattery] = useState('100'); // Lifted state
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let isRunning = true;
    let animationFrameId: number;

    const updateOpacity = () => {
      if (!isRunning) return;
      if (video.duration) {
        const t = video.currentTime;
        const d = video.duration;
        let opacity = 0;

        const maxOpacity = 0.55; // Lighter/more visible than intro page
        if (t < 0.5) {
          opacity = (t / 0.5) * maxOpacity;
        } else if (t > d - 0.5) {
          opacity = Math.max(0, (d - t) / 0.5) * maxOpacity;
        } else {
          opacity = maxOpacity;
        }
        video.style.opacity = opacity.toString();
      }
      animationFrameId = requestAnimationFrame(updateOpacity);
    };

    const handleEnded = () => {
      video.style.opacity = '0';
      setTimeout(() => {
        if (!isRunning) return;
        video.currentTime = 0;
        video.play().catch(err => console.log('Replay error:', err));
      }, 100);
    };

    video.addEventListener('ended', handleEnded);
    video.play().catch(err => console.log('Play error:', err));
    animationFrameId = requestAnimationFrame(updateOpacity);

    return () => {
      isRunning = false;
      cancelAnimationFrame(animationFrameId);
      if (video) {
        video.removeEventListener('ended', handleEnded);
      }
    };
  }, []);

  return (
    <div className="min-h-screen text-white flex font-sans overflow-hidden bg-black">
      
      {/* Video Background matching Background_page theme but made lighter */}
      <video
        ref={videoRef}
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_065045_c44942da-53c6-4804-b734-f9e07fc22e08.mp4"
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover pointer-events-none z-0"
        style={{ opacity: 0, filter: 'brightness(0.65) saturate(0.6)' }}
      />

      {/* Blurred overlay shape to help readability over the video */}
      <div 
        className="fixed w-[984px] h-[527px] opacity-80 bg-gray-950 blur-[82px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0"
        style={{ contentVisibility: 'auto' }}
      />

      {/* Left Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content wrapper */}
      <div className="flex-1 flex flex-col ml-64 h-screen relative z-10">
        
        {/* Top Navigation */}
        <TopBar currentBattery={currentBattery} setCurrentBattery={setCurrentBattery} />

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-8">
          
          {/* Header Title based on Tab */}
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-bold capitalize tracking-tight mb-2">
                {activeTab === 'dashboard' ? 'Overview' : activeTab.replace('-', ' ')}
              </h1>
              <p className="text-white/60 text-sm">
                AI-powered EV navigation with predictive charging intelligence.
              </p>
            </div>
            
            {activeTab === 'dashboard' && (
              <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-all shadow-[0_4px_20px_rgba(16,185,129,0.3)]">
                Start Navigation
              </button>
            )}
          </div>

          {/* Dynamic Tab Rendering */}
          {activeTab === 'dashboard' && <DashboardGrid currentBattery={currentBattery} />}
          
          {activeTab !== 'dashboard' && (
            <div className="w-full h-[600px] bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center text-white/50 backdrop-blur-sm">
              <div className="text-center">
                <p className="text-xl font-bold mb-2 capitalize">{activeTab} Module</p>
                <p className="text-sm">This interface is currently under construction.</p>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
