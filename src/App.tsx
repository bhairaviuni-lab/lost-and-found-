import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { HowItWorks } from './components/HowItWorks';
import { BrowseView } from './components/BrowseView';
import { DashboardView } from './components/DashboardView';
import { MyReportsView } from './components/MyReportsView';
import { AdminPanel } from './components/AdminPanel';
import { ItemCard } from './components/ItemCard';
import { ItemDetailsModal } from './components/ItemDetailsModal';
import { ReportItemModal } from './components/ReportItemModal';
import { ClaimModal } from './components/ClaimModal';
import { AuthModal } from './components/AuthModal';
import { ArchitectureHubModal } from './components/ArchitectureHubModal';
import { SupabaseSyncModal } from './components/SupabaseSyncModal';
import { User, Item, Claim, Stats } from './types';
import {
  api,
  getStoredUser,
  getStoredToken,
  clearAuthSession
} from './services/api';
import {
  Search,
  Sparkles,
  ShieldCheck,
  Building2,
  Heart,
  ExternalLink,
  Code2,
  ArrowRight
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(getStoredUser());
  const [activeView, setActiveView] = useState<string>('home');
  const [items, setItems] = useState<Item[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalLost: 0,
    totalFound: 0,
    itemsReunited: 0,
    activeItems: 0,
    totalUsers: 0,
    totalClaims: 0
  });
  const [claims, setClaims] = useState<{ submitted: Claim[]; received: Claim[] }>({
    submitted: [],
    received: []
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Modals state
  const [authModal, setAuthModal] = useState<{ open: boolean; mode: 'login' | 'register' }>({
    open: false,
    mode: 'login'
  });
  const [reportModal, setReportModal] = useState<{
    open: boolean;
    type: 'LOST' | 'FOUND';
    editItem: Item | null;
  }>({
    open: false,
    type: 'LOST',
    editItem: null
  });
  const [detailsModalItem, setDetailsModalItem] = useState<Item | null>(null);
  const [claimModalItem, setClaimModalItem] = useState<Item | null>(null);
  const [architectureHubOpen, setArchitectureHubOpen] = useState<boolean>(false);
  const [supabaseModalOpen, setSupabaseModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load primary data from server REST APIs
  const refreshData = useCallback(async () => {
    try {
      const [fetchedItems, fetchedStats] = await Promise.all([
        api.getItems(),
        api.getStats()
      ]);
      setItems(fetchedItems);
      setStats(fetchedStats);

      if (getStoredToken()) {
        try {
          const userClaims = await api.getMyClaims();
          setClaims(userClaims);
        } catch {
          // Token might be expired or invalid
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
    // Verify session
    if (getStoredToken()) {
      api.getMe()
        .then((res) => setCurrentUser(res.user))
        .catch(() => {
          clearAuthSession();
          setCurrentUser(null);
        });
    }
  }, [refreshData]);

  const handleLogout = () => {
    clearAuthSession();
    setCurrentUser(null);
    setActiveView('home');
    setClaims({ submitted: [], received: [] });
    showToast('You have been logged out successfully.');
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    setAuthModal({ open: false, mode: 'login' });
    showToast(`Welcome back, ${user.fullName}!`);
    refreshData();
    setActiveView('dashboard');
  };

  const handleReportSuccess = (newItem: Item) => {
    setReportModal({ open: false, type: 'LOST', editItem: null });
    showToast(`Report #${newItem.reportId} saved in database successfully!`);
    refreshData();
    setActiveView('my-reports');
  };

  const handleClaimSuccess = () => {
    setClaimModalItem(null);
    showToast('Ownership claim submitted! The poster will review your proof.');
    refreshData();
    if (currentUser) {
      setActiveView('my-reports');
    }
  };

  const handleOpenReport = (type: 'LOST' | 'FOUND') => {
    if (!currentUser) {
      setAuthModal({ open: true, mode: 'login' });
    } else {
      setReportModal({ open: true, type, editItem: null });
    }
  };

  const handleEditItem = (item: Item) => {
    setDetailsModalItem(null);
    setReportModal({
      open: true,
      type: item.type,
      editItem: item
    });
  };

  const handleDeleteItem = async (item: Item) => {
    if (!window.confirm(`Are you sure you want to delete report #${item.reportId}?`)) return;
    try {
      await api.deleteItem(item.id);
      setDetailsModalItem(null);
      showToast(`Report #${item.reportId} deleted.`);
      refreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete report.');
    }
  };

  // Recent items for Home page
  const recentItems = items.slice(0, 6);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-bottom duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenReportModal={handleOpenReport}
        onOpenAuthModal={(mode) => setAuthModal({ open: true, mode })}
        onLogout={handleLogout}
        onOpenArchitectureHub={() => setArchitectureHubOpen(true)}
        onOpenSupabaseModal={() => setSupabaseModalOpen(true)}
      />

      {/* Main Content Areas */}
      <main className="flex-1">
        
        {/* VIEW 1: HOME LANDING PAGE */}
        {activeView === 'home' && (
          <div className="space-y-0">
            <Hero
              stats={stats}
              onOpenReportModal={handleOpenReport}
              onNavigateToBrowse={() => setActiveView('browse')}
              onOpenArchitectureHub={() => setArchitectureHubOpen(true)}
            />

            <HowItWorks
              onOpenReportModal={handleOpenReport}
              onNavigateToBrowse={() => setActiveView('browse')}
            />

            {/* Recent Campus Listings Grid on Home */}
            <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    Real-Time Database Feed
                  </span>
                  <h2 className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight">
                    Recent Campus Reports
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Latest lost and found items reported across campus buildings and libraries.
                  </p>
                </div>

                <button
                  onClick={() => setActiveView('browse')}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors shadow-2xs self-start sm:self-auto cursor-pointer"
                >
                  <span>Browse All ({items.length})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {recentItems.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300">
                  <p className="text-slate-500 text-sm">No items currently reported in the system.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentItems.map((item) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      onViewDetails={(it) => setDetailsModalItem(it)}
                      onClaim={(it) => setClaimModalItem(it)}
                      isOwner={currentUser?.id === item.userId}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* VIEW 2: BROWSE ITEMS */}
        {activeView === 'browse' && (
          <BrowseView
            items={items}
            currentUser={currentUser}
            onViewItemDetails={(it) => setDetailsModalItem(it)}
            onClaimItem={(it) => setClaimModalItem(it)}
            onOpenReportModal={handleOpenReport}
          />
        )}

        {/* VIEW 3: USER DASHBOARD */}
        {activeView === 'dashboard' && currentUser && (
          <DashboardView
            currentUser={currentUser}
            items={items}
            claims={claims}
            onOpenReportModal={handleOpenReport}
            onNavigateToBrowse={() => setActiveView('browse')}
            onNavigateToMyReports={() => setActiveView('my-reports')}
            onViewItemDetails={(it) => setDetailsModalItem(it)}
            onClaimItem={(it) => setClaimModalItem(it)}
          />
        )}

        {/* VIEW 4: MY REPORTS & CLAIMS */}
        {activeView === 'my-reports' && currentUser && (
          <MyReportsView
            currentUser={currentUser}
            items={items}
            claims={claims}
            onRefreshData={refreshData}
            onViewItemDetails={(it) => setDetailsModalItem(it)}
            onEditItem={handleEditItem}
            onOpenReportModal={handleOpenReport}
          />
        )}

        {/* VIEW 5: ADMIN PANEL */}
        {activeView === 'admin' && currentUser && currentUser.role === 'ADMIN' && (
          <AdminPanel
            currentUser={currentUser}
            items={items}
            stats={stats}
            onRefreshData={refreshData}
            onViewItemDetails={(it) => setDetailsModalItem(it)}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Col 1: Brand */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                  LF
                </div>
                <span className="font-extrabold text-base text-white tracking-tight">
                  Campus Lost & Found Portal
                </span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
                “Lost something? Found something? Help your campus reconnect.” <br />
                Connecting college students, faculties, security desks, and administration to return lost items safely.
              </p>
              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => setArchitectureHubOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-900/60 text-indigo-300 border border-indigo-700/60 text-xs font-semibold hover:bg-indigo-800 transition-colors cursor-pointer"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>2nd Year College Viva & Source Hub</span>
                </button>
              </div>
            </div>

            {/* Col 2: Navigation */}
            <div className="space-y-2">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
                Platform Navigation
              </h4>
              <ul className="space-y-1.5">
                <li><button onClick={() => setActiveView('home')} className="hover:text-white transition-colors">Home</button></li>
                <li><button onClick={() => setActiveView('browse')} className="hover:text-white transition-colors">Browse Items</button></li>
                <li><button onClick={() => handleOpenReport('LOST')} className="hover:text-white transition-colors">Report Lost Item</button></li>
                <li><button onClick={() => handleOpenReport('FOUND')} className="hover:text-white transition-colors">Report Found Item</button></li>
                {currentUser && <li><button onClick={() => setActiveView('my-reports')} className="hover:text-white transition-colors">My Reports</button></li>}
              </ul>
            </div>

            {/* Col 3: Tech Stack & Credits */}
            <div className="space-y-2">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
                Technical Implementation
              </h4>
              <p className="text-slate-400 text-xs">
                • <strong>Frontend:</strong> HTML5, CSS3, JavaScript Fetch, React <br />
                • <strong>Backend:</strong> Java Spring Boot 3.2, REST API <br />
                • <strong>Database:</strong> MySQL 8.0, Spring Data JPA / Hibernate <br />
                • <strong>Security:</strong> BCrypt Hashing, Role-Based Access
              </p>
            </div>

          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
            <div>
              © 2026 Campus Lost & Found System • Computer Engineering Department Project.
            </div>
            <div className="flex items-center gap-4">
              <span>All MySQL database records persistent</span>
              <span>•</span>
              <button
                onClick={() => setArchitectureHubOpen(true)}
                className="text-blue-400 hover:underline"
              >
                Inspect Backend Source
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {/* 1. Item Details Modal */}
      {detailsModalItem && (
        <ItemDetailsModal
          item={detailsModalItem}
          currentUser={currentUser}
          onClose={() => setDetailsModalItem(null)}
          onClaim={(item) => {
            setDetailsModalItem(null);
            setClaimModalItem(item);
          }}
          onEdit={handleEditItem}
          onDelete={handleDeleteItem}
        />
      )}

      {/* 2. Report Lost / Found Item Modal */}
      {reportModal.open && (
        <ReportItemModal
          type={reportModal.type}
          currentUser={currentUser}
          onClose={() => setReportModal({ open: false, type: 'LOST', editItem: null })}
          onSuccess={handleReportSuccess}
          onOpenAuth={() => setAuthModal({ open: true, mode: 'login' })}
          editItem={reportModal.editItem}
        />
      )}

      {/* 3. Claim Ownership Modal */}
      {claimModalItem && (
        <ClaimModal
          item={claimModalItem}
          currentUser={currentUser}
          onClose={() => setClaimModalItem(null)}
          onSuccess={handleClaimSuccess}
          onOpenAuth={() => setAuthModal({ open: true, mode: 'login' })}
        />
      )}

      {/* 4. Login / Register Auth Modal */}
      {authModal.open && (
        <AuthModal
          initialMode={authModal.mode}
          onClose={() => setAuthModal({ open: false, mode: 'login' })}
          onSuccess={handleAuthSuccess}
        />
      )}

      {/* 5. College Architecture & Viva Hub Modal */}
      {architectureHubOpen && (
        <ArchitectureHubModal
          onClose={() => setArchitectureHubOpen(false)}
        />
      )}

      {/* 6. Supabase Backend Integration Modal */}
      {supabaseModalOpen && (
        <SupabaseSyncModal
          onClose={() => setSupabaseModalOpen(false)}
        />
      )}

    </div>
  );
}
