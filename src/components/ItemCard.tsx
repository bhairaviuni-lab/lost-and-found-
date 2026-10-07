import React from 'react';
import {
  MapPin,
  Calendar,
  Clock,
  Tag,
  ArrowUpRight,
  CheckCircle,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import { Item } from '../types';

interface ItemCardProps {
  item: Item;
  onViewDetails: (item: Item) => void;
  onClaim?: (item: Item) => void;
  isOwner?: boolean;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  onViewDetails,
  onClaim,
  isOwner
}) => {
  const isLost = item.type === 'LOST';
  const isResolved = item.status === 'RESOLVED';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col group">
      
      {/* Card Image Area */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100">
        <img
          src={item.imageUrl}
          alt={item.itemName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            // fallback placeholder if image link fails
            (e.target as HTMLImageElement).src = isLost
              ? 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80'
              : 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80';
          }}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-60"></div>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
          {/* Lost/Found Badge */}
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold shadow-sm ${
              isLost
                ? 'bg-amber-500 text-white'
                : 'bg-emerald-600 text-white'
            }`}
          >
            {isLost ? <HelpCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
            {item.type}
          </span>

          {/* Status Badge */}
          {isResolved ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-600 text-white shadow-sm">
              <CheckCircle className="w-3 h-3" />
              RESOLVED / RETURNED
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-white/90 backdrop-blur-xs text-slate-700 shadow-xs">
              ACTIVE
            </span>
          )}
        </div>

        {/* Category Pill on Bottom-Left */}
        <div className="absolute bottom-2.5 left-3">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-black/60 text-white backdrop-blur-xs">
            <Tag className="w-3 h-3" />
            {item.category}
          </span>
        </div>

        {/* Report ID on Bottom-Right */}
        <div className="absolute bottom-2.5 right-3">
          <span className="font-mono text-[10px] text-white/90 bg-black/40 px-1.5 py-0.5 rounded-sm backdrop-blur-xs">
            #{item.reportId}
          </span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <h3 className="font-bold text-base sm:text-lg text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
            {item.itemName}
          </h3>

          {/* Location & Date */}
          <div className="mt-2 space-y-1 text-xs text-slate-500">
            <div className="flex items-center gap-1.5 line-clamp-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{item.location}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{item.date}</span>
              </div>
              {item.time && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{item.time}</span>
                </div>
              )}
            </div>
          </div>

          {/* Description Excerpt */}
          <p className="mt-3 text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
            {item.description}
          </p>

          {/* Brand & Color meta tags if available */}
          {(item.brand || item.color) && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {item.brand && item.brand !== 'Not specified' && (
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                  Brand: {item.brand}
                </span>
              )}
              {item.color && item.color !== 'Not specified' && (
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                  Color: {item.color}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="text-[11px] text-slate-500 truncate">
            Posted by <span className="font-medium text-slate-700">{item.posterName.split(' ')[0]}</span>
            {isOwner && <span className="ml-1 text-blue-600 font-bold">(You)</span>}
          </div>

          <div className="flex items-center gap-1.5">
            {!isOwner && !isResolved && item.type === 'FOUND' && onClaim && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClaim(item);
                }}
                className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                title="Claim this found item"
              >
                Claim
              </button>
            )}

            <button
              onClick={() => onViewDetails(item)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
            >
              <span>View Details</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
