import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Lock,
  Loader2
} from 'lucide-react';
import { Item, User } from '../types';
import { api } from '../services/api';

interface ClaimModalProps {
  item: Item | null;
  currentUser: User | null;
  onClose: () => void;
  onSuccess: () => void;
  onOpenAuth: () => void;
}

export const ClaimModal: React.FC<ClaimModalProps> = ({
  item,
  currentUser,
  onClose,
  onSuccess,
  onOpenAuth
}) => {
  const [reason, setReason] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [proofDetails, setProofDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!item) return null;

  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            Authentication Required
          </h3>
          <p className="text-sm text-slate-600">
            To submit a claim and verify ownership of <strong>{item.itemName}</strong>, please log in or register with your college email.
          </p>
          <div className="flex gap-2 justify-center pt-2">
            <button
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="px-5 py-2.5 rounded-xl font-bold text-sm bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
            >
              Sign In to Continue
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl font-semibold text-sm bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please explain why you believe this item belongs to you.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await api.submitClaim(item.id, {
        reason: reason.trim(),
        additionalDetails: additionalDetails.trim(),
        proofDetails: proofDetails.trim()
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to submit claim. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-emerald-50/70">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <h3 className="font-extrabold text-slate-900 text-base">
              Submit Ownership Claim
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-emerald-100/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Target Item summary */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Claiming Item</span>
              <span className="font-bold text-slate-900 text-sm">{item.itemName}</span>
            </div>
            <span className="font-mono bg-white px-2 py-1 rounded-md border border-slate-200 text-slate-600 font-semibold">
              #{item.reportId}
            </span>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Why do you think this item belongs to you? <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. I left my calculator on desk 4 during the Math exam around 12:30 PM..."
              className="w-full text-sm rounded-xl border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"
            />
          </div>

          {/* Additional details */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Additional Identifying Information
            </label>
            <textarea
              rows={2}
              value={additionalDetails}
              onChange={(e) => setAdditionalDetails(e.target.value)}
              placeholder="e.g. Specific stickers, scratch marks, inner compartment contents, wallpaper image..."
              className="w-full text-sm rounded-xl border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"
            />
          </div>

          {/* Proof / Verification code */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Optional Proof / Serial Number / Invoice
            </label>
            <input
              type="text"
              value={proofDetails}
              onChange={(e) => setProofDetails(e.target.value)}
              placeholder="e.g. Serial: SN984210, lockscreen passcode hint, student roll number..."
              className="w-full text-sm rounded-xl border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"
            />
          </div>

          <div className="pt-2 text-[11px] text-slate-500 bg-amber-50/70 p-3 rounded-xl border border-amber-200">
            <strong>Campus Honor Code:</strong> False claims are tracked with your Student ID ({currentUser.studentId}) and reportable to college discipline.
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting Claim...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Submit Claim to Founder
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
