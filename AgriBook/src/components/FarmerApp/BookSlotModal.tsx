import React, { useState, useMemo } from 'react';
import { useAgriBook } from '../../services/appState';
import {
  evaluateSmartSlotAllocation,
  DEMO_FARMER_LOCATIONS,
} from '../../services/slotAllocator';
import { CropType, TimeSlot, ProcurementCentre } from '../../types';
import {
  X,
  Sparkles,
  AlertTriangle,
  Clock,
  MapPin,
  Check,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  TrendingDown,
  Info,
} from 'lucide-react';

interface BookSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DATES = [
  { label: 'Today (18 Sep 2026)', value: '2026-09-18' },
  { label: 'Tomorrow (19 Sep 2026)', value: '2026-09-19' },
  { label: 'Saturday (20 Sep 2026)', value: '2026-09-20' },
  { label: 'Monday (22 Sep 2026)', value: '2026-09-22' },
];

export const BookSlotModal: React.FC<BookSlotModalProps> = ({ isOpen, onClose }) => {
  const { state, bookSlot } = useAgriBook();
  const currentFarmer = state.farmers.find((f) => f.id === state.currentFarmerId) || state.farmers[0];

  const [selectedCrop, setSelectedCrop] = useState<CropType>(currentFarmer.primaryCrop || 'Cotton');
  const [quantity, setQuantity] = useState<number>(currentFarmer.expectedQuantityQuintals || 40);
  const [preferredDate, setPreferredDate] = useState<string>('2026-09-18');
  const [selectedLocationId, setSelectedLocationId] = useState<string>(
    DEMO_FARMER_LOCATIONS[0].id
  );
  const [selectedCentreId, setSelectedCentreId] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [step, setStep] = useState<'SELECT' | 'CONFIRM'>('SELECT');

  // Run AI Slot Allocation Engine
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
      }
    );
  }, [currentFarmer, selectedCrop, state.centres, preferredDate, selectedLocationId, quantity]);

  // Set default recommended centre & slot
  React.useEffect(() => {
    if (analysis.topThreeOptions.length > 0) {
      const top = analysis.topThreeOptions[0];
      if (!selectedCentreId || !analysis.topThreeOptions.some((o) => o.centre.id === selectedCentreId)) {
        setSelectedCentreId(top.centre.id);
        setSelectedSlot(top.recommendedSlot);
      }
    }
  }, [analysis, selectedCentreId]);

  const activeCentre =
    state.centres.find((c) => c.id === selectedCentreId) || analysis.topThreeOptions[0]?.centre;

  const handleConfirmBooking = () => {
    if (!activeCentre || !selectedSlot) return;

    bookSlot(
      currentFarmer.id,
      activeCentre.id,
      `${selectedSlot.startTime} – ${selectedSlot.endTime}`,
      selectedCrop,
      quantity,
      preferredDate,
      'APP'
    );
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-700/50 rounded-xl">
              <Sparkles className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">Intelligent Slot Recommendation</h2>
                <span className="bg-emerald-700/80 text-emerald-200 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-600">
                  Demo AI Heuristics
                </span>
              </div>
              <p className="text-xs text-emerald-200">
                Transparent suitability scoring from XGBoost predicted demand, Redis queue, and transit distance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-emerald-300 hover:text-white rounded-lg hover:bg-emerald-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {step === 'SELECT' ? (
            <>
              {/* Form Inputs: Crop, Quantity, Preferred Date, Location */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Farmer Details &amp; Booking Preferences
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Select Crop
                    </label>
                    <select
                      value={selectedCrop}
                      onChange={(e) => setSelectedCrop(e.target.value as CropType)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    >
                      <option value="Cotton">Cotton (कपास)</option>
                      <option value="Soyabean">Soyabean (सोयाबीन)</option>
                      <option value="Wheat">Wheat (गेहूं)</option>
                      <option value="Paddy">Paddy (धान)</option>
                      <option value="Tur (Arhar)">Tur / Arhar (अरहर)</option>
                      <option value="Gram (Chana)">Gram / Chana (चना)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Quantity (Quintals)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="300"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Preferred Date
                    </label>
                    <select
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    >
                      {DATES.map((d) => (
                        <option key={d.value} value={d.value}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Farmer Location
                    </label>
                    <select
                      value={selectedLocationId}
                      onChange={(e) => setSelectedLocationId(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    >
                      {DEMO_FARMER_LOCATIONS.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Congestion Warning & Alternative Recommendation (SIH Highlight) */}
              {analysis.highCongestionAlert && (
                <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 text-xs text-amber-950 flex items-start gap-3 shadow-xs">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold text-amber-900 block mb-0.5">
                      Congestion Alert at {analysis.highCongestionAlert.congestedCentreName}
                    </strong>
                    <p className="text-amber-800 leading-relaxed">
                      Current queue has reached {analysis.highCongestionAlert.congestedCentreQueue} farmers.
                      AgriBook recommends booking at <strong>{analysis.highCongestionAlert.recommendedAlternativeName}</strong> instead, saving an estimated <strong>~{analysis.highCongestionAlert.timeSavedMinutes} minutes</strong> of waiting time.
                    </p>
                  </div>
                </div>
              )}

              {/* 3 Available Options Cards */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Top 3 Available Procurement Centres (Ranked by Suitability Score)
                  </label>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Info className="w-3 h-3 text-slate-400" />
                    Synthetic XGBoost + Redis live scoring
                  </span>
                </div>

                <div className="space-y-3">
                  {analysis.topThreeOptions.map((opt, index) => {
                    const centre = opt.centre;
                    const isSelected = centre.id === activeCentre?.id;
                    const isRec = opt.isRecommended;
                    const b = opt.breakdown;

                    return (
                      <div
                        key={centre.id}
                        onClick={() => {
                          setSelectedCentreId(centre.id);
                          setSelectedSlot(opt.recommendedSlot);
                        }}
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 text-sm">
                              {centre.name}
                            </span>
                            {isRec ? (
                              <span className="bg-emerald-700 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                                <Sparkles className="w-3 h-3 text-amber-300" /> RECOMMENDED
                              </span>
                            ) : (
                              <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                Option {index + 1}
                              </span>
                            )}
                          </div>

                          {/* Suitability Score */}
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-500">
                              Suitability:{' '}
                              <strong className="text-emerald-800 font-mono text-sm">
                                {opt.suitabilityIndex}
                              </strong>
                              /100
                            </span>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mb-2.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {centre.address} • Approx. <strong>{b.distanceKm} km</strong> away • Queue: {centre.currentQueueLength} • Est. Wait: ~{b.waitMinutes} mins
                        </p>

                        {/* 4-Point Explainable Rationale */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 bg-slate-50/80 p-2.5 rounded-lg border border-slate-100 text-[11px] text-slate-700 mb-2">
                          <div className="flex items-start gap-1">
                            <Clock className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                            <span>
                              <strong>Wait Time:</strong> {opt.rationale.lowerWaitTime}
                            </span>
                          </div>
                          <div className="flex items-start gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                            <span>
                              <strong>Capacity:</strong> {opt.rationale.availableCapacity}
                            </span>
                          </div>
                          <div className="flex items-start gap-1">
                            <TrendingDown className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                            <span>
                              <strong>Congestion:</strong> {opt.rationale.lowerCongestion}
                            </span>
                          </div>
                          <div className="flex items-start gap-1">
                            <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                            <span>
                              <strong>Distance:</strong> {opt.rationale.reasonableDistance}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots for Selected Centre */}
              {activeCentre && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-700">
                      Available Time Slots for {activeCentre.name} ({preferredDate})
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Processing Capacity: {activeCentre.dailyCapacity} / day
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {activeCentre.slots.map((slot) => {
                      const isFull = slot.bookedCount >= slot.capacity;
                      const isChosen = selectedSlot?.id === slot.id;
                      const isRec = slot.isRecommended || slot.startTime === '10:00 AM';

                      return (
                        <button
                          key={slot.id}
                          disabled={isFull}
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-3 rounded-xl border text-left transition-all relative ${
                            isFull
                              ? 'bg-slate-100 border-slate-200 opacity-50 cursor-not-allowed'
                              : isChosen
                              ? 'bg-emerald-800 text-white border-emerald-900 shadow-sm'
                              : 'bg-white border-slate-200 hover:border-emerald-400 text-slate-900'
                          }`}
                        >
                          {isRec && !isFull && (
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full absolute -top-2 right-2 ${
                                isChosen ? 'bg-amber-400 text-slate-900' : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              RECOMMENDED
                            </span>
                          )}
                          <div className="flex items-center gap-1 text-xs font-bold">
                            <Clock className="w-3.5 h-3.5 shrink-0" />
                            <span>{slot.startTime} – {slot.endTime}</span>
                          </div>
                          <div
                            className={`text-[10px] mt-1 ${
                              isChosen ? 'text-emerald-100' : 'text-slate-500'
                            }`}
                          >
                            {isFull
                              ? 'Slot Full'
                              : `${slot.capacity - slot.bookedCount} slots remaining`}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Confirmation Step */
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                <ShieldCheck className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
                <h3 className="text-base font-bold text-emerald-950">Review Booking Details</h3>
                <p className="text-xs text-emerald-700">
                  A real-time token will be generated and assigned in the Redis live queue.
                </p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 text-xs">
                <div className="p-3 flex justify-between">
                  <span className="text-slate-500">Farmer Name:</span>
                  <span className="font-bold text-slate-900">{currentFarmer.name}</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-slate-500">Registered Mobile:</span>
                  <span className="font-bold text-slate-900">+91-{currentFarmer.mobile}</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-slate-500">Procurement Centre:</span>
                  <span className="font-bold text-slate-900">{activeCentre?.name}</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-slate-500">Crop &amp; Quantity:</span>
                  <span className="font-bold text-slate-900">{selectedCrop} • {quantity} Quintals</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-slate-500">Date &amp; Slot:</span>
                  <span className="font-bold text-emerald-700">{preferredDate} ({selectedSlot?.startTime} – {selectedSlot?.endTime})</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-slate-500">Estimated Transit:</span>
                  <span className="font-bold text-slate-900">{analysis.selectedLocationName}</span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600">
                An immediate SMS confirmation with your Token ID will be dispatched to your registered phone number via Twilio SMS.
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => (step === 'CONFIRM' ? setStep('SELECT') : onClose())}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-all"
          >
            {step === 'CONFIRM' ? 'Back' : 'Cancel'}
          </button>

          {step === 'SELECT' ? (
            <button
              disabled={!selectedSlot}
              onClick={() => setStep('CONFIRM')}
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <span>Continue to Confirm</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleConfirmBooking}
              className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>Confirm &amp; Generate Token</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

