import React from 'react';
import { useAgriBook } from '../services/appState';
import { X, MessageSquare, Smartphone, CheckCheck } from 'lucide-react';

interface SmsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SmsDrawer: React.FC<SmsDrawerProps> = ({ isOpen, onClose }) => {
  const { state } = useAgriBook();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end transition-opacity">
      <div className="w-full max-w-md bg-slate-50 h-full shadow-2xl flex flex-col border-l border-slate-300">
        {/* Header */}
        <div className="p-4 bg-emerald-900 text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-800 rounded-lg">
              <Smartphone className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Twilio SMS Feed (Demo)</h3>
              <p className="text-[11px] text-emerald-200">
                Sender ID: <span className="font-mono font-semibold bg-emerald-950 px-1.5 py-0.5 rounded text-white">AD-AGRIBOOK</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-emerald-200 hover:text-white rounded-lg hover:bg-emerald-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="bg-amber-50 border-b border-amber-200 p-3 text-xs text-amber-900 flex items-start gap-2">
          <MessageSquare className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p>
            <strong>Twilio SMS Simulation:</strong> In production, messages are dispatched via Twilio REST API to the farmer&apos;s phone. For this hackathon demo, all triggered SMS alerts are rendered live here.
          </p>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {state.notifications.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-sm">
              <MessageSquare className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              No SMS notifications dispatched yet.
            </div>
          ) : (
            state.notifications.map((notif) => {
              const time = new Date(notif.timestamp).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
              });
              const date = new Date(notif.timestamp).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
              });

              return (
                <div
                  key={notif.id}
                  className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs hover:border-emerald-300 transition-all"
                >
                  <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-100 text-[11px]">
                    <span className="font-bold text-emerald-950 font-mono tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {notif.smsSenderId}
                    </span>
                    <span className="text-slate-400 font-mono">
                      {date} • {time}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-900 mb-1">{notif.title}</p>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">{notif.message}</p>

                  <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-50">
                    <span>To: +91-{notif.farmerMobile}</span>
                    <span className="flex items-center gap-1 text-emerald-600 font-medium">
                      <CheckCheck className="w-3.5 h-3.5" /> Delivered
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 text-center">
          <p className="text-[11px] text-slate-500">
            Compliant with TRAI DLT registration guidelines for government agricultural alerts.
          </p>
        </div>
      </div>
    </div>
  );
};
