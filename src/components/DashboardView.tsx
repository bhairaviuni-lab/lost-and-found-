import React from 'react';
import {
  PlusCircle,
  Search,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  FileText,
  Clock,
  ArrowRight,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { User, Item, Claim } from '../types';
import { ItemCard } from './ItemCard';

interface DashboardViewProps {
  currentUser: User;
  items: Item[];
  claims: { submitted: Claim[]; received: Claim[] };
  onOpenReportModal: (type: 'LOST' | 'FOUND') => void;
  onNavigateToBrowse: () => void;
  onNavigateToMyReports: () => void;
  onViewItemDetails: (item: Item) => void;
  onClaimItem: (item: Item) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  items,
  claims,
  onOpenReportModal,
  onNavigateToBrowse,
  onNavigateToMyReports,
  onViewItemDetails,
  onClaimItem
}) => {
  const myItems = items.filter(i => i.userId === currentUser.id);
  const myLostCount = myItems.filter(i => i.type === 'LOST').length;
  const myFoundCount = myItems.filter(i => i.type === 'FOUND').length;
  const myActiveCount = myItems.filter(i => i.status === 'OPEN').length;
  const myResolvedCount = myItems.filter(i => i.status === 'RESOLVED').length;

  const pendingReceivedClaims = claims.received.filter(c => c.status === 'PENDING').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-full bg-white/5 skew-x-12 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold mb-3 border border-blue-400/20">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Verified Student Profile • {currentUser.studentId}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Welcome, {currentUser.fullName}
            </h1>
            <p className="mt-1 text-sm sm:text-base text-slate-300">
              College Email: <span className="font-mono text-white">{currentUser.collegeEmail}</span> • Phone: <span className="text-white">{currentUser.phone}</span>
            </p>
          </div>

          {/* Quick Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onOpenReportModal('LOST')}
              className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-amber-500 hover:bg-amber-600 text-slate-950 transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
              Report Lost Item
            </button>
            <button
              onClick={() => onOpenReportModal('FOUND')}
              className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-emerald-500 hover:bg-emerald-600 text-slate-950 transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Report Found Item
            </button>
            <button
              onClick={onNavigateToBrowse}
              className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-white/10 hover:bg-white/20 text-white transition-all flex items-center gap-1.5 cursor-pointer border border-white/20"
            >
              <Search className="w-4 h-4" />
              Browse Items
            </button>
          </div>
        </div>
      </div>

      {/* Received claims alert banner if any pending */}
      {pendingReceivedClaims > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
              {pendingReceivedClaims}
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                You have {pendingReceivedClaims} pending ownership {pendingReceivedClaims === 1 ? 'claim' : 'claims'} to review!
              </h4>
              <p className="text-xs text-amber-700">
                Students have submitted claims for items you found. Verify their clues and accept to resolve.
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToMyReports}
            className="px-4 py-2 text-xs font-bold text-amber-900 bg-amber-200 hover:bg-amber-300 rounded-xl transition-colors shrink-0"
          >
            Review Claims
          </button>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
              My Lost Reports
            </span>
            <HelpCircle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="mt-4 text-3xl font-extrabold text-slate-900 font-mono">
            {myLostCount}
          </p>
          <p className="mt-1 text-xs text-slate-500">Items you reported as lost</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              My Found Reports
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="mt-4 text-3xl font-extrabold text-slate-900 font-mono">
            {myFoundCount}
          </p>
          <p className="mt-1 text-xs text-slate-500">Items you recovered for others</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
              Active Reports
            </span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <p className="mt-4 text-3xl font-extrabold text-slate-900 font-mono">
            {myActiveCount}
          </p>
          <p className="mt-1 text-xs text-slate-500">Currently open and searchable</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
              Resolved Items
            </span>
            <Sparkles className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="mt-4 text-3xl font-extrabold text-slate-900 font-mono">
            {myResolvedCount}
          </p>
          <p className="mt-1 text-xs text-slate-500">Successfully returned</p>
        </div>

      </div>

      {/* My Recent Reports Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              My Recent Submissions
            </h2>
            <p className="text-xs text-slate-500">
              All reports submitted under your college identity.
            </p>
          </div>
          <button
            onClick={onNavigateToMyReports}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            Manage All in "My Reports"
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {myItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              No reports filed yet
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              If you have lost or found something around the college campus, create your first report now.
            </p>
            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => onOpenReportModal('LOST')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-white hover:bg-amber-600"
              >
                Report Lost Item
              </button>
              <button
                onClick={() => onOpenReportModal('FOUND')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Report Found Item
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myItems.slice(0, 3).map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onViewDetails={onViewItemDetails}
                isOwner={true}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
