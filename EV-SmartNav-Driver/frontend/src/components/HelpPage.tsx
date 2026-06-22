import React from 'react';
import { HelpCircle, Mail, MessageSquare, FileText, ChevronRight, BookOpen } from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="flex flex-col gap-6 w-full h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar pr-2 pb-10">
      
      {/* Header */}
      <div className="flex justify-between items-end mb-2">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <HelpCircle className="w-8 h-8 text-emerald-400" />
            Help & Support
          </h2>
          <p className="text-white/60">Find answers, get in touch with our team, or read the documentation.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        
        {/* FAQ Section */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
          <h3 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h3>
          
          <div className="space-y-4">
            <div className="p-5 bg-black/40 border border-white/5 rounded-2xl">
              <h4 className="text-emerald-400 font-semibold mb-2">How does the AI predict my battery drain?</h4>
              <p className="text-sm text-white/70 leading-relaxed">
                Our machine learning model analyzes your vehicle's battery capacity, the total distance of your route, elevation changes, and live traffic data. It uses a Random Forest Regressor trained on thousands of EV trips to give an accuracy of ±2.4 km.
              </p>
            </div>

            <div className="p-5 bg-black/40 border border-white/5 rounded-2xl">
              <h4 className="text-emerald-400 font-semibold mb-2">What happens in Emergency Mode?</h4>
              <p className="text-sm text-white/70 leading-relaxed">
                Emergency Mode disables your standard preferences (like avoiding tolls or preferred networks) and instantly locates the absolute closest charging station to prevent your car from dying. It also provides one-tap SOS sharing.
              </p>
            </div>

            <div className="p-5 bg-black/40 border border-white/5 rounded-2xl">
              <h4 className="text-emerald-400 font-semibold mb-2">How do I earn Eco Points?</h4>
              <p className="text-sm text-white/70 leading-relaxed">
                Eco Points are automatically awarded at the end of every trip. You earn more points by driving efficiently, using regenerative braking, and choosing charging stations powered by renewable energy.
              </p>
            </div>
          </div>
        </div>

        {/* Contact & Docs */}
        <div className="flex flex-col gap-6">
          <div className="bg-gradient-to-br from-emerald-900/40 to-[#0f111a] border border-emerald-500/30 rounded-3xl p-6 backdrop-blur-md">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Need live help?</h3>
            <p className="text-sm text-white/60 mb-6">Our support team is available 24/7 to assist with routing issues or account recovery.</p>
            <button className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-xl transition-colors">
              Start Live Chat
            </button>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
            <h3 className="text-lg font-bold text-white mb-4">Resources</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-colors group">
                <div className="flex items-center gap-3 text-white/80 group-hover:text-emerald-400 transition-colors">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-sm font-medium">User Manual</span>
                </div>
                <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-emerald-400" />
              </button>
              <button className="w-full flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-colors group">
                <div className="flex items-center gap-3 text-white/80 group-hover:text-emerald-400 transition-colors">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm font-medium">Email Support</span>
                </div>
                <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-emerald-400" />
              </button>
              <button className="w-full flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-colors group">
                <div className="flex items-center gap-3 text-white/80 group-hover:text-emerald-400 transition-colors">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm font-medium">Terms of Service</span>
                </div>
                <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-emerald-400" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
