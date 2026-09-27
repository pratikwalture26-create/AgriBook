/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAgriBook } from './services/appState';
import { Navbar } from './components/Navbar';
import { SmsDrawer } from './components/SmsDrawer';
import { Toast } from './components/Toast';
import { FarmerApp } from './components/FarmerApp/FarmerApp';
import { OperatorDashboard } from './components/OperatorDashboard/OperatorDashboard';
import { AdminDashboard } from './components/AdminDashboard/AdminDashboard';
import { HelplineConsole } from './components/HelplineConsole/HelplineConsole';
import { DemoBar } from './components/DemoController/DemoBar';
import { ShieldCheck, Cpu, Database, Server, Smartphone } from 'lucide-react';

export default function App() {
  const { state } = useAgriBook();
  const [isSmsOpen, setIsSmsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased pb-20">
      {/* Top Navigation */}
      <Navbar
        onOpenSmsDrawer={() => setIsSmsOpen(true)}
        smsCount={state.notifications.length}
      />

      {/* Floating System Toast */}
      <Toast />

      {/* Main Content Area */}
      <main className="flex-1">
        {state.currentRole === 'FARMER' && <FarmerApp />}
        {state.currentRole === 'OPERATOR' && <OperatorDashboard />}
        {state.currentRole === 'ADMIN' && <AdminDashboard />}
        {state.currentRole === 'HELPLINE' && <HelplineConsole />}
      </main>

      {/* Slide-in Twilio SMS Notification Drawer */}
      <SmsDrawer isOpen={isSmsOpen} onClose={() => setIsSmsOpen(false)} />

      {/* Hackathon 3-Minute Demo Bar */}
      <DemoBar />

      {/* Bottom Architectural Credits & Governance Disclaimer */}
      <footer className="mt-12 bg-white border-t border-slate-200 py-6 px-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 font-bold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>AgriBook • SIH 26032 Architecture Layer</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Intelligent coordination layer complementing existing government procurement portals (e-NAM / state mandis).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
            <span className="bg-slate-100 px-2 py-1 rounded-md border border-slate-200 text-slate-700 flex items-center gap-1">
              <Smartphone className="w-3 h-3 text-slate-500" /> Mobile / Web UI
            </span>
            <span className="bg-slate-100 px-2 py-1 rounded-md border border-slate-200 text-slate-700 flex items-center gap-1">
              <Server className="w-3 h-3 text-slate-500" /> Express REST API
            </span>
            <span className="bg-slate-100 px-2 py-1 rounded-md border border-slate-200 text-slate-700 flex items-center gap-1">
              <Database className="w-3 h-3 text-slate-500" /> MongoDB + Redis
            </span>
            <span className="bg-slate-100 px-2 py-1 rounded-md border border-slate-200 text-slate-700 flex items-center gap-1">
              <Cpu className="w-3 h-3 text-slate-500" /> XGBoost Demand AI
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
