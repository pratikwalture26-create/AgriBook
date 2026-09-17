import React, { useState } from 'react';
import { useAgriBook } from '../../services/appState';
import { X, Star, Check } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  centreId: string;
  tokenNumber: string;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  centreId,
  tokenNumber,
}) => {
  const { submitFeedback } = useAgriBook();
  const [rating, setRating] = useState<number>(5);
  const [waitingRating, setWaitingRating] = useState<number>(5);
  const [staffRating, setStaffRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitFeedback(rating, waitingRating, staffRating, comment, centreId, tokenNumber);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="p-4 bg-emerald-900 text-white flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold">Procurement Feedback</h3>
            <p className="text-[11px] text-emerald-200">Help us improve mandi wait times</p>
          </div>
          <button onClick={onClose} className="p-1 text-emerald-200 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Overall Experience (Token: {tokenNumber})
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 focus:outline-hidden"
                >
                  <Star
                    className={`w-6 h-6 transition-colors ${
                      star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-slate-600 ml-2">{rating}/5 Stars</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Waiting Time Satisfaction
            </label>
            <div className="flex items-center space-x-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setWaitingRating(star)}
                  className="p-1 focus:outline-hidden"
                >
                  <Star
                    className={`w-5 h-5 transition-colors ${
                      star <= waitingRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Staff &amp; Weighment Inspection
            </label>
            <div className="flex items-center space-x-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setStaffRating(star)}
                  className="p-1 focus:outline-hidden"
                >
                  <Star
                    className={`w-5 h-5 transition-colors ${
                      star <= staffRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Additional Comments (Optional)
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. Saved 3 hours compared to last year's queue..."
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-slate-800"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Submit Feedback</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
