import React, { useState } from 'react';
import {
  X,
  MapPin,
  Calendar,
  Clock,
  Tag,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Copy,
  Check,
  Share2,
  Trash2,
  Edit3,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { Item, User } from '../types';

interface ItemDetailsModalProps {
  item: Item | null;
  currentUser: User | null;
  onClose: () => void;
  onClaim: (item: Item) => void;
  onEdit?: (item: Item) => void;
  onDelete?: (item: Item) => void;
}

export const ItemDetailsModal: React.FC<ItemDetailsModalProps> = ({
  item,
  currentUser,
  onClose,
  onClaim,
  onEdit,
  onDelete
}) => {
  const [copied, setCopied] = useState(false);

  if (!item) return null;

  const isOwner = currentUser?.id === item.userId;
  const isAdmin = currentUser?.role === 'ADMIN';
  const isLost = item.type === 'LOST';
  const isResolved = item.status === 'RESOLVED';

  const copyReportId = () => {
    navigator.clipboard.writeText(item.reportId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      <div
        className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-white ${
                isLost ? 'bg-amber-500' : 'bg-emerald-600'
              }`}
            >
              {isLost ? <HelpCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
              {item.type} ITEM
            </span>

            {isResolved ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
                Resolved / Returned
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                Active Listing
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyReportId}
              className="text-xs font-mono text-slate-500 hover:text-slate-800 bg-white border border-slate-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors"
              title="Copy Report ID"
            >
              <span>{item.reportId}</span>
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          
          {/* Main Image Banner */}
          <div className="relative aspect-16/9 w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner">
            <img
              src={item.imageUrl}
              alt={item.itemName}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = isLost
                  ? 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80'
                  : 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80';
              }}
            />
          </div>

          {/* Title and Category */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                <Tag className="w-3 h-3" />
                {item.category}
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">
              {item.itemName}
            </h2>
          </div>

          {/* Specs / Meta Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Campus Location</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                {item.location}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block font-medium">Date {isLost ? 'Lost' : 'Found'}</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                {item.date}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block font-medium">Approx. Time</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                {item.time || 'N/A'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block font-medium">Brand</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">
                {item.brand || 'Not specified'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block font-medium">Color</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">
                {item.color || 'Not specified'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block font-medium">Contact Preference</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">
                {item.contactPreference}
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Description
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200">
              {item.description}
            </p>
          </div>

          {/* Identifying Characteristics */}
          {item.identifyingDetails && (
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                Identifying Details / Hidden Marks
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                {item.identifyingDetails}
              </p>
            </div>
          )}

          {/* Privacy & Reporter Information */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Reported by</p>
              <p className="text-sm font-bold text-slate-800">{item.posterName}</p>
              <p className="text-xs text-slate-500">
                {item.contactPreference === 'PLATFORM' && !isOwner && !isAdmin
                  ? '🔒 Direct contact details secured by Campus Honor Code'
                  : `Email: ${item.posterEmail}`}
              </p>
            </div>

            <div className="text-right text-[11px] text-slate-400">
              <span>Report ID:</span>
              <span className="font-mono block text-slate-700 font-semibold">{item.reportId}</span>
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:px-6 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-2">
            {(isOwner || isAdmin) && onDelete && (
              <button
                onClick={() => onDelete(item)}
                className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Report
              </button>
            )}

            {(isOwner || isAdmin) && onEdit && (
              <button
                onClick={() => onEdit(item)}
                className="px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 border border-slate-300 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {!isOwner && !isResolved && (
              <button
                onClick={() => {
                  onClose();
                  onClaim(item);
                }}
                className="px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                {item.type === 'FOUND' ? 'I Think This Is Mine (Claim)' : 'I Have Information / Found This'}
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
