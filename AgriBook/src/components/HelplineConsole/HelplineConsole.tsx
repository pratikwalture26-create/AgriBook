import React, { useState } from 'react';
import { useAgriBook } from '../../services/appState';
import { CropType, TimeSlot } from '../../types';
import {
  PhoneCall,
  Search,
  UserCheck,
  Calendar,
  Sparkles,
  CheckCircle2,
  Send,
  Headphones,
} from 'lucide-react';

export const HelplineConsole: React.FC = () => {
  const { state, bookSlot } = useAgriBook();
  const [mobileQuery, setMobileQuery] = useState<string>('9822104512');
  const [searchedFarmer, setSearchedFarmer] = useState(
    state.farmers.find((f) => f.mobile === '9822104512') || state.farmers[0]
  );
  const [selectedCrop, setSelectedCrop] = useState<CropType>(searchedFarmer.primaryCrop || 'Cotton');
  const [quantity, setQuantity] = useState<number>(searchedFarmer.expectedQuantityQuintals || 45);
  const [selectedCentreId, setSelectedCentreId] = useState<string>('centre-1');
  const [selectedSlotTime, setSelectedSlotTime] = useState<string>('11:00 AM – 12:00 PM');
  const [bookingSuccessToken, setBookingSuccessToken] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = state.farmers.find((f) => f.mobile.includes(mobileQuery.trim()));
    if (found) {
      setSearchedFarmer(found);
      setSelectedCrop(found.primaryCrop);
      setQuantity(found.expectedQuantityQuintals);
    }
  };

  const handleBookForFarmer = () => {
    if (!searchedFarmer || !selectedCentreId) return;

    const booking = bookSlot(
      searchedFarmer.id,
      selectedCentreId,
      selectedSlotTime,
      selectedCrop,
      quantity,
      '2026-09-18',
      'HELPLINE_OPERATOR'
    );

    if (booking) {
      setBookingSuccessToken(booking.tokenNumber);
    }
  };

  const activeCentre = state.centres.find((c) => c.id === selectedCentreId) || state.centres[0];

  return (
    <div className="py-6 px-4 sm:px-6 max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-amber-900 text-white p-5 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-800 rounded-xl text-amber-200">
            <Headphones className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Customer Care Agent Console
              </span>
              <span className="text-[10px] bg-amber-950 px-2 py-0.5 rounded-full font-mono text-amber-200">
                Toll-Free 1800-180-26032
              </span>
            </div>
            <h1 className="text-xl font-bold mt-0.5">Phone-Based Assisted Booking (Fallback)</h1>
            <p className="text-xs text-amber-200">
              Assists farmers with feature phones or low internet connectivity. Verifies mobile, checks smart slots, and sends instant SMS confirmation.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Caller Lookup */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            1. Caller Verification
          </h3>

          <form onSubmit={handleSearch} className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Incoming Caller Mobile Number
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={mobileQuery}
                onChange={(e) => setMobileQuery(e.target.value)}
                placeholder="e.g. 9822104512"
                className="w-full text-xs font-mono font-bold p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
              <button
                type="submit"
                className="px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shrink-0 flex items-center"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick Caller Selection for Demo */}
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block mb-1.5">
              Quick Demo Callers:
            </span>
            <div className="space-y-1">
              {state.farmers.slice(0, 3).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    setMobileQuery(f.mobile);
                    setSearchedFarmer(f);
                    setSelectedCrop(f.primaryCrop);
                    setQuantity(f.expectedQuantityQuintals);
                  }}
                  className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex justify-between ${
                    searchedFarmer.id === f.id
                      ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-300'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span>{f.name}</span>
                  <span className="font-mono text-slate-500">{f.mobile}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Verified Profile Box */}
          {searchedFarmer && (
            <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-900 font-bold">
                <UserCheck className="w-4 h-4 text-emerald-700" />
                <span>Verified Farmer Profile</span>
              </div>
              <div className="text-slate-700">
                <strong>{searchedFarmer.name}</strong> • {searchedFarmer.village}, {searchedFarmer.district}
              </div>
              <div className="text-slate-500 text-[11px]">
                Land: {searchedFarmer.landDetails.totalAcres} Acres (Survey #{searchedFarmer.landDetails.surveyNumber})
              </div>
              <div className="text-slate-500 text-[11px]">
                Aadhaar Last 4: ****{searchedFarmer.aadhaarLastFour}
              </div>
            </div>
          )}
        </div>

        {/* Right Columns: Slot Allocation & SMS Confirmation */}
        <div className="md:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            2. Slot Selection &amp; SMS Dispatch
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Crop Declared by Farmer
              </label>
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value as CropType)}
                className="w-full text-xs font-semibold p-2.5 border border-slate-300 rounded-lg bg-white"
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
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full text-xs font-bold p-2.5 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Procurement Centre
            </label>
            <select
              value={selectedCentreId}
              onChange={(e) => setSelectedCentreId(e.target.value)}
              className="w-full text-xs font-semibold p-2.5 border border-slate-300 rounded-lg bg-white"
            >
              {state.centres.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.district}) • Current Queue: {c.currentQueueLength} • {c.congestionLevel}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Available Hourly Slots (18 Sep 2026)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {activeCentre.slots.map((s) => {
                const isFull = s.bookedCount >= s.capacity;
                const slotStr = `${s.startTime} – ${s.endTime}`;
                const isSelected = selectedSlotTime === slotStr;

                return (
                  <button
                    key={s.id}
                    disabled={isFull}
                    type="button"
                    onClick={() => setSelectedSlotTime(slotStr)}
                    className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                      isFull
                        ? 'opacity-40 bg-slate-100 cursor-not-allowed'
                        : isSelected
                        ? 'bg-emerald-800 text-white border-emerald-900 font-bold'
                        : 'bg-white hover:border-emerald-400 border-slate-200'
                    }`}
                  >
                    <div>{slotStr}</div>
                    <div className="text-[10px] opacity-75">{s.capacity - s.bookedCount} free</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <div className="text-[11px] text-slate-500">
              Will immediately dispatch confirmation SMS to <strong>+91-{searchedFarmer.mobile}</strong>
            </div>

            <button
              onClick={handleBookForFarmer}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all hover:scale-[1.02]"
            >
              <Send className="w-4 h-4" />
              <span>Book Slot &amp; Send SMS</span>
            </button>
          </div>

          {bookingSuccessToken && (
            <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-xl text-xs text-emerald-950 flex items-start gap-3 shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block text-sm">
                  Phone Booking Confirmed! Token: {bookingSuccessToken}
                </strong>
                <p className="mt-0.5">
                  Allocated at <strong>{activeCentre.name}</strong> for {selectedSlotTime}.
                  Confirmation SMS has been queued and delivered to caller&apos;s handset.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
