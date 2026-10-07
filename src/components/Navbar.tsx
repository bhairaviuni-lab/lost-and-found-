import React, { useState } from 'react';
import {
  Compass,
  PlusCircle,
  Search,
  User as UserIcon,
  LogOut,
  ShieldAlert,
  Code2,
  Menu,
  X,
  FileText,
  Sparkles
} from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentUser: User | null;
  activeView: string;
  setActiveView: (view: string) => void;
  onOpenReportModal: (type: 'LOST' | 'FOUND') => void;
  onOpenAuthModal: (mode: 'login' | 'register') => void;
  onLogout: () => void;
  onOpenArchitectureHub: () => void;
  onOpenSupabaseModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeView,
  setActiveView,
  onOpenReportModal,
  onOpenAuthModal,
  onLogout,
  onOpenArchitectureHub,
  onOpenSupabaseModal
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navigateTo = (view: string) => {
    setActiveView(view);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div
            onClick={() => navigateTo('home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                  Campus Lost & Found
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm bg-blue-100 text-blue-800">
                  UniPortal
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Help your campus reconnect
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => navigateTo('home')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                activeView === 'home'
                  ? 'text-blue-600 bg-blue-50 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => navigateTo('browse')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                activeView === 'browse'
                  ? 'text-blue-600 bg-blue-50 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Search className="w-4 h-4" />
              Browse Items
            </button>

            <button
              onClick={() => {
                if (!currentUser) {
                  onOpenAuthModal('login');
                } else {
                  onOpenReportModal('LOST');
                }
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-amber-700 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors"
            >
              <PlusCircle className="w-4 h-4 text-amber-600" />
              Report Lost
            </button>

            <button
              onClick={() => {
                if (!currentUser) {
                  onOpenAuthModal('login');
                } else {
                  onOpenReportModal('FOUND');
                }
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors"
            >
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              Report Found
            </button>

            {currentUser && (
              <button
                onClick={() => navigateTo('my-reports')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  activeView === 'my-reports'
                    ? 'text-blue-600 bg-blue-50 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-4 h-4" />
                My Reports
              </button>
            )}

            {currentUser && currentUser.role === 'ADMIN' && (
              <button
                onClick={() => navigateTo('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
                  activeView === 'admin'
                    ? 'text-purple-700 bg-purple-100'
                    : 'text-purple-600 hover:bg-purple-50'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-purple-600" />
                Admin Panel
              </button>
            )}

            {/* Architecture & Viva Hub Button */}
            <button
              onClick={onOpenArchitectureHub}
              title="View Java Spring Boot code, MySQL Schema and 2nd Year Viva Guide"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-indigo-200 bg-indigo-50/70 text-indigo-700 hover:bg-indigo-100 transition-colors shadow-2xs"
            >
              <Code2 className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden lg:inline">Java + MySQL Hub</span>
              <span className="lg:hidden">Architecture</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </button>

            {/* Supabase Integration Button */}
            <button
              onClick={onOpenSupabaseModal}
              title="Connected to Supabase Project: nldzgkhjrhztwipecdnb"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors shadow-2xs cursor-pointer"
            >
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="hidden lg:inline">Supabase DB</span>
              <span className="lg:hidden">Supabase</span>
            </button>
          </nav>

          {/* Right Action / Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-all shadow-2xs"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    {currentUser.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left text-xs">
                    <p className="font-semibold text-slate-800 leading-tight truncate max-w-[110px]">
                      {currentUser.fullName.split(' ')[0]}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {currentUser.role === 'ADMIN' ? 'Administrator' : currentUser.studentId}
                    </p>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-medium text-slate-500">Signed in as</p>
                      <p className="text-sm font-semibold text-slate-900 truncate">{currentUser.fullName}</p>
                      <p className="text-xs text-slate-500 truncate">{currentUser.collegeEmail}</p>
                    </div>

                    <button
                      onClick={() => navigateTo('dashboard')}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                      Dashboard
                    </button>

                    <button
                      onClick={() => navigateTo('my-reports')}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      My Reports & Claims
                    </button>

                    {currentUser.role === 'ADMIN' && (
                      <button
                        onClick={() => navigateTo('admin')}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-50 flex items-center gap-2"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
                        Admin Panel
                      </button>
                    )}

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuthModal('login')}
                  className="px-3.5 py-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => onOpenAuthModal('register')}
                  className="px-4 py-1.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-500/20 transition-all hover:shadow-md"
                >
                  Register
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              onClick={onOpenSupabaseModal}
              className="p-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-bold"
              title="Supabase Backend"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            </button>
            <button
              onClick={onOpenArchitectureHub}
              className="p-1.5 text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg text-xs font-bold"
              title="Java + MySQL Code"
            >
              <Code2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg animate-in slide-in-from-top duration-150">
          <button
            onClick={() => navigateTo('home')}
            className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100"
          >
            Home
          </button>
          <button
            onClick={() => navigateTo('browse')}
            className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100 flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Browse Items
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              if (!currentUser) onOpenAuthModal('login');
              else onOpenReportModal('LOST');
            }}
            className="w-full text-left px-3 py-2 text-sm font-medium text-amber-700 bg-amber-50 rounded-lg flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4 text-amber-600" />
            Report Lost Item
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              if (!currentUser) onOpenAuthModal('login');
              else onOpenReportModal('FOUND');
            }}
            className="w-full text-left px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4 text-emerald-600" />
            Report Found Item
          </button>

          {currentUser ? (
            <>
              <button
                onClick={() => navigateTo('dashboard')}
                className="w-full text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 flex items-center gap-2"
              >
                <UserIcon className="w-4 h-4" />
                Dashboard ({currentUser.fullName.split(' ')[0]})
              </button>
              <button
                onClick={() => navigateTo('my-reports')}
                className="w-full text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                My Reports & Claims
              </button>
              {currentUser.role === 'ADMIN' && (
                <button
                  onClick={() => navigateTo('admin')}
                  className="w-full text-left px-3 py-2 text-sm font-semibold text-purple-700 bg-purple-50 rounded-lg flex items-center gap-2"
                >
                  <ShieldAlert className="w-4 h-4 text-purple-600" />
                  Admin Panel
                </button>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout();
                }}
                className="w-full text-left px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </button>
            </>
          ) : (
            <div className="pt-3 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuthModal('login');
                }}
                className="flex-1 py-2 text-center text-sm font-medium text-slate-700 bg-slate-100 rounded-lg"
              >
                Log In
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuthModal('register');
                }}
                className="flex-1 py-2 text-center text-sm font-semibold text-white bg-blue-600 rounded-lg"
              >
                Register
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
