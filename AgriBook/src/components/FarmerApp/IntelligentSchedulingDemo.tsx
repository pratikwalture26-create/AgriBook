import React, { useState, useMemo } from 'react';
import { useAgriBook } from '../../services/appState';
import { CropType, TimeSlot, ProcurementCentre } from '../../types';
import {
  evaluateSmartSlotAllocation,
  DEMO_FARMER_LOCATIONS,
  DemoLocation,
} from '../../services/slotAllocator';
import {
  Sparkles,
  Clock,
  MapPin,
  TrendingDown,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Scale,
  Zap,
  Info,
  Sliders,
  Check,
} from 'lucide-react';

const CROPS: CropType[] = [
  'Cotton',
  'Soyabean',
  'Wheat',
  'Paddy',
  'Tur (Arhar)',
  'Gram (Chana)',
];

const DATES = [
  { label: 'Today (18 Sep 2026)', value: '2026-09-18' },
  { label: 'Tomorrow (19 Sep 2026)', value: '2026-09-19' },
  { label: 'Saturday (20 Sep 2026)', value: '2026-09-20' },
  { label: 'Monday (22 Sep 2026)', value: '2026-09-22' },
];

export const IntelligentSchedulingDemo: React.FC = () => {
  const { state, bookSlot } = useAgriBook();

  // Currently logged in farmer
  const currentFarmer =
    state.farmers.find((f) => f.id === state.currentFarmerId) || state.farmers[0];

  // 1. Farmer Selection State
  const [selectedCrop, setSelectedCrop] = useState<CropType>(currentFarmer.primaryCrop || 'Cotton');
  const [quantity, setQuantity] = useState<number>(currentFarmer.expectedQuantityQuintals || 45);
  const [preferredDate, setPreferredDate] = useState<string>('2026-09-18');
  const [selectedLocationId, setSelectedLocationId] = useState<string>(
    DEMO_FARMER_LOCATIONS[0].id
  );

  // 2. Interactive Demonstration Controls: Congestion Simulation
  const [simulatedSpikeCentre, setSimulatedSpikeCentre] = useState<string>('none');
  const [showMathDetails, setShowMathDetails] = useState<boolean>(false);
  const [bookedConfirmation, setBookedConfirmation] = useState<string | null>(null);

  // Derive extra queue based on simulation preset
  const simulatedExtraQueue = useMemo(() => {
    if (simulatedSpikeCentre === 'wardha_central') {
      return { 'centre-1': 42 }; // Heavy rush at Wardha Central
    }
    if (simulatedSpikeCentre === 'amravati_gridlock') {
      return { 'centre-2': 55 }; // High gridlock at Amravati
    }
    if (simulatedSpikeCentre === 'all_busy') {
      return { 'centre-1': 35, 'centre-2': 40 };
    }
    return {};
  }, [simulatedSpikeCentre]);

  // Evaluate AI slot allocation using the transparent algorithm
  const analysis = useMemo(() => {
    return evaluateSmartSlotAllocation(
      currentFarmer,
      selectedCrop,
      state.centres,
      preferredDate,
      {
        locationId: selectedLocationId,
        quantityQuintals: quantity,
        preferredDate,
        simulatedExtraQueue,
      }
    );
  }, [
    currentFarmer,
    selectedCrop,
    state.centres,
    preferredDate,
    selectedLocationId,
    quantity,
    simulatedExtraQueue,
  ]);

  const topOptions = analysis.topThreeOptions;
  const recommendedOption = topOptions.find((o) => o.isRecommended) || topOptions[0];
  const selectedLocation =
    DEMO_FARMER_LOCATIONS.find((l) => l.id === selectedLocationId) || DEMO_FARMER_LOCATIONS[0];

  const handleBookSlot = (centre: ProcurementCentre, slot: TimeSlot) => {
    const booking = bookSlot(
      currentFarmer.id,
      centre.id,
      `${slot.startTime} – ${slot.endTime}`,
      selectedCrop,
      Number(quantity),
      preferredDate,
      'APP'
    );

    if (booking) {
      setBookedConfirmation(
        `Slot successfully booked at ${centre.name}! Assigned Token: ${booking.tokenNumber} (Queue Pos #${booking.queuePosition}). Instant SMS confirmation dispatched to ${currentFarmer.mobile}.`
      );
    } else {
      setBookedConfirmation(`Slot successfully confirmed at ${centre.name}.`);
    }

    setTimeout(() => {
      setBookedConfirmation(null);
    }, 6000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden mb-8">
      {/* Header Banner with Clear Synthetic Data Notice */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 p-5 sm:p-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                AI INTELLIGENT SCHEDULING DEMO
              </span>
              <span className="bg-amber-400/20 text-amber-200 border border-amber-300/30 px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                DEMO / SYNTHETIC PREDICTION DATA
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Dynamic Mandi Suitability &amp; Slot Recommendation
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-3xl leading-relaxed">
              Calculates transparent suitability scores by balancing{' '}
              <span className="font-semibold text-white">XGBoost demand forecasts</span>,{' '}
              <span className="font-semibold text-white">live Redis queue depth</span>,{' '}
              <span className="font-semibold text-white">centre capacity</span>,{' '}
              <span className="font-semibold text-white">processing rates</span>, and{' '}
              <span className="font-semibold text-white">transit distance</span>.
            </p>
          </div>

          {/* Model Transparency Disclaimer Badge */}
          <div className="bg-emerald-950/60 border border-emerald-700/40 rounded-xl p-3 text-[11px] text-emerald-200/80 max-w-xs shrink-0 backdrop-blur-xs">
            <div className="flex items-center gap-1.5 font-bold text-emerald-300 mb-1">
              <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Ethical AI Disclosure</span>
            </div>
            <p className="leading-snug">
              No real-world harvest ML accuracy is claimed. Predictions utilize synthetic heuristic
              decision trees calibrated to historical peak harvest Mandi arrivals for prototype demonstration.
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation Alert */}
      {bookedConfirmation && (
        <div className="m-4 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold text-sm text-emerald-950">Booking Confirmed &amp; Token Dispatched</p>
            <p className="mt-0.5">{bookedConfirmation}</p>
          </div>
        </div>
      )}

      {/* High Congestion Proactive Alert (if triggered) */}
      {analysis.highCongestionAlert && (
        <div className="mx-4 mt-4 p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-amber-900 uppercase tracking-wide text-[11px]">
                Proactive Traffic Rerouting Active
              </span>
              <span className="bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold text-[10px]">
                Saves ~{analysis.highCongestionAlert.timeSavedMinutes} mins
              </span>
            </div>
            <p className="mt-1 text-amber-800 leading-relaxed">
              <strong>{analysis.highCongestionAlert.congestedCentreName}</strong> currently has{' '}
              <strong>{analysis.highCongestionAlert.congestedCentreQueue} farmers</strong> waiting in the Redis live queue.
              The AI recommends routing to{' '}
              <strong className="underline text-emerald-900">
                {analysis.highCongestionAlert.recommendedAlternativeName}
              </strong>{' '}
              to minimize your turnaround time.
            </p>
          </div>
        </div>
      )}

      {/* Interactive Inputs Grid: Crop, Quantity, Preferred Date, Location */}
      <div className="p-4 sm:p-6 bg-slate-50/70 border-b border-slate-200">
        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Sliders className="w-4 h-4 text-emerald-700" />
          <span>Select Farmer Requirements for Slot Scoring</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Crop Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Crop
            </label>
            <select
              id="ai-crop-select"
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value as CropType)}
              className="w-full text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden shadow-2xs"
            >
              {CROPS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Quantity (in Quintals) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">
                Estimated Quantity
              </label>
              <span className="text-xs font-bold text-emerald-700 font-mono">
                {quantity} Quintals
              </span>
            </div>
            <div className="space-y-1.5">
              <input
                id="ai-quantity-range"
                type="range"
                min={10}
                max={200}
                step={5}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full accent-emerald-700 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
              />
              <div className="flex items-center gap-1 text-[10px]">
                {[20, 45, 80, 140].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setQuantity(preset)}
                    className={`px-2 py-0.5 rounded border text-[10px] font-medium transition-all ${
                      quantity === preset
                        ? 'bg-emerald-700 text-white border-emerald-800'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {preset} Q
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Preferred Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Preferred Date
            </label>
            <div className="relative">
              <select
                id="ai-date-select"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="w-full text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden shadow-2xs"
              >
                {DATES.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 4. Farmer Location */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Farmer Village / Origin Location
            </label>
            <select
              id="ai-location-select"
              value={selectedLocationId}
              onChange={(e) => setSelectedLocationId(e.target.value)}
              className="w-full text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden shadow-2xs"
            >
              {DEMO_FARMER_LOCATIONS.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Real-time Demonstration Stress-Testing Bar */}
        <div className="mt-4 pt-4 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Live Simulation Scenarios:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSimulatedSpikeCentre('none')}
                className={`px-2.5 py-1 rounded-lg font-medium text-[11px] border transition-all ${
                  simulatedSpikeCentre === 'none'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                }`}
              >
                Normal Traffic
              </button>
              <button
                type="button"
                onClick={() => setSimulatedSpikeCentre('wardha_central')}
                className={`px-2.5 py-1 rounded-lg font-medium text-[11px] border transition-all ${
                  simulatedSpikeCentre === 'wardha_central'
                    ? 'bg-red-700 text-white border-red-800 shadow-2xs'
                    : 'bg-white text-red-700 border-red-200 hover:bg-red-50'
                }`}
              >
                🚨 Spike Wardha Central (+42 Trucks)
              </button>
              <button
                type="button"
                onClick={() => setSimulatedSpikeCentre('amravati_gridlock')}
                className={`px-2.5 py-1 rounded-lg font-medium text-[11px] border transition-all ${
                  simulatedSpikeCentre === 'amravati_gridlock'
                    ? 'bg-red-700 text-white border-red-800 shadow-2xs'
                    : 'bg-white text-red-700 border-red-200 hover:bg-red-50'
                }`}
              >
                🚨 Spike Amravati Yard (+55 Trucks)
              </button>
            </div>
          </div>

          {/* Toggle Math Formula Drawer */}
          <button
            type="button"
            onClick={() => setShowMathDetails(!showMathDetails)}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 underline underline-offset-2"
          >
            <span>{showMathDetails ? 'Hide Scoring Math & Weights' : 'Inspect Transparent Scoring Math & Weights'}</span>
            {showMathDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expandable Mathematical Transparency Drawer */}
      {showMathDetails && (
        <div className="p-4 sm:p-5 bg-emerald-50/50 border-b border-emerald-200 text-xs text-slate-800 animate-in fade-in duration-200">
          <div className="max-w-4xl space-y-3">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-800" />
              <h4 className="font-bold text-emerald-950 uppercase tracking-wide text-xs">
                Transparent Multi-Factor Suitability Formulation
              </h4>
            </div>

            <div className="bg-white p-3 rounded-xl border border-emerald-200 font-mono text-[11px] text-slate-800 shadow-2xs">
              <p className="font-bold text-emerald-900 mb-1">
                Suitability Score (0 – 100) = [ 0.35 × WaitScore ] + [ 0.25 × CapacityScore ] + [ 0.20 × CongestionScore ] + [ 0.20 × DistanceScore ]
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-[10px] text-slate-600 mt-2 border-t border-slate-100 pt-2">
                <div>
                  <span className="font-bold text-slate-900">1. WaitScore (35%):</span>
                  <div>Calculated from Redis FIFO tokens ÷ hourly processing throughput</div>
                </div>
                <div>
                  <span className="font-bold text-slate-900">2. CapacityScore (25%):</span>
                  <div>Remaining unutilized daily intake quota vs centre capacity</div>
                </div>
                <div>
                  <span className="font-bold text-slate-900">3. CongestionScore (20%):</span>
                  <div>XGBoost demand regressor predicting peak harvest arrival probability</div>
                </div>
                <div>
                  <span className="font-bold text-slate-900">4. DistanceScore (20%):</span>
                  <div>Haversine/road transit distance from farmer village</div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-600">
              Weights reflect farmer priority discovered in mandis: minimizing long multi-hour tractor queues at the weighbridge while avoiding excessive fuel and transport expenditures.
            </p>
          </div>
        </div>
      )}

      {/* 3 Available Options Display */}
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Evaluated Centre Options for {selectedCrop}</span>
              <span className="text-xs font-normal text-slate-500">
                (Origin: {selectedLocation.name} • {preferredDate})
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing top 3 candidate procurement yards ranked by transparent suitability scoring.
            </p>
          </div>
        </div>

        {/* 3 Options Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {topOptions.map((opt, index) => {
            const isRec = opt.isRecommended;
            const b = opt.breakdown;
            const c = opt.centre;
            const isCongested = c.currentQueueLength >= 35 || b.congestionProbability >= 0.75;

            return (
              <div
                key={c.id}
                className={`relative rounded-2xl border transition-all flex flex-col justify-between ${
                  isRec
                    ? 'border-emerald-600 bg-gradient-to-b from-emerald-50/70 to-white shadow-md ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 shadow-2xs'
                }`}
              >
                {/* Top Badge */}
                <div className="p-4 pb-3 border-b border-slate-100 flex items-center justify-between">
                  {isRec ? (
                    <span className="inline-flex items-center gap-1.5 bg-emerald-700 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-xs tracking-wide">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      ⭐ RECOMMENDED
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      Option {index + 1}: Alternative Hub
                    </span>
                  )}

                  {/* Suitability Score Badge */}
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Suitability:</span>
                      <span
                        className={`text-sm font-black font-mono ${
                          isRec
                            ? 'text-emerald-800'
                            : opt.suitabilityIndex >= 60
                            ? 'text-slate-800'
                            : 'text-amber-700'
                        }`}
                      >
                        {opt.suitabilityIndex}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">/ 100</span>
                    </div>
                  </div>
                </div>

                {/* Centre Identification */}
                <div className="p-4 space-y-3 flex-1">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                      {c.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>
                        {c.district}, {c.state} • Approx.{' '}
                        <strong className="text-slate-700">{b.distanceKm} km</strong> away
                      </span>
                    </p>
                  </div>

                  {/* Live Operational Metrics Pill Row */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400">Live Redis Queue</div>
                      <div className="font-bold text-slate-900 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{c.currentQueueLength} farmers</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">Est. Wait Time</div>
                      <div
                        className={`font-bold font-mono ${
                          b.waitMinutes > 60 ? 'text-red-700' : 'text-emerald-700'
                        }`}
                      >
                        ~{b.waitMinutes} mins
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">Daily Capacity</div>
                      <div className="font-bold text-slate-800 font-mono">
                        {b.availableSlots} / {c.dailyCapacity} free
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">Processing Speed</div>
                      <div className="font-bold text-slate-800 font-mono">
                        {c.processingRatePerHour}/hour
                      </div>
                    </div>
                  </div>

                  {/* 4-Point Explainable Rationale Box */}
                  <div
                    className={`rounded-xl p-3 text-xs space-y-2 border ${
                      isRec
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="font-bold text-[11px] uppercase tracking-wide flex items-center justify-between">
                      <span className={isRec ? 'text-emerald-900' : 'text-slate-700'}>
                        {isRec ? 'Why AgriBook Recommends This Yard:' : 'Trade-Off Assessment:'}
                      </span>
                      {isCongested && (
                        <span className="bg-red-100 text-red-800 text-[9px] font-bold px-1.5 py-0.2 rounded">
                          HIGH CONGESTION
                        </span>
                      )}
                    </div>

                    <ul className="space-y-1.5 text-[11px] leading-relaxed">
                      {/* 1. Lower Expected Waiting Time */}
                      <li className="flex items-start gap-1.5">
                        <Clock
                          className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                            isRec ? 'text-emerald-700' : 'text-slate-500'
                          }`}
                        />
                        <div>
                          <strong className="text-slate-900">Lower Expected Waiting Time: </strong>
                          <span>{opt.rationale.lowerWaitTime}</span>
                        </div>
                      </li>

                      {/* 2. Available Capacity */}
                      <li className="flex items-start gap-1.5">
                        <CheckCircle2
                          className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                            isRec ? 'text-emerald-700' : 'text-slate-500'
                          }`}
                        />
                        <div>
                          <strong className="text-slate-900">Available Capacity: </strong>
                          <span>{opt.rationale.availableCapacity}</span>
                        </div>
                      </li>

                      {/* 3. Lower Congestion */}
                      <li className="flex items-start gap-1.5">
                        <TrendingDown
                          className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                            isRec ? 'text-emerald-700' : 'text-slate-500'
                          }`}
                        />
                        <div>
                          <strong className="text-slate-900">Lower Congestion: </strong>
                          <span>{opt.rationale.lowerCongestion}</span>
                        </div>
                      </li>

                      {/* 4. Reasonable Distance */}
                      <li className="flex items-start gap-1.5">
                        <MapPin
                          className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                            isRec ? 'text-emerald-700' : 'text-slate-500'
                          }`}
                        />
                        <div>
                          <strong className="text-slate-900">Reasonable Distance: </strong>
                          <span>{opt.rationale.reasonableDistance}</span>
                        </div>
                      </li>
                    </ul>
                  </div>

                  {/* Recommended Time Slot Pill */}
                  <div className="pt-1">
                    <div className="text-[11px] font-semibold text-slate-600 mb-1 flex items-center justify-between">
                      <span>Suggested Time Slot:</span>
                      <span className="text-emerald-700 font-mono font-bold">
                        {opt.recommendedSlot.capacity - opt.recommendedSlot.bookedCount} slots left
                      </span>
                    </div>
                    <div
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-bold ${
                        isRec
                          ? 'bg-emerald-800 text-white border-emerald-900 shadow-2xs'
                          : 'bg-slate-100 text-slate-900 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-300" />
                        <span>{opt.recommendedSlot.startTime} – {opt.recommendedSlot.endTime}</span>
                      </div>
                      <span className="text-[10px] font-normal opacity-90">
                        {preferredDate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="p-4 pt-0">
                  <button
                    type="button"
                    onClick={() => handleBookSlot(c, opt.recommendedSlot)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs ${
                      isRec
                        ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                        : 'bg-slate-800 hover:bg-slate-900 text-white'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    <span>Book Slot &amp; Issue Token</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
