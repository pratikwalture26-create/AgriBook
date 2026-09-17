import React, { useState } from 'react';
import { useAgriBook } from '../../services/appState';
import { MSP_RATES } from '../../data/sampleData';
import {
  Building2,
  Users,
  Clock,
  CheckCircle2,
  Play,
  Volume2,
  FileCheck2,
  IndianRupee,
  Scale,
  X,
  Check,
  RotateCcw,
  Radio,
  Sparkles,
  ArrowRight,
  Database,
  Cpu,
  Layers,
} from 'lucide-react';

export const OperatorDashboard: React.FC = () => {
  const {
    state,
    isRealTimeConnected,
    setSelectedCentre,
    callNextFarmer,
    markTokenProcessing,
    completeProcurement,
    simulatePaymentSuccess,
    resetDemoData,
  } = useAgriBook();

  const selectedCentre =
    state.centres.find((c) => c.id === state.selectedCentreId) || state.centres[0];

  // Filter bookings for this centre
  const centreBookings = state.bookings.filter((b) => b.centreId === selectedCentre.id);
  const waitingBookings = centreBookings
    .filter((b) => b.status === 'WAITING')
    .sort((a, b) => a.queuePosition - b.queuePosition);
  const calledBookings = centreBookings.filter((b) => b.status === 'CALLED');
  const processingBookings = centreBookings.filter((b) => b.status === 'PROCESSING');
  const completedBookings = centreBookings.filter((b) => b.status === 'COMPLETED');

  // Weighment Entry Modal State
  const [weighmentModalToken, setWeighmentModalToken] = useState<string | null>(null);
  const [actualQuintals, setActualQuintals] = useState<number>(40);
  const [qualityGrade, setQualityGrade] = useState<'Grade A (FAQ)' | 'Grade B' | 'Standard'>(
    'Grade A (FAQ)'
  );

  const activeTokenToComplete = centreBookings.find((b) => b.tokenNumber === weighmentModalToken);

  const handleOpenWeighment = (tokenNumber: string) => {
    const booking = centreBookings.find((b) => b.tokenNumber === tokenNumber);
    if (booking) {
      setActualQuintals(booking.quantityQuintals);
    }
    setWeighmentModalToken(tokenNumber);
  };

  const handleSaveWeighment = () => {
    if (!weighmentModalToken) return;
    completeProcurement(weighmentModalToken, actualQuintals, qualityGrade);
    setWeighmentModalToken(null);
  };

  // The primary spotlight token currently processing at weighbridge
  const spotlightProcessingToken = processingBookings[0] || calledBookings[0] || null;

  return (
    <div className="py-6 px-4 sm:px-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header: Mandi Selector, Architecture Badges & Demo Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-800 text-white rounded-xl shadow-xs">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Operating Mandi Yard:
              </span>
              <select
                id="select-centre"
                value={selectedCentre.id}
                onChange={(e) => setSelectedCentre(e.target.value)}
                className="text-sm sm:text-base font-bold text-emerald-950 bg-emerald-50 border border-emerald-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                {state.centres.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.district})
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Code: <strong className="text-slate-700">{selectedCentre.code}</strong> • Daily Capacity: {selectedCentre.dailyCapacity} farmers/day • Processing Speed: {selectedCentre.processingRatePerHour} farmers/hr
            </p>
          </div>
        </div>

        {/* Real-time Status and Presentation Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Node.js Real-time Stream Badge */}
          <div
            id="realtime-stream-badge"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border bg-emerald-50 text-emerald-900 border-emerald-200"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            <span className="font-mono">Node.js SSE Stream Live</span>
          </div>

          {/* Reset Demo Presentation Button */}
          <button
            id="btn-reset-demo"
            onClick={resetDemoData}
            title="Reset to 7 sample tokens for presentation"
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-bold rounded-xl shadow-2xs flex items-center gap-1.5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Demo Tokens</span>
          </button>

          {/* Prominent CALL NEXT Button */}
          <button
            id="btn-call-next"
            onClick={() => callNextFarmer(selectedCentre.id)}
            disabled={waitingBookings.length === 0}
            className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm flex items-center gap-2 transition-all hover:scale-[1.02]"
          >
            <Volume2 className="w-4 h-4 text-emerald-300" />
            <span>CALL NEXT</span>
            {waitingBookings.length > 0 && (
              <span className="bg-emerald-700 text-emerald-100 text-[11px] font-mono px-1.5 py-0.5 rounded-md">
                {waitingBookings[0].tokenNumber}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Storage Architecture Callout */}
      <div className="bg-slate-900 text-slate-200 px-4 py-2.5 rounded-xl text-xs flex flex-wrap items-center justify-between gap-3 shadow-inner">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-semibold text-slate-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-400" /> Architecture Stack:
          </span>
          <span className="flex items-center gap-1 text-emerald-300 font-mono">
            <Cpu className="w-3.5 h-3.5" /> Redis Fast Layer: Live Queue State (FIFO + Wait Times)
          </span>
          <span className="text-slate-500 hidden sm:inline">•</span>
          <span className="flex items-center gap-1 text-amber-300 font-mono">
            <Database className="w-3.5 h-3.5" /> MongoDB: Persistent Bookings, Procurement Slips &amp; PFMS Ledger
          </span>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          Auto-syncs Farmer Screen via Node.js
        </span>
      </div>

      {/* Live Operational Metrics Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider">Current Queue</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {waitingBookings.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Waiting in Redis FIFO queue
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider">Currently Processing</span>
            <Scale className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-900 font-mono">
            {processingBookings.length + calledBookings.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            At weighbridge / moisture counter
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider">Completed Today</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-800 font-mono">
            {completedBookings.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Procurement slips issued
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider">Expected Waiting Time</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-900 font-mono">
            {waitingBookings.length > 0 ? `${waitingBookings[0].estimatedWaitMinutes} min` : '0 min'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Next farmer wait: ~{Math.round(60 / (selectedCentre.processingRatePerHour || 8))} min/vehicle
          </div>
        </div>
      </div>

      {/* SECTION 1: CURRENTLY PROCESSING TOKEN (HERO SPOTLIGHT) */}
      <div className="bg-gradient-to-br from-blue-50/70 via-white to-slate-50 rounded-2xl border-2 border-blue-200 shadow-sm p-5">
        <div className="flex items-center justify-between pb-3 border-b border-blue-100 mb-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-600 text-white rounded-lg">
              <Scale className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>CURRENTLY PROCESSING TOKEN</span>
                <span className="text-[11px] bg-blue-100 text-blue-800 font-mono px-2 py-0.5 rounded-full border border-blue-200">
                  Bay #1 Active
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Live vehicle weighment, electronic moisture sampling, and FAQ quality verification
              </p>
            </div>
          </div>
          {spotlightProcessingToken && (
            <span className="text-xs font-mono font-bold text-blue-900 bg-blue-100/80 px-2.5 py-1 rounded-lg border border-blue-200">
              Token {spotlightProcessingToken.tokenNumber}
            </span>
          )}
        </div>

        {spotlightProcessingToken ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-center">
            {/* Spotlight Token Card */}
            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-blue-100 shadow-2xs">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase">Token Number</span>
                <div className="text-2xl sm:text-3xl font-black text-blue-950 font-mono mt-0.5">
                  {spotlightProcessingToken.tokenNumber}
                </div>
                <span className="text-[11px] text-blue-700 font-semibold">
                  Status: {spotlightProcessingToken.status}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase">Farmer Details</span>
                <div className="font-bold text-slate-900 text-sm mt-0.5 truncate">
                  {spotlightProcessingToken.farmerName}
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  +91-{spotlightProcessingToken.farmerMobile}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase">Crop &amp; Load</span>
                <div className="font-bold text-slate-900 text-sm mt-0.5">
                  {spotlightProcessingToken.crop}
                </div>
                <span className="text-[11px] text-slate-600 font-medium">
                  {spotlightProcessingToken.quantityQuintals} Quintals
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase">Moisture &amp; Grade</span>
                <div className="font-bold text-emerald-800 text-sm mt-0.5">
                  8.2% Moisture
                </div>
                <span className="text-[11px] text-slate-500">FAQ Compliant</span>
              </div>
            </div>

            {/* Action Buttons for Processing Token */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5">
              {spotlightProcessingToken.status === 'CALLED' ? (
                <button
                  id="btn-mark-processing"
                  onClick={() => markTokenProcessing(spotlightProcessingToken.tokenNumber)}
                  className="w-full py-3 px-4 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                >
                  <Play className="w-4 h-4" />
                  <span>MARK PROCESSING</span>
                </button>
              ) : (
                <button
                  id="btn-mark-completed"
                  onClick={() => handleOpenWeighment(spotlightProcessingToken.tokenNumber)}
                  className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>MARK COMPLETED</span>
                </button>
              )}

              <div className="text-[11px] text-slate-500 text-center">
                Clicking updates Redis &amp; pushes real-time event to Farmer App
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 bg-white/60 rounded-xl border border-dashed border-blue-200">
            <Scale className="w-8 h-8 text-blue-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No token currently at the weighbridge bay</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Click <strong className="text-emerald-800">CALL NEXT</strong> to bring the next waiting farmer to the gate.
            </p>
          </div>
        )}
      </div>

      {/* SECTION 2: CURRENT QUEUE (WAITING TOKENS WITH ESTIMATED WAIT TIME) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>CURRENT QUEUE (WAITING TOKENS)</span>
              <span className="text-xs font-mono font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-lg border border-emerald-200">
                {waitingBookings.length} Waiting in FIFO
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Tracked in Redis in-memory list • Ordered by arrival timestamp and dynamic estimated waiting time
            </p>
          </div>

          <button
            onClick={() => callNextFarmer(selectedCentre.id)}
            disabled={waitingBookings.length === 0}
            className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-2xs inline-flex items-center gap-1.5"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>CALL NEXT</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Position</th>
                <th className="py-3 px-4">Token #</th>
                <th className="py-3 px-4">Farmer Details</th>
                <th className="py-3 px-4">Crop &amp; Qtl</th>
                <th className="py-3 px-4">Slot Time</th>
                <th className="py-3 px-4">Estimated Waiting Time</th>
                <th className="py-3 px-4 text-right">Operator Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
              {waitingBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    No farmers currently waiting in queue. All active tokens have been called or completed.
                  </td>
                </tr>
              ) : (
                waitingBookings.map((b, idx) => {
                  const isNext = idx === 0;
                  return (
                    <tr
                      key={b.id}
                      className={`hover:bg-slate-50/90 transition-colors ${
                        isNext ? 'bg-emerald-50/40' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                            isNext
                              ? 'bg-emerald-700 text-white shadow-2xs'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          #{b.queuePosition}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-950 text-sm">
                        {b.tokenNumber}
                        {b.farmerName === 'Ramesh Patil' && (
                          <span className="ml-1.5 text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-sans font-semibold px-1.5 py-0.5 rounded">
                            Demo Farmer
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{b.farmerName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">+91-{b.farmerMobile}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{b.crop}</div>
                        <div className="text-[11px] text-slate-500">{b.quantityQuintals} Quintals</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {b.slotTime}
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        <span
                          className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-md ${
                            b.estimatedWaitMinutes <= 10
                              ? 'bg-emerald-100 text-emerald-800'
                              : b.estimatedWaitMinutes <= 20
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          <span>{b.estimatedWaitMinutes} min wait</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                        {isNext ? (
                          <button
                            onClick={() => callNextFarmer(selectedCentre.id)}
                            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-bold shadow-xs inline-flex items-center gap-1 transition-all"
                          >
                            <Volume2 className="w-3 h-3" />
                            <span>CALL NEXT</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => markTokenProcessing(b.tokenNumber)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-[11px] font-semibold inline-flex items-center gap-1"
                          >
                            <Play className="w-3 h-3" />
                            <span>MARK PROCESSING</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 3: COMPLETED TOKENS & PROCUREMENT RECORD LEDGER */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>COMPLETED TOKENS (PERSISTENT MONGODB LEDGER)</span>
              <span className="text-xs font-mono font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-lg border border-emerald-200">
                {completedBookings.length} Finalized
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Authenticated electronic weighment slips, quality certification, and direct PFMS payment disbursements
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {state.payments.length} Payments Tracked
          </span>
        </div>

        <div className="space-y-3">
          {completedBookings.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs">
              No completed tokens recorded yet for this session.
            </div>
          ) : (
            completedBookings.map((b) => {
              const proc = state.procurements.find((p) => p.bookingId === b.id || p.tokenNumber === b.tokenNumber);
              const pay = state.payments.find((p) => p.bookingId === b.id || p.farmerId === b.farmerId);
              const totalVal = proc ? proc.totalAmount : b.quantityQuintals * (MSP_RATES[b.crop] || 7521);
              const slip = proc?.weighmentSlipNumber || `WS-WRD-2026-${b.tokenNumber}`;

              return (
                <div
                  key={b.id}
                  className="p-3.5 bg-emerald-50/40 rounded-xl border border-emerald-200/80 flex flex-wrap items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg font-mono font-bold text-sm">
                      {b.tokenNumber}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span>{b.farmerName}</span>
                        <span className="font-mono text-[11px] text-slate-500">
                          (Slip: {slip})
                        </span>
                      </div>
                      <div className="text-slate-600 text-[11px] mt-0.5">
                        {b.crop} • {proc?.quantityQuintals || b.quantityQuintals} Qtl • MSP Payout: <strong className="text-emerald-900 font-mono">₹{totalVal.toLocaleString('en-IN')}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1 font-bold text-[10px] px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                      <CheckCircle2 className="w-3 h-3" /> MARK COMPLETED
                    </span>

                    {pay && (
                      <span
                        className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded-md ${
                          pay.status === 'PAID'
                            ? 'bg-emerald-200 text-emerald-900'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        PFMS: {pay.status}
                      </span>
                    )}

                    {pay && pay.status !== 'PAID' && (
                      <button
                        onClick={() => simulatePaymentSuccess(pay.id)}
                        className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md text-[11px] font-bold shadow-2xs inline-flex items-center gap-1 transition-all"
                      >
                        <IndianRupee className="w-3 h-3" />
                        <span>Simulate Disbursed</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Weighment & Quality Assessment Modal (MARK COMPLETED Handler) */}
      {weighmentModalToken && activeTokenToComplete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-emerald-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-emerald-300" />
                  <span>MARK COMPLETED: Weighment &amp; Quality Slip</span>
                </h3>
                <p className="text-[11px] text-emerald-200">
                  Token: <strong>{activeTokenToComplete.tokenNumber}</strong> • Farmer: {activeTokenToComplete.farmerName}
                </p>
              </div>
              <button
                onClick={() => setWeighmentModalToken(null)}
                className="p-1 text-emerald-200 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Verified Weighbridge Weight (Quintals)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={actualQuintals}
                  onChange={(e) => setActualQuintals(Number(e.target.value))}
                  className="w-full text-sm font-bold p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Quality Assessment Grade
                </label>
                <select
                  value={qualityGrade}
                  onChange={(e) => setQualityGrade(e.target.value as any)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-semibold text-slate-800"
                >
                  <option value="Grade A (FAQ)">Grade A (FAQ - Fair Average Quality)</option>
                  <option value="Grade B">Grade B (Minor moisture tolerance)</option>
                  <option value="Standard">Standard Commercial Grade</option>
                </select>
              </div>

              <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-600">Government MSP Rate:</span>
                  <span className="font-bold text-slate-900">
                    ₹{MSP_RATES[activeTokenToComplete.crop] || 7521} / Qtl
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-1 border-t border-emerald-200">
                  <span className="text-emerald-900 font-bold">Total Procurement Value:</span>
                  <span className="font-black text-emerald-950 font-mono">
                    ₹{Math.round(actualQuintals * (MSP_RATES[activeTokenToComplete.crop] || 7521)).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setWeighmentModalToken(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  id="btn-confirm-completed"
                  onClick={handleSaveWeighment}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-all hover:scale-[1.01]"
                >
                  <Check className="w-4 h-4" />
                  <span>Issue Slip &amp; Mark Completed</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

