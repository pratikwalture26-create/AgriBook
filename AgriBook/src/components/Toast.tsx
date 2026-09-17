import React, { useEffect } from 'react';
import { useAgriBook } from '../services/appState';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { state, clearToast } = useAgriBook();
  const toast = state.activeToast;

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        clearToast();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast, clearToast]);

  if (!toast) return null;

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-4 flex items-start space-x-3 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="shrink-0 mt-0.5">
        {toast.type === 'success' ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
        ) : toast.type === 'warn' ? (
          <AlertCircle className="w-5 h-5 text-amber-600" />
        ) : (
          <Info className="w-5 h-5 text-blue-600" />
        )}
      </div>

      <div className="flex-1 text-xs">
        <strong className="block font-bold text-slate-900 text-sm mb-0.5">
          {toast.title}
        </strong>
        <p className="text-slate-600 leading-relaxed">{toast.message}</p>
      </div>

      <button
        onClick={clearToast}
        className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
