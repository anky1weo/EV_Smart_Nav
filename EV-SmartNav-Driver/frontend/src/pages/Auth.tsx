import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Phone, Mail, Lock, User, Car, Settings, Navigation, 
  MapPin, Battery, Activity, Building2, Briefcase, Award, 
  FileText, ArrowLeft, ArrowRight, CheckCircle2, Shield, Eye, EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { CarTransition } from '../components/CarTransition';
import { AuthBackground } from '../components/AuthBackground';
import { useAuth } from '../context/AuthContext';

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, signUp, session } = useAuth();
  
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    if (session) {
      const role = session.user?.user_metadata?.role;
      // If logging in on the Gov side but user is a driver, don't auto-navigate. 
      // Let handleGovSubmit process the error and logout.
      if (isFlipped && role !== 'gov' && role !== 'operator') {
        return;
      }
      navigate('/dashboard');
    }
  }, [session, navigate, isFlipped]);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  
  // Custom transition animation states
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionTheme, setTransitionTheme] = useState<'driver' | 'gov'>('driver');
  
  // Driver Form States
  const [driverMode, setDriverMode] = useState<'signin' | 'signup'>('signin');
  const [driverStep, setDriverStep] = useState(1);
  const [showDriverPassword, setShowDriverPassword] = useState(false);
  const [driverSuccess, setDriverSuccess] = useState(false);
  
  const [driverData, setDriverData] = useState({
    // Sign In / Sign Up Credentials
    email: '',
    phone: '',
    password: '',
    fullName: '',
    // Vehicle Info
    vehicleCompany: '',
    vehicleModelName: '',
    vehicleVariant: '',
    manufacturingYear: 2024,
    batteryCapacity: '',
    batteryHealth: '',
    totalRange: '',
    // Preferences
    preferredRoute: 'Fastest',
    minBatteryBuffer: '20',
    // Trip (simulation default)
    currentBatteryCharge: '85',
    destinationLocation: '',
  });

  // Gov/Operator Form States
  const [govMode, setGovMode] = useState<'signin' | 'signup'>('signin');
  const [govStep, setGovStep] = useState(1);
  const [showGovPassword, setShowGovPassword] = useState(false);
  const [govSuccess, setGovSuccess] = useState(false);

  const [govData, setGovData] = useState({
    // Sign In / Sign Up Credentials
    officialEmail: '',
    password: '',
    // Organization Info
    orgName: '',
    orgType: 'Government',
    gstNumber: '',
    orgContact: '',
    orgAddress: '',
    // User Info
    fullName: '',
    designation: '',
    employeeId: '',
    contactNumber: '',
    // Role & Scope
    role: 'Government User',
    state: '',
    departmentName: '',
    region: '',
    assignedStations: '',
    accessLevel: 'L1',
    // Additional Operator Info
    numChargingStations: '',
    stationIds: '',
    operatorName: '',
    serviceAreas: '',
  });

  const handleDriverInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDriverData(prev => ({ ...prev, [name]: value }));
  };

  const handleGovInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setGovData(prev => ({ ...prev, [name]: value }));
  };

  const handleDriverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      if (driverMode === 'signin') {
        const { error } = await signIn(driverData.email, driverData.password);
        if (error) {
          setAuthError(error.message);
        } else {
          navigate('/dashboard');
        }
      } else {
        // Sign Up Step Navigation
        if (driverStep < 3) {
          setDriverStep(prev => prev + 1);
          setAuthLoading(false);
          return;
        } else {
          // Final step — create account
          const { error, needsConfirmation } = await signUp(
            driverData.email,
            driverData.password,
            {
              full_name: driverData.fullName,
              phone: driverData.phone,
              role: 'driver',
              preferred_route: driverData.preferredRoute,
              min_battery_buffer: parseInt(driverData.minBatteryBuffer) || 20,
              vehicle_company: driverData.vehicleCompany,
              vehicle_model: driverData.vehicleModelName,
              vehicle_variant: driverData.vehicleVariant,
              manufacturing_year: driverData.manufacturingYear,
              battery_capacity: parseFloat(driverData.batteryCapacity) || null,
              battery_health: parseFloat(driverData.batteryHealth) || null,
              total_range: parseFloat(driverData.totalRange) || null,
            }
          );
          if (error) {
            setAuthError(error.message);
          } else if (needsConfirmation) {
            setDriverSuccess(true);
          } else {
            navigate('/dashboard');
          }
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'An unexpected error occurred');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGovSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("The Gov & Operators platform is currently under development. Registration and login are disabled.");
  };

  const resetForms = () => {
    setDriverSuccess(false);
    setGovSuccess(false);
    setDriverStep(1);
    setGovStep(1);
    setDriverMode('signin');
    setGovMode('signin');
  };

  const triggerDriverTransition = (mode: 'signin' | 'signup') => {
    if (driverMode === mode) return;
    setTransitionTheme('driver');
    setIsTransitioning(true);
    setTimeout(() => {
      setDriverMode(mode);
      setDriverStep(1);
      setIsTransitioning(false);
    }, 1300);
  };

  const triggerGovTransition = (mode: 'signin' | 'signup') => {
    if (govMode === mode) return;
    setTransitionTheme('gov');
    setIsTransitioning(true);
    setTimeout(() => {
      setGovMode(mode);
      setGovStep(1);
      setIsTransitioning(false);
    }, 1300);
  };

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden flex flex-col font-sans text-white select-none">
      
      {/* Animated Cyber EV Background */}
      <AuthBackground isFlipped={isFlipped} />

      {/* Main Content Interface */}
      <div className="relative z-10 flex flex-col min-h-screen justify-between">
        
        {/* Navbar with synchronized switch control */}
        <Navbar isFlipped={isFlipped} setIsFlipped={setIsFlipped} />

        {/* Center Flipping Card Container */}
        <main className="flex-1 flex items-center justify-center px-4 py-6 md:py-12">
          <div className="perspective-1000 w-full max-w-2xl h-[650px] relative">
            <motion.div
              className="w-full h-full relative preserve-3d"
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            >
              
              {/* ==========================================
                  FRONT CARD: EV Owner Driver App Portal
                 ========================================== */}
              <div 
                className={`absolute inset-0 backface-hidden w-full h-full ${
                  isFlipped ? 'pointer-events-none opacity-0' : 'opacity-100'
                } transition-opacity duration-300`}
              >
                <div className="w-full h-full bg-zinc-950/80 border border-emerald-500/20 rounded-3xl p-6 md:p-8 backdrop-blur-2xl flex flex-col justify-between shadow-[0_0_50px_rgba(16,185,129,0.15)] relative overflow-hidden">
                  
                  {/* Transition Overlay */}
                  <AnimatePresence>
                    {isTransitioning && transitionTheme === 'driver' && (
                      <CarTransition theme="driver" />
                    )}
                  </AnimatePresence>
                  
                  {/* Subtle Top Accent Bar */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />
                  
                  {driverSuccess ? (
                    /* Driver Success Screen */
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex-1 flex flex-col items-center justify-center text-center space-y-6"
                    >
                      <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center animate-bounce">
                        <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                      </div>
                      <div>
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Access Granted !</h2>
                        <p className="text-white/60 text-sm mt-2 max-w-sm mx-auto">
                          Connecting to your EV SmartNav Dashboard & live vehicle telemetry.
                        </p>
                      </div>
                      
                      {/* Telemetry Debug Log */}
                      <div className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-left font-mono text-xs space-y-1 text-emerald-400/80 max-w-md mx-auto">
                        <p className="text-white/40">// Live Telemetry Sync</p>
                        <p>👤 Owner: {driverData.fullName || driverData.email || 'EV Driver'}</p>
                        <p>🚗 EV Model: {driverData.vehicleCompany || 'Generic'} {driverData.vehicleModelName || 'EV'}</p>
                        <p>🔋 Capacity: {driverData.batteryCapacity || 'N/A'} kWh | Health: {driverData.batteryHealth}%</p>
                        <p>🗺️ Route Strategy: {driverData.preferredRoute} | Limit Buffer: {driverData.minBatteryBuffer}%</p>
                        <p>📍 GPS Status: 37.7749° N, 122.4194° W (Locked)</p>
                      </div>

                      <button 
                        onClick={resetForms}
                        className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full text-sm font-semibold transition-all duration-300"
                      >
                        Sign Out / Disconnect
                      </button>
                    </motion.div>
                  ) : (
                    /* Driver Active Form screen */
                    <div className="flex-1 flex flex-col justify-between h-full">
                      <div>
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                              Part 1 — EV SmartNav Driver Platform
                            </span>
                            <div className="mt-3" style={{ animation: 'pulse 3s infinite' }}>
                              <h2 className="text-[36px] font-bold leading-tight tracking-tight text-white drop-shadow-md">EV SmartNav</h2>
                              <p className="text-[16px] font-bold text-emerald-400 mt-1">Smart EV Driver Platform</p>
                            </div>
                          </div>
                          
                          {/* Toggle Mode */}
                          <div className="bg-white/5 border border-white/10 rounded-full p-1 flex">
                            <button
                              onClick={() => triggerDriverTransition('signin')}
                              className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider transition-all duration-300 ${
                                driverMode === 'signin' ? 'bg-emerald-500 text-white' : 'text-white/50 hover:text-white'
                              }`}
                            >
                              Sign In
                            </button>
                            <button
                              onClick={() => triggerDriverTransition('signup')}
                              className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider transition-all duration-300 ${
                                driverMode === 'signup' ? 'bg-emerald-500 text-white' : 'text-white/50 hover:text-white'
                              }`}
                            >
                              Sign Up
                            </button>
                          </div>
                        </div>

                        {authError && (
                          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-semibold flex items-start gap-2">
                            <Shield className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>{authError}</span>
                          </div>
                        )}

                        {/* Sign In View */}
                        {driverMode === 'signin' && (
                          <motion.form 
                            onSubmit={handleDriverSubmit}
                            className="space-y-4 py-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <div className="space-y-1">
                              <label className="text-xs text-white/60 font-semibold uppercase tracking-wider">Email ID</label>
                              <div className="relative">
                                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
                                <input
                                  type="email"
                                  name="email"
                                  placeholder="driver@smartnav.com"
                                  required
                                  value={driverData.email}
                                  onChange={handleDriverInputChange}
                                  className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] backdrop-blur-[20px] rounded-xl pl-11 pr-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all text-sm"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-xs text-white/60 font-semibold uppercase tracking-wider">Password</label>
                              <div className="relative">
                                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
                                <input
                                  type={showDriverPassword ? 'text' : 'password'}
                                  name="password"
                                  placeholder="••••••••"
                                  required
                                  value={driverData.password}
                                  onChange={handleDriverInputChange}
                                  className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] backdrop-blur-[20px] rounded-xl pl-11 pr-11 py-2.5 text-white placeholder-white/20 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all text-sm"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowDriverPassword(!showDriverPassword)}
                                  className="absolute right-3.5 top-3.5 text-white/40 hover:text-white transition-colors"
                                >
                                  {showDriverPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                              </div>
                            </div>

                            <button
                              type="submit"
                              id="driver-signin-btn"
                              disabled={authLoading}
                              className="w-full hover:scale-[1.02] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-[0_0_25px_rgba(0,208,132,0.4)] mt-6 text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                              style={{ background: 'linear-gradient(90deg, #00D084, #00B8FF)' }}
                            >
                              {authLoading ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                              ) : (
                                <>
                                  <span>Secure Sign In</span>
                                  <ArrowRight className="w-4 h-4" />
                                </>
                              )}
                            </button>


                          </motion.form>
                        )}

                        {/* Sign Up (Multi-Step Form) */}
                        {driverMode === 'signup' && (
                          <div className="space-y-4">
                            {/* Step Indicators */}
                            <div className="flex items-center gap-2 mb-6">
                              {[1, 2, 3].map((step) => (
                                <div key={step} className="flex-1 flex items-center gap-2">
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all duration-300 ${
                                    driverStep >= step 
                                      ? 'bg-emerald-500 border-emerald-500 text-white' 
                                      : 'border-white/10 text-white/40'
                                  }`}>
                                    {step}
                                  </div>
                                  <span className="text-[10px] text-white/40 hidden md:inline">
                                    {step === 1 && "Personal"}
                                    {step === 2 && "Vehicle"}
                                    {step === 3 && "Preferences"}
                                  </span>
                                  {step < 3 && <div className={`flex-1 h-0.5 ${driverStep > step ? 'bg-emerald-500' : 'bg-white/10'}`} />}
                                </div>
                              ))}
                            </div>

                            <form onSubmit={handleDriverSubmit} className="max-h-[280px] overflow-y-auto pr-2 custom-scrollbar space-y-4">
                              {/* Step 1: Personal Info */}
                              {driverStep === 1 && (
                                <motion.div 
                                  initial={{ opacity: 0, x: 20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  className="space-y-4"
                                >
                                  <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2 mb-2">
                                    <User className="w-4 h-4" />
                                    <span>Personal Information</span>
                                  </h3>
                                  <div className="space-y-1">
                                    <label className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">Full Name</label>
                                    <input
                                      type="text"
                                      name="fullName"
                                      required
                                      placeholder="John Doe"
                                      value={driverData.fullName}
                                      onChange={handleDriverInputChange}
                                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">Phone Number</label>
                                    <input
                                      type="tel"
                                      name="phone"
                                      required
                                      placeholder="+1 555-0199"
                                      value={driverData.phone}
                                      onChange={handleDriverInputChange}
                                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">Email ID</label>
                                    <input
                                      type="email"
                                      name="email"
                                      required
                                      placeholder="john.doe@gmail.com"
                                      value={driverData.email}
                                      onChange={handleDriverInputChange}
                                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">Password</label>
                                    <input
                                      type="password"
                                      name="password"
                                      required
                                      placeholder="••••••••"
                                      value={driverData.password}
                                      onChange={handleDriverInputChange}
                                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                                    />
                                  </div>
                                </motion.div>
                              )}

                              {/* Step 2: Vehicle Info */}
                              {driverStep === 2 && (
                                <motion.div 
                                  initial={{ opacity: 0, x: 20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  className="space-y-4"
                                >
                                  <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2 mb-2">
                                    <Car className="w-4 h-4" />
                                    <span>Vehicle Information</span>
                                  </h3>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                      <label className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">Vehicle Company</label>
                                      <input
                                        type="text"
                                        name="vehicleCompany"
                                        required
                                        placeholder="Tesla"
                                        value={driverData.vehicleCompany}
                                        onChange={handleDriverInputChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">Model Name</label>
                                      <input
                                        type="text"
                                        name="vehicleModelName"
                                        required
                                        placeholder="Model Y"
                                        value={driverData.vehicleModelName}
                                        onChange={handleDriverInputChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                                      />
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                      <label className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">Variant / Model No.</label>
                                      <input
                                        type="text"
                                        name="vehicleVariant"
                                        required
                                        placeholder="Long Range Dual"
                                        value={driverData.vehicleVariant}
                                        onChange={handleDriverInputChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">Mfg Year</label>
                                      <input
                                        type="number"
                                        name="manufacturingYear"
                                        required
                                        placeholder="2024"
                                        value={driverData.manufacturingYear}
                                        onChange={handleDriverInputChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                                      />
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                      <label className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">Capacity (kWh)</label>
                                      <input
                                        type="number"
                                        name="batteryCapacity"
                                        required
                                        placeholder="75"
                                        value={driverData.batteryCapacity}
                                        onChange={handleDriverInputChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">Battery Health (%)</label>
                                      <input
                                        type="number"
                                        name="batteryHealth"
                                        required
                                        placeholder="98"
                                        value={driverData.batteryHealth}
                                        onChange={handleDriverInputChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                                      />
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-1">
                                      <label className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">Total Range (km) at 100%</label>
                                      <input
                                        type="number"
                                        name="totalRange"
                                        required
                                        placeholder="450"
                                        value={driverData.totalRange}
                                        onChange={handleDriverInputChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                                      />
                                    </div>
                                  </div>
                                </motion.div>
                              )}

                              {/* Step 3: User Preferences */}
                              {driverStep === 3 && (
                                <motion.div 
                                  initial={{ opacity: 0, x: 20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  className="space-y-4"
                                >
                                  <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2 mb-2">
                                    <Settings className="w-4 h-4" />
                                    <span>User Preferences</span>
                                  </h3>
                                  <div className="space-y-1">
                                    <label className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">Preferred Route Type</label>
                                    <select
                                      name="preferredRoute"
                                      value={driverData.preferredRoute}
                                      onChange={handleDriverInputChange}
                                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                                    >
                                      <option>Fastest</option>
                                      <option>Shortest</option>
                                      <option>Eco-Friendly</option>
                                    </select>
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">Minimum Battery Buffer (%)</label>
                                    <input
                                      type="number"
                                      name="minBatteryBuffer"
                                      required
                                      placeholder="20"
                                      value={driverData.minBatteryBuffer}
                                      onChange={handleDriverInputChange}
                                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                                    />
                                  </div>
                                </motion.div>
                              )}


                            </form>

                            {/* Navigation Buttons for Stepper */}
                            <div className="flex justify-between items-center pt-4 border-t border-white/5">
                              {driverStep > 1 ? (
                                <button
                                  type="button"
                                  onClick={() => setDriverStep(prev => prev - 1)}
                                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white/60 hover:text-white flex items-center gap-1.5 transition-all"
                                >
                                  <ArrowLeft className="w-3.5 h-3.5" />
                                  <span>Back</span>
                                </button>
                              ) : <div />}

                              <button
                                type="button"
                                onClick={handleDriverSubmit}
                                disabled={authLoading}
                                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all duration-300 shadow-[0_4px_15px_rgba(16,185,129,0.2)] disabled:opacity-70 disabled:cursor-not-allowed"
                              >
                                {authLoading && driverStep === 3 ? (
                                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-1" />
                                ) : null}
                                <span>{driverStep === 3 ? "Complete Sign Up" : "Continue"}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>


                    </div>
                  )}

                </div>
              </div>

              {/* ==========================================
                  BACK CARD: EV Infrastructure Intelligence Portal
                 ========================================== */}
              <div 
                className={`absolute inset-0 backface-hidden w-full h-full rotate-y-180 ${
                  !isFlipped ? 'pointer-events-none opacity-0' : 'opacity-100'
                } transition-opacity duration-300`}
              >
                <div className="w-full h-full bg-zinc-950/80 border border-cyan-500/20 rounded-3xl p-6 md:p-8 backdrop-blur-2xl flex flex-col justify-between shadow-[0_0_50px_rgba(6,182,212,0.15)] relative overflow-hidden">
                  
                  {/* Transition Overlay */}
                  <AnimatePresence>
                    {isTransitioning && transitionTheme === 'gov' && (
                      <CarTransition theme="gov" />
                    )}
                  </AnimatePresence>
                  
                  {/* Subtle Top Accent Bar */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-400 to-indigo-600" />
                  
                  {govSuccess ? (
                    /* Gov Success Screen */
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex-1 flex flex-col items-center justify-center text-center space-y-6"
                    >
                      <div className="w-20 h-20 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center animate-bounce">
                        <Shield className="w-10 h-10 text-cyan-400" />
                      </div>
                      <div>
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Security Cleared !</h2>
                        <p className="text-white/60 text-sm mt-2 max-w-sm mx-auto">
                          Synchronizing with the EV Infrastructure Intelligence analytics engines.
                        </p>
                      </div>
                      
                      {/* Institutional Debug Log */}
                      <div className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-left font-mono text-xs space-y-1 text-cyan-400/80 max-w-md mx-auto">
                        <p className="text-white/40">// Institutional Scope Verified</p>
                        <p>🏢 Org: {govData.orgName || 'SmartNav Agency'} ({govData.orgType})</p>
                        <p>👤 Employee: {govData.fullName || 'Authorized Admin'} | ID: {govData.employeeId || 'N/A'}</p>
                        <p>🛡️ Assigned Role: {govData.role}</p>
                        {govData.role === 'Government User' ? (
                          <p>🗺️ Jurisdiction: State of {govData.state || 'California'} ({govData.departmentName || 'DOT'})</p>
                        ) : (
                          <p>⚡ Assigned Region: {govData.region || 'North-West'} | Stations: {govData.assignedStations || 'All'}</p>
                        )}
                        <p>🔒 Session Level: Supervised Node Connection</p>
                      </div>

                      <button 
                        onClick={resetForms}
                        className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-full text-sm font-semibold transition-all duration-300"
                      >
                        Disconnect Terminal
                      </button>
                    </motion.div>
                  ) : (
                    /* Gov Active Form screen */
                    <div className="flex-1 flex flex-col justify-between h-full">
                      <div>
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <span className="text-[10px] uppercase tracking-widest text-cyan-400 font-bold bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                              Part 2 — Infrastructure Intelligence
                            </span>
                            <h2 className="text-2xl font-bold mt-3">Gov & Operators</h2>
                          </div>
                          
                          {/* Toggle Mode */}
                          <div className="bg-white/5 border border-white/10 rounded-full p-1 flex">
                            <button
                              onClick={() => triggerGovTransition('signin')}
                              className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider transition-all duration-300 ${
                                govMode === 'signin' ? 'bg-cyan-500 text-white' : 'text-white/50 hover:text-white'
                              }`}
                            >
                              Sign In
                            </button>
                            <button
                              onClick={() => triggerGovTransition('signup')}
                              className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider transition-all duration-300 ${
                                govMode === 'signup' ? 'bg-cyan-500 text-white' : 'text-white/50 hover:text-white'
                              }`}
                            >
                              Sign Up
                            </button>
                          </div>
                        </div>

                        {authError && (
                          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-semibold flex items-start gap-2">
                            <Shield className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>{authError}</span>
                          </div>
                        )}

                        {/* Sign In View */}
                        {govMode === 'signin' && (
                          <motion.form 
                            onSubmit={handleGovSubmit}
                            className="space-y-4 py-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <div className="space-y-1">
                              <label className="text-xs text-white/60 font-semibold uppercase tracking-wider">Official Email ID</label>
                              <div className="relative">
                                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
                                <input
                                  type="email"
                                  name="officialEmail"
                                  placeholder="admin@government.gov"
                                  required
                                  value={govData.officialEmail}
                                  onChange={handleGovInputChange}
                                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all text-sm"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-xs text-white/60 font-semibold uppercase tracking-wider">Password</label>
                              <div className="relative">
                                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
                                <input
                                  type={showGovPassword ? 'text' : 'password'}
                                  name="password"
                                  placeholder="••••••••"
                                  required
                                  value={govData.password}
                                  onChange={handleGovInputChange}
                                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-11 py-2.5 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all text-sm"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowGovPassword(!showGovPassword)}
                                  className="absolute right-3.5 top-3.5 text-white/40 hover:text-white transition-colors"
                                >
                                  {showGovPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                              </div>
                            </div>

                            <button
                              type="submit"
                              id="gov-signin-btn"
                              disabled={authLoading}
                              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-[0_4px_20px_rgba(6,182,212,0.3)] mt-6 text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                              {authLoading ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                              ) : (
                                <>
                                  <span>Verify & Connect</span>
                                  <ArrowRight className="w-4 h-4" />
                                </>
                              )}
                            </button>
                          </motion.form>
                        )}

                        {/* Sign Up View */}
                        {govMode === 'signup' && (
                          <div className="space-y-4">
                            {/* Step Indicators */}
                            <div className="flex items-center gap-2 mb-6">
                              {[1, 2, 3].map((step) => (
                                <div key={step} className="flex-1 flex items-center gap-2">
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all duration-300 ${
                                    govStep >= step 
                                      ? 'bg-cyan-500 border-cyan-500 text-white' 
                                      : 'border-white/10 text-white/40'
                                  }`}>
                                    {step}
                                  </div>
                                  <span className="text-[10px] text-white/40 hidden md:inline">
                                    {step === 1 && "Organization"}
                                    {step === 2 && "User Details"}
                                    {step === 3 && "Role Scope"}
                                  </span>
                                  {step < 3 && <div className={`flex-1 h-0.5 ${govStep > step ? 'bg-cyan-500' : 'bg-white/10'}`} />}
                                </div>
                              ))}
                            </div>

                            <form onSubmit={handleGovSubmit} className="max-h-[280px] overflow-y-auto pr-2 custom-scrollbar space-y-4">
                              {/* Step 1: Org Information */}
                              {govStep === 1 && (
                                <motion.div 
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  className="space-y-4"
                                >
                                  <h3 className="text-sm font-semibold text-cyan-400 flex items-center gap-2 mb-2">
                                    <Building2 className="w-4 h-4" />
                                    <span>Organization Information</span>
                                  </h3>
                                  <div className="space-y-1">
                                    <label className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">Organization Name</label>
                                    <input
                                      type="text"
                                      name="orgName"
                                      required
                                      placeholder="Ministry of Transit / ChargeCorp"
                                      value={govData.orgName}
                                      onChange={handleGovInputChange}
                                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 transition-all text-sm"
                                    />
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                      <label className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">Org Type</label>
                                      <select
                                        name="orgType"
                                        value={govData.orgType}
                                        onChange={handleGovInputChange}
                                        className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50 transition-all text-sm"
                                      >
                                        <option>Government</option>
                                        <option>Charging Operator</option>
                                        <option>Admin</option>
                                      </select>
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">GST Number</label>
                                      <input
                                        type="text"
                                        name="gstNumber"
                                        placeholder="22AAAAA0000A1Z5"
                                        disabled={govData.orgType !== 'Charging Operator'}
                                        value={govData.gstNumber}
                                        onChange={handleGovInputChange}
                                        className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 transition-all text-sm ${
                                          govData.orgType !== 'Charging Operator' ? 'opacity-30 cursor-not-allowed' : ''
                                        }`}
                                      />
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">Contact Number</label>
                                    <input
                                      type="tel"
                                      name="orgContact"
                                      required
                                      placeholder="+1 555-0100"
                                      value={govData.orgContact}
                                      onChange={handleGovInputChange}
                                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 transition-all text-sm"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">Office Address</label>
                                    <textarea
                                      name="orgAddress"
                                      required
                                      rows={2}
                                      placeholder="100 Transit Way, Metro City"
                                      value={govData.orgAddress}
                                      onChange={handleGovInputChange}
                                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 transition-all text-sm resize-none"
                                    />
                                  </div>
                                </motion.div>
                              )}

                              {/* Step 2: User Information */}
                              {govStep === 2 && (
                                <motion.div 
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  className="space-y-4"
                                >
                                  <h3 className="text-sm font-semibold text-cyan-400 flex items-center gap-2 mb-2">
                                    <Briefcase className="w-4 h-4" />
                                    <span>User Information</span>
                                  </h3>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                      <label className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">Full Name</label>
                                      <input
                                        type="text"
                                        name="fullName"
                                        required
                                        placeholder="Dr. Sarah Jenkins"
                                        value={govData.fullName}
                                        onChange={handleGovInputChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 transition-all text-sm"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">Designation</label>
                                      <input
                                        type="text"
                                        name="designation"
                                        required
                                        placeholder="Senior Infrastructure Officer"
                                        value={govData.designation}
                                        onChange={handleGovInputChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 transition-all text-sm"
                                      />
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                      <label className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">Employee ID</label>
                                      <input
                                        type="text"
                                        name="employeeId"
                                        required
                                        placeholder="EMP-88219"
                                        value={govData.employeeId}
                                        onChange={handleGovInputChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 transition-all text-sm"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">Contact Number</label>
                                      <input
                                        type="tel"
                                        name="contactNumber"
                                        required
                                        placeholder="+1 555-0155"
                                        value={govData.contactNumber}
                                        onChange={handleGovInputChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 transition-all text-sm"
                                      />
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">Official Email ID</label>
                                    <input
                                      type="email"
                                      name="officialEmail"
                                      required
                                      placeholder="sarah.jenkins@gov.net"
                                      value={govData.officialEmail}
                                      onChange={handleGovInputChange}
                                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 transition-all text-sm"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">Password</label>
                                    <input
                                      type="password"
                                      name="password"
                                      required
                                      placeholder="••••••••"
                                      value={govData.password}
                                      onChange={handleGovInputChange}
                                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 transition-all text-sm"
                                    />
                                  </div>
                                </motion.div>
                              )}

                              {/* Step 3: Role & Scope Info */}
                              {govStep === 3 && (
                                <motion.div 
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  className="space-y-4"
                                >
                                  <h3 className="text-sm font-semibold text-cyan-400 flex items-center gap-2 mb-2">
                                    <Award className="w-4 h-4" />
                                    <span>Role & Scope Access</span>
                                  </h3>
                                  <div className="space-y-1">
                                    <label className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">Assigned Role</label>
                                    <select
                                      name="role"
                                      value={govData.role}
                                      onChange={handleGovInputChange}
                                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50 transition-all text-sm"
                                    >
                                      <option>Government User</option>
                                      <option>Operator User</option>
                                      <option>Super Admin</option>
                                    </select>
                                  </div>

                                  {/* Conditional Fields based on Role */}
                                  {govData.role === 'Government User' && (
                                    <motion.div 
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      className="grid grid-cols-2 gap-4"
                                    >
                                      <div className="space-y-1">
                                        <label className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">State / Jurisdiction</label>
                                        <input
                                          type="text"
                                          name="state"
                                          required
                                          placeholder="California"
                                          value={govData.state}
                                          onChange={handleGovInputChange}
                                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 transition-all text-sm"
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <label className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">Department Name</label>
                                        <input
                                          type="text"
                                          name="departmentName"
                                          required
                                          placeholder="DOT / Energy Board"
                                          value={govData.departmentName}
                                          onChange={handleGovInputChange}
                                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 transition-all text-sm"
                                        />
                                      </div>
                                    </motion.div>
                                  )}

                                  {govData.role === 'Operator User' && (
                                    <motion.div 
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      className="space-y-4"
                                    >
                                      <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                          <label className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">Region</label>
                                          <input
                                            type="text"
                                            name="region"
                                            required
                                            placeholder="Pacific Northwest"
                                            value={govData.region}
                                            onChange={handleGovInputChange}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 transition-all text-sm"
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">Operator Name</label>
                                          <input
                                            type="text"
                                            name="operatorName"
                                            required
                                            placeholder="ChargeCorp Ltd"
                                            value={govData.operatorName}
                                            onChange={handleGovInputChange}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 transition-all text-sm"
                                          />
                                        </div>
                                      </div>
                                      
                                      <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                          <label className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">No. of Stations</label>
                                          <input
                                            type="number"
                                            name="numChargingStations"
                                            required
                                            placeholder="45"
                                            value={govData.numChargingStations}
                                            onChange={handleGovInputChange}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 transition-all text-sm"
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">Assigned Station IDs</label>
                                          <input
                                            type="text"
                                            name="stationIds"
                                            required
                                            placeholder="ST-102, ST-109, ST-203"
                                            value={govData.stationIds}
                                            onChange={handleGovInputChange}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 transition-all text-sm"
                                          />
                                        </div>
                                      </div>
                                      <div className="space-y-1">
                                        <label className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">Service Areas</label>
                                        <input
                                          type="text"
                                          name="serviceAreas"
                                          required
                                          placeholder="LA County, Orange County"
                                          value={govData.serviceAreas}
                                          onChange={handleGovInputChange}
                                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 transition-all text-sm"
                                        />
                                      </div>
                                    </motion.div>
                                  )}

                                  {govData.role === 'Super Admin' && (
                                    <motion.div 
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      className="space-y-1"
                                    >
                                      <label className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">Access Clearance Level</label>
                                      <select
                                        name="accessLevel"
                                        value={govData.accessLevel}
                                        onChange={handleGovInputChange}
                                        className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50 transition-all text-sm"
                                      >
                                        <option>L1 - Read Only</option>
                                        <option>L2 - Operator Operations</option>
                                        <option>L3 - Fully Unrestricted Security root</option>
                                      </select>
                                    </motion.div>
                                  )}
                                </motion.div>
                              )}
                            </form>

                            {/* Navigation Buttons for Stepper */}
                            <div className="flex justify-between items-center pt-4 border-t border-white/5">
                              {govStep > 1 ? (
                                <button
                                  type="button"
                                  onClick={() => setGovStep(prev => prev - 1)}
                                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white/60 hover:text-white flex items-center gap-1.5 transition-all"
                                >
                                  <ArrowLeft className="w-3.5 h-3.5" />
                                  <span>Back</span>
                                </button>
                              ) : <div />}

                              <button
                                type="button"
                                onClick={handleGovSubmit}
                                disabled={authLoading}
                                className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all duration-300 shadow-[0_4px_15px_rgba(6,182,212,0.2)] disabled:opacity-70 disabled:cursor-not-allowed"
                              >
                                {authLoading && govStep === 3 ? (
                                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-1" />
                                ) : null}
                                <span>{govStep === 3 ? "Submit Application" : "Continue"}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>


                    </div>
                  )}

                </div>
              </div>

            </motion.div>
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full text-center py-4 text-white/50 text-xs tracking-wider z-10 pb-6 border-t border-white/5">
          © 2026 EV SmartNav<br/>
          <span className="font-semibold text-white/70">AI Powered EV Route Planning System</span>
        </footer>

      </div>
    </div>
  );
}


