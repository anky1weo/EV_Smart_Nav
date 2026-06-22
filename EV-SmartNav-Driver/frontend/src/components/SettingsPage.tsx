import React, { useState, useEffect } from 'react';
import { Settings, Bell, Shield, Smartphone, Car, Zap, CreditCard, ChevronRight, Edit2, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SettingsPage() {
  const { user, profile, vehicle, updateProfile, upsertVehicle } = useAuth();
  
  const [avoidTolls, setAvoidTolls] = useState(false);
  const [lowBatteryWarnings, setLowBatteryWarnings] = useState(true);
  const [newStationsAlert, setNewStationsAlert] = useState(true);

  const [isEditingVehicle, setIsEditingVehicle] = useState(false);
  const [editVehicleData, setEditVehicleData] = useState({ company: '', model_name: '', registration_number: '', battery_capacity_kwh: 60, total_range_km: 300 });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfileData, setEditProfileData] = useState({ full_name: '', phone: '' });

  useEffect(() => {
    if (vehicle) setEditVehicleData({ company: vehicle.company || '', model_name: vehicle.model_name || '', registration_number: vehicle.registration_number || '', battery_capacity_kwh: vehicle.battery_capacity_kwh || 60, total_range_km: vehicle.total_range_km || (vehicle.battery_capacity_kwh ? vehicle.battery_capacity_kwh * 5 : 300) });
    if (profile) setEditProfileData({ full_name: profile.full_name || '', phone: profile.phone || '' });
  }, [vehicle, profile]);

  const handleSaveVehicle = async () => {
    await upsertVehicle(editVehicleData);
    setIsEditingVehicle(false);
  };

  const handleSaveProfile = async () => {
    await updateProfile(editProfileData);
    setIsEditingProfile(false);
  };

  return (
    <div className="flex flex-col gap-6 w-full h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar pr-2 pb-10">
      
      {/* Header */}
      <div className="flex justify-between items-end mb-2">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Settings className="w-8 h-8 text-emerald-400" />
            Preferences
          </h2>
          <p className="text-white/60">Customize your navigation, vehicle limits, and account settings.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        
        {/* Navigation Settings */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white">AI Navigation</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
              <div>
                <p className="text-white font-medium mb-1">Battery Fear Threshold</p>
                <p className="text-xs text-white/50">AI will automatically route you to a charger before you hit this level.</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 font-bold">15%</span>
                <ChevronRight className="w-4 h-4 text-white/40" />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
              <div>
                <p className="text-white font-medium mb-1">Preferred Connectors</p>
                <p className="text-xs text-white/50">Only show stations compatible with these plugs.</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-white/80 font-medium">{vehicle?.connector_type || 'Type 2, CCS2'}</span>
                <ChevronRight className="w-4 h-4 text-white/40" />
              </div>
            </div>

            <div 
              onClick={() => setAvoidTolls(!avoidTolls)}
              className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5 hover:border-white/10 transition-colors cursor-pointer"
            >
              <div>
                <p className="text-white font-medium mb-1">Avoid Tolls</p>
                <p className="text-xs text-white/50">Prioritize free routes when generating AI path.</p>
              </div>
              <div className={`w-11 h-6 rounded-full relative transition-colors duration-300 ${avoidTolls ? 'bg-emerald-500' : 'bg-white/10'}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform duration-300 ${avoidTolls ? 'translate-x-6 shadow-sm' : 'translate-x-1'}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Profile */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                <Car className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white">Vehicle Profile</h3>
            </div>
            {isEditingVehicle ? (
              <button onClick={handleSaveVehicle} className="p-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/40 rounded-xl transition-colors">
                <Save className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={() => setIsEditingVehicle(true)} className="p-2 bg-white/5 text-white/50 hover:text-white rounded-xl transition-colors">
                <Edit2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
              <p className="text-white font-medium mb-2">Active Vehicle</p>
              {isEditingVehicle ? (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <input type="text" value={editVehicleData.company} onChange={e => setEditVehicleData({...editVehicleData, company: e.target.value})} placeholder="Make (e.g. Tesla)" className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:border-emerald-500 outline-none" />
                  <input type="text" value={editVehicleData.model_name} onChange={e => setEditVehicleData({...editVehicleData, model_name: e.target.value})} placeholder="Model" className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:border-emerald-500 outline-none" />
                  <input type="text" value={editVehicleData.registration_number} onChange={e => setEditVehicleData({...editVehicleData, registration_number: e.target.value})} placeholder="Reg No." className="col-span-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:border-emerald-500 outline-none" />
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-emerald-400 font-bold">{vehicle?.company || 'Unknown'} {vehicle?.model_name || 'Vehicle'}</p>
                    <p className="text-xs text-white/50 mt-1">Registration: {vehicle?.registration_number || 'Not provided'}</p>
                  </div>
                  <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-lg border border-emerald-500/20">
                    Connected
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
              <div>
                <p className="text-white font-medium mb-1">Battery Capacity</p>
                <p className="text-xs text-white/50">Used for drain calculations.</p>
              </div>
              <div className="flex items-center gap-3">
                {isEditingVehicle ? (
                  <div className="flex items-center gap-2">
                    <input type="number" value={editVehicleData.battery_capacity_kwh} onChange={e => setEditVehicleData({...editVehicleData, battery_capacity_kwh: parseFloat(e.target.value) || 0})} className="w-20 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm text-white text-right focus:border-emerald-500 outline-none" />
                    <span className="text-white/80 font-medium">kWh</span>
                  </div>
                ) : (
                  <span className="text-white/80 font-medium">{vehicle?.battery_capacity_kwh || 60} kWh</span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
              <div>
                <p className="text-white font-medium mb-1">Total Maximum Range</p>
                <p className="text-xs text-white/50">Used for accurate distance calculations.</p>
              </div>
              <div className="flex items-center gap-3">
                {isEditingVehicle ? (
                  <div className="flex items-center gap-2">
                    <input type="number" value={editVehicleData.total_range_km} onChange={e => setEditVehicleData({...editVehicleData, total_range_km: parseFloat(e.target.value) || 0})} className="w-20 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm text-white text-right focus:border-emerald-500 outline-none" />
                    <span className="text-white/80 font-medium">km</span>
                  </div>
                ) : (
                  <span className="text-white/80 font-medium">{vehicle?.total_range_km || (vehicle?.battery_capacity_kwh ? vehicle.battery_capacity_kwh * 5 : 300)} km</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Notifications & Billing */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-500/20 text-orange-400 rounded-xl">
              <Bell className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white">Notifications</h3>
          </div>

          <div className="space-y-4">
            <div 
              onClick={() => setLowBatteryWarnings(!lowBatteryWarnings)}
              className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5 hover:border-white/10 transition-colors cursor-pointer"
            >
              <div>
                <p className="text-white font-medium mb-1">Low Battery Warnings</p>
                <p className="text-xs text-white/50">Push notifications when battery drops below 20%</p>
              </div>
              <div className={`w-11 h-6 rounded-full relative transition-colors duration-300 ${lowBatteryWarnings ? 'bg-emerald-500' : 'bg-white/10'}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform duration-300 ${lowBatteryWarnings ? 'translate-x-6 shadow-sm' : 'translate-x-1'}`} />
              </div>
            </div>
            
            <div 
              onClick={() => setNewStationsAlert(!newStationsAlert)}
              className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5 hover:border-white/10 transition-colors cursor-pointer"
            >
              <div>
                <p className="text-white font-medium mb-1">New Charging Stations</p>
                <p className="text-xs text-white/50">Alert me when new stations open nearby</p>
              </div>
              <div className={`w-11 h-6 rounded-full relative transition-colors duration-300 ${newStationsAlert ? 'bg-emerald-500' : 'bg-white/10'}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform duration-300 ${newStationsAlert ? 'translate-x-6 shadow-sm' : 'translate-x-1'}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 text-purple-400 rounded-xl">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white">Security & Privacy</h3>
            </div>
            {isEditingProfile ? (
              <button onClick={handleSaveProfile} className="p-2 bg-purple-500/20 text-purple-400 hover:bg-purple-500/40 rounded-xl transition-colors">
                <Save className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={() => setIsEditingProfile(true)} className="p-2 bg-white/5 text-white/50 hover:text-white rounded-xl transition-colors">
                <Edit2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div className="w-full p-4 bg-black/40 rounded-2xl border border-white/5 mb-2">
              <p className="text-white font-medium mb-2">Account Holder</p>
              {isEditingProfile ? (
                <div className="flex flex-col gap-2 mt-2">
                  <input type="text" value={editProfileData.full_name} onChange={e => setEditProfileData({...editProfileData, full_name: e.target.value})} placeholder="Full Name" className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:border-purple-500 outline-none" />
                  <input type="tel" value={editProfileData.phone} onChange={e => setEditProfileData({...editProfileData, phone: e.target.value})} placeholder="Phone Number" className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:border-purple-500 outline-none" />
                  <p className="text-xs text-white/40 mt-1">Email: {user?.email} (Cannot be changed)</p>
                </div>
              ) : (
                <div className="text-left">
                  <p className="text-xs text-white/50 mb-0.5">{profile?.full_name || 'No name provided'}</p>
                  <p className="text-xs text-white/50 mb-0.5">{user?.email}</p>
                  {profile?.phone && <p className="text-xs text-white/50">{profile.phone}</p>}
                </div>
              )}
            </div>
            
            <button 
              onClick={() => alert('Password reset email has been sent to ' + user?.email)}
              className="w-full flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5 hover:border-white/10 transition-colors"
            >
              <div className="text-left">
                <p className="text-white font-medium mb-1">Change Password</p>
                <p className="text-xs text-white/50">Send reset link to email</p>
              </div>
              <ChevronRight className="w-4 h-4 text-white/40" />
            </button>
            <button 
              onClick={() => {
                if(window.confirm('Are you absolutely sure you want to permanently delete your account and all trip history?')) {
                  alert('Account deletion initiated. This action is irreversible.');
                }
              }}
              className="w-full flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5 hover:border-red-500/30 transition-colors group"
            >
              <div className="text-left">
                <p className="text-red-400 font-medium mb-1">Delete Account</p>
                <p className="text-xs text-red-400/50 group-hover:text-red-400/80">Permanently erase all trip data</p>
              </div>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
