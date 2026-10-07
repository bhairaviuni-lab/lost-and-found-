import React from 'react';
import {
  Search,
  PlusCircle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  Users
} from 'lucide-react';
import { Stats } from '../types';

interface HeroProps {
  stats: Stats;
  onOpenReportModal: (type: 'LOST' | 'FOUND') => void;
  onNavigateToBrowse: () => void;
  onOpenArchitectureHub: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  stats,
  onOpenReportModal,
  onNavigateToBrowse,
  onOpenArchitectureHub
}) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-slate-50 pt-10 pb-16 border-b border-slate-200">
      {/* Background Decorative Rings */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-20 right-10 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Tagline pill */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200/80 text-blue-900 text-xs font-semibold shadow-2xs">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-ping"></span>
            <span>“Lost something? Found something? Help your campus reconnect.”</span>
          </div>
        </div>

        {/* Main Heading */}
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
            Find What You Lost. <br />
            <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-sky-600 bg-clip-text text-transparent">
              Return What You Found.
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            The official centralized recovery portal for college students, faculty, and campus security.
            Post lost belongings, report discovered items, verify claims, and restore peace of mind.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => onOpenReportModal('LOST')}
              className="px-6 py-3.5 rounded-xl font-bold text-white bg-amber-600 hover:bg-amber-700 transition-all shadow-md shadow-amber-600/20 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 text-sm sm:text-base cursor-pointer"
            >
              <PlusCircle className="w-5 h-5" />
              Report Lost Item
            </button>

            <button
              onClick={() => onOpenReportModal('FOUND')}
              className="px-6 py-3.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 text-sm sm:text-base cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5" />
              Report Found Item
            </button>

            <button
              onClick={onNavigateToBrowse}
              className="px-6 py-3.5 rounded-xl font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 transition-all shadow-xs hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 text-sm sm:text-base cursor-pointer"
            >
              <Search className="w-5 h-5 text-slate-600" />
              Browse Items
            </button>
          </div>

          {/* College Project Badge / Architecture indicator */}
          <div className="mt-6 flex items-center justify-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-medium text-slate-600">
              <Building2 className="w-4 h-4 text-blue-600" />
              Computer Engineering Dept.
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 font-medium text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Verified Student Network
            </span>
            <span>•</span>
            <button
              onClick={onOpenArchitectureHub}
              className="text-indigo-600 font-semibold hover:underline inline-flex items-center gap-1"
            >
              Full Stack Java + MySQL Project
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Dynamic Statistics Cards */}
        <div className="mt-14 max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded-md">
                  Lost Reports
                </span>
                <HelpCircle className="w-4 h-4 text-amber-500" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono">
                  {stats.totalLost}
                </span>
                <span className="text-xs text-slate-500">reported</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">Awaiting safe return</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md">
                  Found Reports
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono">
                  {stats.totalFound}
                </span>
                <span className="text-xs text-slate-500">recorded</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">Safe in campus hands</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-blue-200 bg-gradient-to-br from-blue-50/50 to-white shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider bg-blue-100 px-2 py-0.5 rounded-md">
                  Items Reunited
                </span>
                <Sparkles className="w-4 h-4 text-blue-600" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-blue-800 font-mono">
                  {stats.itemsReunited}
                </span>
                <span className="text-xs text-blue-700 font-medium">success</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">Reconnected with owners</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded-md">
                  Campus Members
                </span>
                <Users className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono">
                  {stats.totalUsers}
                </span>
                <span className="text-xs text-slate-500">registered</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">Students & staff</p>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
