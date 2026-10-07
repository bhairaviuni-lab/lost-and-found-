import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  FileText,
  MessageSquare,
  Trash2,
  CheckCircle2,
  RotateCcw,
  AlertTriangle,
  Loader2,
  Check,
  Search,
  ExternalLink
} from 'lucide-react';
import { User, Item, Claim, Stats } from '../types';
import { api } from '../services/api';

interface AdminPanelProps {
  currentUser: User;
  items: Item[];
  stats: Stats;
  onRefreshData: () => Promise<void>;
  onViewItemDetails: (item: Item) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUser,
  items,
  stats,
  onRefreshData,
  onViewItemDetails
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'reports' | 'claims'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [adminClaims, setAdminClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [uList, cList] = await Promise.all([
        api.getAdminUsers(),
        api.getAdminClaims()
      ]);
      setUsers(uList);
      setAdminClaims(cList);
    } catch (err: any) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (item: Item) => {
    const newStatus = item.status === 'RESOLVED' ? 'OPEN' : 'RESOLVED';
    try {
      setActionLoading(item.id);
      await api.updateItemStatusAdmin(item.id, newStatus);
      await onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to update status.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteItem = async (item: Item) => {
    if (!window.confirm(`[ADMIN ACTION] Are you sure you want to permanently remove item #${item.reportId}?`)) {
      return;
    }
    try {
      setActionLoading(item.id);
      await api.deleteItem(item.id);
      await onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete report.');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredReports = items.filter(i =>
    i.itemName.toLowerCase().includes(searchFilter.toLowerCase()) ||
    i.reportId.toLowerCase().includes(searchFilter.toLowerCase()) ||
    i.posterName.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/30 text-purple-200 text-xs font-bold mb-2 border border-purple-400/30">
            <ShieldAlert className="w-4 h-4 text-purple-300" />
            University Proctor & Security Administration
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Campus Lost & Found Control Center
          </h1>
          <p className="text-xs sm:text-sm text-purple-200 mt-1">
            Logged in as {currentUser.fullName} ({currentUser.collegeEmail})
          </p>
        </div>

        <button
          onClick={loadAdminData}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Records
        </button>
      </div>

      {/* Admin Stats Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Students Registered</span>
          <p className="text-2xl font-extrabold text-slate-900 font-mono mt-1">{users.length || stats.totalUsers}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Reports in MySQL</span>
          <p className="text-2xl font-extrabold text-slate-900 font-mono mt-1">{items.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Active Claims Tracked</span>
          <p className="text-2xl font-extrabold text-slate-900 font-mono mt-1">{adminClaims.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Reunited / Resolved Items</span>
          <p className="text-2xl font-extrabold text-blue-700 font-mono mt-1">{stats.itemsReunited}</p>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer ${
            activeTab === 'users' ? 'bg-purple-700 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Registered Campus Users ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer ${
            activeTab === 'reports' ? 'bg-purple-700 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>All Lost & Found Reports ({items.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('claims')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer ${
            activeTab === 'claims' ? 'bg-purple-700 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>All Claims Audit ({adminClaims.length})</span>
        </button>
      </div>

      {/* USERS TABLE */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Student ID / Staff ID</th>
                  <th className="px-5 py-3.5">Full Name</th>
                  <th className="px-5 py-3.5">College Email</th>
                  <th className="px-5 py-3.5">Phone Number</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Registered On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80">
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-800">
                      {u.studentId}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-900">
                      {u.fullName}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 font-mono">
                      {u.collegeEmail}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {u.phone}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ALL REPORTS TABLE */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search reports by title, Report ID, or reporter..."
              className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Report ID</th>
                  <th className="px-4 py-3">Item Name</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Reported By</th>
                  <th className="px-4 py-3">Location & Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-mono font-bold text-slate-700">
                      #{item.reportId}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">
                      {item.itemName}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold text-white ${
                        item.type === 'LOST' ? 'bg-amber-500' : 'bg-emerald-600'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{item.posterName}</div>
                      <div className="text-[10px] text-slate-400">{item.posterEmail}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <div>{item.location}</div>
                      <div className="text-[10px] text-slate-400">{item.date}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        item.status === 'RESOLVED' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewItemDetails(item)}
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg"
                          title="View Details"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(item)}
                          disabled={actionLoading === item.id}
                          className="px-2 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg"
                          title="Toggle Status"
                        >
                          {item.status === 'RESOLVED' ? 'Mark Active' : 'Mark Resolved'}
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item)}
                          disabled={actionLoading === item.id}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                          title="Delete Inappropriate Report"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ALL CLAIMS TABLE */}
      {activeTab === 'claims' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Claim ID</th>
                  <th className="px-4 py-3">Target Item</th>
                  <th className="px-4 py-3">Claimant</th>
                  <th className="px-4 py-3">Claim Reason & Proof</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {adminClaims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-mono font-bold text-slate-600">
                      {claim.id}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{claim.itemTitle}</div>
                      <div className="font-mono text-[10px] text-blue-600">#{claim.itemReportId}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-800">{claim.claimantName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{claim.claimantEmail}</div>
                      <div className="text-[10px] text-slate-400">{claim.claimantPhone}</div>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="line-clamp-2 text-slate-700">{claim.reason}</p>
                      {claim.proofDetails && (
                        <p className="text-[10px] text-emerald-700 font-mono mt-0.5 truncate">
                          Proof: {claim.proofDetails}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        claim.status === 'ACCEPTED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : claim.status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {claim.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {new Date(claim.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
