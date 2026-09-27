import React from 'react';
import { useAgriBook } from '../services/appState';
import { UserRole } from '../types';
import {
  Tractor,
  Building2,
  BarChart3,
  PhoneCall,
  Bell,
  CheckCircle2,
  Cpu,
  RefreshCw,
} from 'lucide-react';

interface NavbarProps {
  onOpenSmsDrawer: () => void;
  smsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSmsDrawer, smsCount }) => {
  const { state, setRole, setLanguage, resetDemoData } = useAgriBook();

  const navRoles: { id: UserRole; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'FARMER',
      label: state.language === 'en' ? 'Farmer App' : 'किसान ॲप',
      icon: <Tractor className="w-4 h-4" />,
    },
    {
      id: 'OPERATOR',
      label: state.language === 'en' ? 'Centre Operator' : 'केंद्र ऑपरेटर',
      icon: <Building2 className="w-4 h-4" />,
    },
    {
      id: 'ADMIN',
      label: state.language === 'en' ? 'Admin Analytics' : 'प्रशासक डॅशबोर्ड',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: 'HELPLINE',
      label: state.language === 'en' ? 'Helpline (Book by Phone)' : 'फोन बुकिंग हेल्पलाईन',
      icon: <PhoneCall className="w-4 h-4" />,
      badge: 'Fallback',
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-emerald-900/10 shadow-xs">
      {/* Top Ministry Banner */}
      <div className="bg-emerald-950 text-emerald-100 text-xs py-1.5 px-4 font-sans flex flex-wrap items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-medium tracking-wide">
            Smart India Hackathon 2026 (SIH26032) • Ministry of Consumer Affairs, Food & Public Distribution
          </span>
        </div>
        <div className="flex items-center space-x-4 text-[11px] text-emerald-300">
          <span className="flex items-center gap-1">
            <Cpu className="w-3 h-3 text-emerald-400" />
            XGBoost Demand Engine: <strong className="text-white">Active</strong>
          </span>
          <span className="hidden sm:inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Redis Live Queue: <strong className="text-white">Synced</strong>
          </span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-700/20">
              <Tractor className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold text-emerald-950 tracking-tight">AgriBook</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                  SIH Prototype
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Predict demand. Book smarter. Track the queue. Know your status.
              </p>
            </div>
          </div>

          {/* Role Navigation Pills */}
          <div className="hidden lg:flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
            {navRoles.map((role) => {
              const active = state.currentRole === role.id;
              return (
                <button
                  key={role.id}
                  id={`nav-role-${role.id.toLowerCase()}`}
                  onClick={() => setRole(role.id)}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    active
                      ? 'bg-white text-emerald-900 shadow-xs border border-slate-200/80 font-bold'
                      : 'text-slate-600 hover:text-emerald-950 hover:bg-slate-200/50'
                  }`}
                >
                  {role.icon}
                  <span>{role.label}</span>
                  {role.badge && (
                    <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full font-medium">
                      {role.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Controls: Language, SMS Bell, Reset Demo */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Language Switch */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                id="btn-lang-en"
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded-md font-semibold transition-all ${
                  state.language === 'en'
                    ? 'bg-white text-emerald-950 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                EN
              </button>
              <button
                id="btn-lang-hi"
                onClick={() => setLanguage('hi')}
                className={`px-2 py-1 rounded-md font-semibold transition-all ${
                  state.language === 'hi'
                    ? 'bg-white text-emerald-950 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                हिंदी
              </button>
            </div>

            {/* Twilio SMS Notification Drawer Button */}
            <button
              id="btn-open-sms-drawer"
              onClick={onOpenSmsDrawer}
              className="relative p-2 text-slate-700 hover:text-emerald-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all border border-slate-200"
              title="View simulated Twilio SMS feed"
            >
              <Bell className="w-5 h-5" />
              {smsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {smsCount}
                </span>
              )}
            </button>

            {/* Reset Demo Button */}
            <button
              id="btn-reset-demo"
              onClick={resetDemoData}
              className="p-2 text-slate-500 hover:text-red-700 bg-slate-100 hover:bg-red-50 rounded-xl transition-all border border-slate-200 text-xs flex items-center gap-1 font-medium"
              title="Reset state to pristine demo"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden md:inline">Reset Demo</span>
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navbar for Role Switching */}
        <div className="flex lg:hidden overflow-x-auto py-2 border-t border-slate-200/60 gap-1.5 scrollbar-none">
          {navRoles.map((role) => {
            const active = state.currentRole === role.id;
            return (
              <button
                key={role.id}
                onClick={() => setRole(role.id)}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                  active
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {role.icon}
                <span>{role.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
