import React, { useState } from 'react';
import { useAgriBook } from '../../services/appState';
import { BookSlotModal } from './BookSlotModal';
import { FeedbackModal } from './FeedbackModal';
import { IntelligentSchedulingDemo } from './IntelligentSchedulingDemo';
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  PhoneCall,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  MessageSquare,
  Smartphone,
  ChevronRight,
  TrendingUp,
  LayoutGrid,
} from 'lucide-react';

export const FarmerApp: React.FC = () => {
  const { state, isRealTimeConnected, setCurrentFarmer } = useAgriBook();
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isMobileFrame, setIsMobileFrame] = useState(false);
  const [activeFarmerTab, setActiveFarmerTab] = useState<'SCHEDULER_DEMO' | 'PORTAL'>('SCHEDULER_DEMO');

  const currentFarmer =
    state.farmers.find((f) => f.id === state.currentFarmerId) || state.farmers[0];

  // Find active booking for this farmer
  const activeBooking = state.bookings.find(
    (b) => b.farmerId === currentFarmer.id && b.status !== 'CANCELLED'
  );

  // Find recent payment for this farmer if available
  const activePayment = state.payments.find((p) => p.farmerId === currentFarmer.id);

  // Filter farmer notifications
  const farmerNotifs = state.notifications
    .filter((n) => n.farmerId === currentFarmer.id)
    .slice(0, 3);

  // Queue stages for visual tracker
  const getStageIndex = (status?: string) => {
    switch (status) {
      case 'WAITING':
        return 1;
      case 'CALLED':
        return 2;
      case 'PROCESSING':
        return 3;
      case 'COMPLETED':
        return 4;
      default:
        return 0;
    }
  };

  const currentStage = getStageIndex(activeBooking?.status);

  return (
    <div className="py-6 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Top Header Controls: Switch Farmer & Mobile Frame Toggle */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm border border-emerald-300">
            {currentFarmer.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                Logged In Farmer:
              </span>
              <select
                id="select-farmer"
                value={currentFarmer.id}
                onChange={(e) => setCurrentFarmer(e.target.value)}
                className="text-xs sm:text-sm font-bold text-emerald-950 bg-emerald-50 border border-emerald-300 rounded-lg px-2.5 py-1 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                {state.farmers.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.village}, {f.district}) • {f.primaryCrop}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Land: {currentFarmer.landDetails.totalAcres} Acres (Survey #{currentFarmer.landDetails.surveyNumber}) • Aadhaar: ****{currentFarmer.aadhaarLastFour}
            </p>
          </div>
        </div>

        {/* View Mode Toggle (Mobile Simulator vs Responsive) & Tab Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
            <button
              onClick={() => setActiveFarmerTab('SCHEDULER_DEMO')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeFarmerTab === 'SCHEDULER_DEMO'
                  ? 'bg-white text-emerald-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>AI Scheduling Demo</span>
            </button>
            <button
              onClick={() => setActiveFarmerTab('PORTAL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeFarmerTab === 'PORTAL'
                  ? 'bg-white text-emerald-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-emerald-700" />
              <span>Farmer Portal &amp; Live Queue</span>
            </button>
          </div>

          <button
            onClick={() => setIsMobileFrame(!isMobileFrame)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              isMobileFrame
                ? 'bg-emerald-900 text-white border-emerald-950 shadow-xs'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>{isMobileFrame ? 'Exit Mobile Frame' : 'Mobile View'}</span>
          </button>
        </div>
      </div>

      {/* Main Container - Can be framed as a mobile screen or fluid */}
      <div
        className={`mx-auto transition-all ${
          isMobileFrame
            ? 'max-w-md bg-slate-100 p-4 rounded-3xl border-8 border-slate-800 shadow-2xl min-h-[750px]'
            : 'w-full'
        }`}
      >
        {activeFarmerTab === 'SCHEDULER_DEMO' && (
          <div className="space-y-6 mb-6">
            <IntelligentSchedulingDemo />
          </div>
        )}

        <div className="space-y-5">
          {/* Welcome Card & Booking CTA */}
          <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 rounded-2xl p-5 text-white shadow-sm relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
                  {state.language === 'en' ? 'Farmer Portal' : 'किसान पोर्टल'}
                </span>
                <span className="text-[10px] bg-emerald-700/60 text-emerald-200 px-2 py-0.5 rounded-full font-mono">
                  MSP Season 2026
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold">
                {state.language === 'en' ? 'Namaste' : 'नमस्ते'}, {currentFarmer.name}
              </h1>
              <p className="text-xs text-emerald-100/90 mt-1 max-w-lg leading-relaxed">
                {state.language === 'en'
                  ? 'Avoid waiting in long mandi lines. AgriBook uses predictive AI to allocate the fastest slot and lets you track your live token from home.'
                  : 'मंडी में लंबी कतारों से बचें। एग्रीबुक सबसे तेज़ स्लॉट आवंटित करता है और लाइव टोकन ट्रैकिंग प्रदान करता है।'}
              </p>

              <div className="mt-4 flex flex-wrap gap-2.5">
                <button
                  id="btn-book-slot"
                  onClick={() => setIsBookModalOpen(true)}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all hover:scale-[1.02]"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>{state.language === 'en' ? 'Book Procurement Slot' : 'स्लॉट बुक करें'}</span>
                </button>

                <a
                  href="#helpline-section"
                  className="bg-emerald-700/50 hover:bg-emerald-700 text-white px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-emerald-600 transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{state.language === 'en' ? 'Call Helpline (1800-180-26032)' : 'हेल्पलाइन कॉल'}</span>
                </a>
              </div>
            </div>

            {/* Decorative background shape */}
            <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-emerald-700/20 rounded-full blur-2xl pointer-events-none"></div>
          </div>

          {/* ACTIVE BOOKING CARD - CORE PROTOTYPE HIGHLIGHT */}
          {activeBooking ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Header */}
              <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    {state.language === 'en' ? 'Current Active Booking' : 'सक्रिय स्लॉट बुकिंग'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold bg-slate-200 text-slate-800 px-2 py-0.5 rounded-md">
                    Ref: {activeBooking.bookingReference}
                  </span>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      activeBooking.status === 'CALLED'
                        ? 'bg-amber-100 text-amber-900 animate-pulse border border-amber-300'
                        : activeBooking.status === 'PROCESSING'
                        ? 'bg-blue-100 text-blue-900 border border-blue-300'
                        : activeBooking.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    STATUS: {activeBooking.status}
                  </span>
                </div>
              </div>

              {/* Dynamic Status Alert Banner */}
              {activeBooking.status === 'CALLED' && (
                <div className="bg-amber-500 text-slate-950 px-4 py-2.5 flex items-center justify-between font-bold text-xs animate-pulse">
                  <div className="flex items-center gap-2">
                    <span className="p-1 bg-amber-600 rounded-md text-white">📢</span>
                    <span>GATE CALL: Token {activeBooking.tokenNumber} has been called! Proceed to Weighbridge Bay #1 immediately.</span>
                  </div>
                  <span className="font-mono bg-amber-400 px-2 py-0.5 rounded text-[11px]">Gate Open</span>
                </div>
              )}

              {activeBooking.status === 'PROCESSING' && (
                <div className="bg-blue-600 text-white px-4 py-2.5 flex items-center justify-between font-bold text-xs">
                  <div className="flex items-center gap-2">
                    <span className="p-1 bg-blue-700 rounded-md">⚖️</span>
                    <span>WEIGHMENT IN PROGRESS: Your produce is being weighed and quality-tested at Counter #1.</span>
                  </div>
                  <span className="font-mono bg-blue-500 px-2 py-0.5 rounded text-[11px]">Live Testing</span>
                </div>
              )}

              {activeBooking.status === 'COMPLETED' && (
                <div className="bg-emerald-700 text-white px-4 py-2.5 flex items-center justify-between font-bold text-xs">
                  <div className="flex items-center gap-2">
                    <span className="p-1 bg-emerald-800 rounded-md">✅</span>
                    <span>PROCUREMENT FINALIZED: Weighment slip generated. Direct Bank Transfer (DBT/PFMS) initiated!</span>
                  </div>
                  <span className="font-mono bg-emerald-600 px-2 py-0.5 rounded text-[11px]">Payment Queue</span>
                </div>
              )}

              {/* Real-time sync notification bar */}
              <div className="bg-slate-100/80 px-4 py-1.5 border-b border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
                <span className="flex items-center gap-1.5 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Node.js Real-time Sync Active (Auto-refreshes on Operator action)
                </span>
                <span className="text-slate-400 font-mono">
                  Mandi: {activeBooking.centreName}
                </span>
              </div>

              {/* Main Token & Position Display */}
              <div className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-5 border-b border-slate-100">
                  {/* Big Token Number */}
                  <div className="bg-emerald-50/80 rounded-xl p-4 border border-emerald-200 text-center flex flex-col justify-center">
                    <span className="text-xs font-semibold text-emerald-700 uppercase">
                      Your Live Token
                    </span>
                    <span className="text-3xl sm:text-4xl font-black text-emerald-950 font-mono tracking-tight my-1">
                      {activeBooking.tokenNumber}
                    </span>
                    <span className="text-[11px] text-emerald-800 font-medium">
                      Assigned Counter #1
                    </span>
                  </div>

                  {/* Queue Position */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-center flex flex-col justify-center">
                    <span className="text-xs font-semibold text-slate-500 uppercase">
                      Live Queue Position
                    </span>
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 font-mono my-1">
                      {activeBooking.status === 'COMPLETED'
                        ? 'Done'
                        : activeBooking.status === 'CALLED'
                        ? 'At Gate'
                        : `#${activeBooking.queuePosition}`}
                    </span>
                    <span className="text-[11px] text-slate-600 font-medium">
                      {activeBooking.status === 'WAITING'
                        ? `${activeBooking.queuePosition - 1} farmers ahead of you`
                        : 'Direct access to weighment'}
                    </span>
                  </div>

                  {/* Estimated Waiting Time */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-center flex flex-col justify-center">
                    <span className="text-xs font-semibold text-slate-500 uppercase">
                      Estimated Wait Time
                    </span>
                    <span className="text-3xl sm:text-4xl font-black text-emerald-800 font-mono my-1">
                      {activeBooking.status === 'COMPLETED'
                        ? '0 min'
                        : `${activeBooking.estimatedWaitMinutes} min`}
                    </span>
                    <span className="text-[11px] text-slate-600 font-medium">
                      Based on live processing rate
                    </span>
                  </div>
                </div>

                {/* Booking Centre Details */}
                <div className="py-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-slate-900 font-bold">
                        {activeBooking.centreName}
                      </strong>
                      <span className="text-slate-500">{activeBooking.centreAddress}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-slate-900 font-bold">
                        {activeBooking.date} • {activeBooking.slotTime}
                      </strong>
                      <span className="text-slate-500">
                        {activeBooking.crop} ({activeBooking.quantityQuintals} Quintals)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Visual Step-by-Step Queue Tracker */}
                <div className="pt-4 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-700 block mb-3">
                    Live Procurement Progress:
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { step: 1, label: 'Booked', desc: 'Token Issued' },
                      { step: 2, label: 'Waiting', desc: 'In Queue' },
                      { step: 3, label: 'Called', desc: 'At Weighbridge' },
                      { step: 4, label: 'Procured', desc: 'Payment Done' },
                    ].map((st) => {
                      const isComplete = currentStage >= st.step;
                      const isCurrent = currentStage === st.step - 1;

                      return (
                        <div key={st.step} className="text-center">
                          <div
                            className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center font-bold text-xs mb-1.5 transition-all ${
                              isComplete
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : isCurrent
                                ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300'
                                : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            {isComplete ? <CheckCircle2 className="w-4 h-4" /> : st.step}
                          </div>
                          <div className="text-[11px] font-bold text-slate-900">{st.label}</div>
                          <div className="text-[9px] text-slate-400 hidden sm:block">{st.desc}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Contextual Action / Feedback Button */}
                {activeBooking.status === 'CALLED' && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        <strong>Action Required:</strong> Token {activeBooking.tokenNumber} is called.
                        Enter Gate #2 for moisture testing.
                      </span>
                    </div>
                  </div>
                )}

                {activeBooking.status === 'COMPLETED' && (
                  <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                    <span className="text-xs text-emerald-900 font-semibold">
                      Procurement successfully completed. How was your wait time?
                    </span>
                    <button
                      onClick={() => setIsFeedbackModalOpen(true)}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-xs"
                    >
                      Rate Experience
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* No Booking Placeholder */
            <div className="bg-white rounded-2xl p-6 border border-slate-200 text-center">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800">No Active Slot Booked</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                Schedule your crop delivery in advance to avoid long queue congestion at the APMC yard.
              </p>
              <button
                onClick={() => setIsBookModalOpen(true)}
                className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-xl font-bold text-xs inline-flex items-center gap-1.5 shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>Book Slot Now</span>
              </button>
            </div>
          )}

          {/* PAYMENT TRACKING CARD (PROTOTYPE SIMULATION) */}
          {activePayment && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                    <IndianRupee className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      Procurement Payment Status
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      Direct Bank Transfer Simulation (Prototype)
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    activePayment.status === 'PAID'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  {activePayment.status}
                </span>
              </div>

              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] text-slate-500 block">Total MSP Procurement Value:</span>
                  <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                    ₹{activePayment.amount.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-500 block">Reference Number:</span>
                  <span className="text-xs font-mono font-bold text-slate-800">
                    {activePayment.referenceNumber}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Account ending in **{currentFarmer.bankAccountLastFour}
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 mt-2.5 italic">
                * Note: Prototype simulation layer for SIH demonstration. In production, this synchronizes with authorized state PFMS gateways.
              </p>
            </div>
          )}

          {/* NEARBY PROCUREMENT CENTRES & LIVE CONGESTION RADAR */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Mandi Congestion Radar
                </h3>
                <p className="text-[11px] text-slate-500">
                  Real-time Redis queue and wait times in your district
                </p>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Live Data
              </span>
            </div>

            <div className="space-y-2">
              {state.centres.slice(0, 3).map((centre) => {
                const estWait = Math.round(
                  (centre.currentQueueLength / (centre.processingRatePerHour || 8)) * 60
                );
                const isHigh = centre.congestionLevel === 'HIGH';

                return (
                  <div
                    key={centre.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-800">{centre.name}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>{centre.distanceKm || 10} km away</span>
                        <span>•</span>
                        <span>Rate: {centre.processingRatePerHour}/hr</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isHigh
                            ? 'bg-red-100 text-red-800 font-bold'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isHigh ? 'High Congestion' : 'Normal Load'}
                      </span>
                      <div className="text-[11px] font-mono text-slate-600 mt-1">
                        Queue: <strong>{centre.currentQueueLength}</strong> ({estWait} min wait)
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PHONE-BASED BOOKING FALLBACK BANNER (SIH REQUIREMENT) */}
          <div
            id="helpline-section"
            className="bg-amber-50 rounded-2xl border border-amber-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs"
          >
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-amber-200 text-amber-900 rounded-xl shrink-0 mt-0.5">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-amber-950">
                  Phone-Based Booking Fallback (Toll-Free Helpline)
                </h4>
                <p className="text-[11px] text-amber-800 leading-relaxed mt-0.5">
                  Limited connectivity or no smartphone? Farmers can dial <strong>1800-180-26032</strong>.
                  Our call centre operators will check real-time availability and confirm your slot via SMS.
                </p>
              </div>
            </div>

            <div className="shrink-0 w-full sm:w-auto">
              <span className="block text-center sm:text-right font-mono font-bold text-sm text-amber-950 bg-amber-200/70 px-3 py-1.5 rounded-lg border border-amber-300">
                1800-180-26032
              </span>
            </div>
          </div>

          {/* RECENT SMS ALERTS PREVIEW */}
          {farmerNotifs.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  Recent SMS Messages (Sent to +91-{currentFarmer.mobile})
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Twilio Log</span>
              </div>
              <div className="space-y-2">
                {farmerNotifs.map((n) => (
                  <div
                    key={n.id}
                    className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 leading-relaxed"
                  >
                    <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                      <strong className="text-slate-700">{n.title}</strong>
                      <span>{new Date(n.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p>{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <BookSlotModal isOpen={isBookModalOpen} onClose={() => setIsBookModalOpen(false)} />
      {activeBooking && (
        <FeedbackModal
          isOpen={isFeedbackModalOpen}
          onClose={() => setIsFeedbackModalOpen(false)}
          centreId={activeBooking.centreId}
          tokenNumber={activeBooking.tokenNumber}
        />
      )}
    </div>
  );
};
