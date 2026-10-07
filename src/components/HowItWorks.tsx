import React from 'react';
import {
  FileEdit,
  Search,
  MessageSquare,
  Gift,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

interface HowItWorksProps {
  onOpenReportModal: (type: 'LOST' | 'FOUND') => void;
  onNavigateToBrowse: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({
  onOpenReportModal,
  onNavigateToBrowse
}) => {
  const steps = [
    {
      num: '01',
      title: 'Report an Item',
      description: 'Fill a 1-minute form with details, campus location, date, and optional photo. Generates a unique Report ID.',
      icon: FileEdit,
      color: 'blue'
    },
    {
      num: '02',
      title: 'Browse Matching Items',
      description: 'Search by category (Electronics, IDs, Keys, Bags) or location (Library, Canteen, Labs, Grounds).',
      icon: Search,
      color: 'indigo'
    },
    {
      num: '03',
      title: 'Submit / Verify Claim',
      description: 'If you spot your belongings, file a confidential verification claim providing proof or unique marks.',
      icon: MessageSquare,
      color: 'amber'
    },
    {
      num: '04',
      title: 'Reunite with Your Item',
      description: 'The finder verifies your claim, accepts it, and coordinates safe handover. Marked resolved in MySQL.',
      icon: Gift,
      color: 'emerald'
    }
  ];

  return (
    <section className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Simple 4-Step Process
          </span>
          <h2 className="mt-3 text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
            How Campus Lost & Found Works
          </h2>
          <p className="mt-3 text-base text-slate-600">
            A secure campus workflow designed to prevent fraud, protect personal privacy, and maximize recovery.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="relative bg-slate-50/70 hover:bg-white rounded-2xl p-6 border border-slate-200/80 hover:border-blue-300 hover:shadow-lg transition-all group"
              >
                {/* Step Number Badge */}
                <div className="flex items-center justify-between mb-5">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors">
                    Step {step.num}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {step.description}
                </p>

                {idx < 3 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                    <ArrowRight className="w-5 h-5 text-slate-300" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Action Banner */}
        <div className="mt-12 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-300 text-xs font-semibold mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              University Student Verification Required
            </div>
            <h3 className="text-xl sm:text-2xl font-bold">
              Misplaced your belongings today on campus?
            </h3>
            <p className="mt-1 text-sm text-slate-300">
              Check newly submitted reports in real-time or submit a report so fellow students can return it to you.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-center">
            <button
              onClick={() => onOpenReportModal('LOST')}
              className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-amber-500 hover:bg-amber-600 text-slate-950 transition-colors cursor-pointer flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4" />
              Report Lost
            </button>
            <button
              onClick={() => onOpenReportModal('FOUND')}
              className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-emerald-500 hover:bg-emerald-600 text-slate-950 transition-colors cursor-pointer flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Report Found
            </button>
            <button
              onClick={onNavigateToBrowse}
              className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              Search All Items
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
