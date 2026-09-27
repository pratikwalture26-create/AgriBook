import React, { useState } from 'react';
import { useAgriBook } from '../../services/appState';
import {
  Play,
  CheckCircle2,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  Volume2,
  Scale,
  IndianRupee,
  Sparkles,
} from 'lucide-react';

export const DemoBar: React.FC = () => {
  const {
    state,
    setRole,
    setCurrentFarmer,
    setSelectedCentre,
    callNextFarmer,
    completeProcurement,
    simulatePaymentSuccess,
    resetDemoData,
  } = useAgriBook();

  const [isExpanded, setIsExpanded] = useState(true);

  // Quick Demo Actions for SIH Judges
  const runStep1_FarmerLogin = () => {
    setRole('FARMER');
    setCurrentFarmer('farmer-1'); // Ramesh Patil
  };

  const runStep2_CongestionCheck = () => {
    setRole('FARMER');
    setSelectedCentre('centre-2'); // Amravati High Congestion
  };

  const runStep3_OperatorCall = () => {
    setRole('OPERATOR');
    setSelectedCentre('centre-1'); // Wardha
    callNextFarmer('centre-1');
  };

  const runStep4_WeighmentProcurement = () => {
    setRole('OPERATOR');
    setSelectedCentre('centre-1');
    // Complete for active token A105 or earliest waiting
    const booking = state.bookings.find((b) => b.centreId === 'centre-1' && b.status !== 'COMPLETED');
    if (booking) {
      completeProcurement(booking.tokenNumber, booking.quantityQuintals, 'Grade A (FAQ)');
    }
  };

  const runStep5_PaymentSimulate = () => {
    setRole('FARMER');
    const payment = state.payments.find((p) => p.status !== 'PAID');
    if (payment) {
      simulatePaymentSuccess(payment.id);
    }
  };

  const runStep6_AdminView = () => {
    setRole('ADMIN');
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-slate-900 text-white border-t border-slate-700 shadow-2xl transition-all">
      {/* Toggle Tab */}
      <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
            SIH 26032 • 3-Minute Demo Pitch Sequence
          </span>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-slate-400 hover:text-white text-xs flex items-center gap-1 font-semibold"
        >
          <span>{isExpanded ? 'Minimize Pitch Bar' : 'Expand Pitch Bar'}</span>
          {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="max-w-7xl mx-auto px-4 pb-3 pt-1 border-t border-slate-800">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 text-[11px] font-semibold hidden md:inline">
              Simulate Journey:
            </span>

            <button
              onClick={runStep1_FarmerLogin}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg font-medium border border-slate-700 flex items-center gap-1 transition-all"
            >
              <span>1. Farmer Login</span>
            </button>

            <button
              onClick={runStep2_CongestionCheck}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg font-medium border border-slate-700 flex items-center gap-1 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>2. Demand AI &amp; Congestion</span>
            </button>

            <button
              onClick={runStep3_OperatorCall}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg font-medium border border-slate-700 flex items-center gap-1 transition-all"
            >
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>3. Operator Calls Token</span>
            </button>

            <button
              onClick={runStep4_WeighmentProcurement}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg font-medium border border-slate-700 flex items-center gap-1 transition-all"
            >
              <Scale className="w-3.5 h-3.5 text-blue-400" />
              <span>4. Weighment &amp; MSP</span>
            </button>

            <button
              onClick={runStep5_PaymentSimulate}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg font-medium border border-slate-700 flex items-center gap-1 transition-all"
            >
              <IndianRupee className="w-3.5 h-3.5 text-amber-400" />
              <span>5. Simulate Payment</span>
            </button>

            <button
              onClick={runStep6_AdminView}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg font-medium border border-slate-700 flex items-center gap-1 transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>6. Admin &amp; Audit Trail</span>
            </button>

            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={resetDemoData}
                className="px-3 py-1.5 bg-red-950 hover:bg-red-900 text-red-200 border border-red-800 rounded-lg font-bold text-xs flex items-center gap-1 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Demo</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
