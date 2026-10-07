import React, { useState } from 'react';
import {
  FileText,
  HelpCircle,
  CheckCircle2,
  Trash2,
  Edit3,
  ExternalLink,
  ShieldCheck,
  Check,
  X,
  AlertCircle,
  MessageSquare,
  Loader2,
  UserCheck
} from 'lucide-react';
import { User, Item, Claim } from '../types';
import { api } from '../services/api';

interface MyReportsViewProps {
  currentUser: User;
  items: Item[];
  claims: { submitted: Claim[]; received: Claim[] };
  onRefreshData: () => Promise<void>;
  onViewItemDetails: (item: Item) => void;
  onEditItem: (item: Item) => void;
  onOpenReportModal: (type: 'LOST' | 'FOUND') => void;
}

export const MyReportsView: React.FC<MyReportsViewProps> = ({
  currentUser,
  items,
  claims,
  onRefreshData,
  onViewItemDetails,
  onEditItem,
  onOpenReportModal
}) => {
  const [activeTab, setActiveTab] = useState<'lost' | 'found' | 'claims_received' | 'claims_submitted'>('lost');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const myLostItems = items.filter(i => i.userId === currentUser.id && i.type === 'LOST');
  const myFoundItems = items.filter(i => i.userId === currentUser.id && i.type === 'FOUND');

  // Handle Delete Item
  const handleDeleteItem = async (item: Item) => {
    if (!window.confirm(`Are you sure you want to delete report #${item.reportId} (${item.itemName})?`)) {
      return;
    }

    try {
      setActionLoading(item.id);
      await api.deleteItem(item.id);
      setActionMessage(`Report #${item.reportId} deleted successfully.`);
      await onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete report.');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle Accept Claim
  const handleAcceptClaim = async (claim: Claim) => {
    if (!window.confirm(`Accept claim from ${claim.claimantName}? This will mark the item as Resolved/Returned.`)) {
      return;
    }

    try {
      setActionLoading(claim.id);
      await api.acceptClaim(claim.id);
      setActionMessage(`Claim accepted! Item marked as Resolved / Returned.`);
      await onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to accept claim.');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle Reject Claim
  const handleRejectClaim = async (claim: Claim) => {
    if (!window.confirm(`Reject claim from ${claim.claimantName}?`)) {
      return;
    }

    try {
      setActionLoading(claim.id);
      await api.rejectClaim(claim.id);
      setActionMessage(`Claim rejected.`);
      await onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to reject claim.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            My Campus Reports & Claims
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your submitted lost reports, found items, and review ownership claims.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenReportModal('LOST')}
            className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition-colors flex items-center gap-1.5"
          >
            <HelpCircle className="w-4 h-4" />
            Report Lost
          </button>
          <button
            onClick={() => onOpenReportModal('FOUND')}
            className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            Report Found
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('lost')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'lost'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>My Lost Items</span>
          <span className="px-1.5 py-0.5 rounded-full text-[11px] bg-black/20 text-white">
            {myLostItems.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('found')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'found'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>My Found Items</span>
          <span className="px-1.5 py-0.5 rounded-full text-[11px] bg-black/20 text-white">
            {myFoundItems.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('claims_received')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'claims_received'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Incoming Claims (To Review)</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[11px] ${
            claims.received.length > 0 ? 'bg-amber-400 text-slate-900 font-extrabold' : 'bg-slate-200 text-slate-700'
          }`}>
            {claims.received.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('claims_submitted')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'claims_submitted'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Claims I Submitted</span>
          <span className="px-1.5 py-0.5 rounded-full text-[11px] bg-slate-200 text-slate-700">
            {claims.submitted.length}
          </span>
        </button>
      </div>

      {/* TAB 1 & 2: LOST OR FOUND ITEMS TABLE/CARDS */}
      {(activeTab === 'lost' || activeTab === 'found') && (
        <div>
          {(() => {
            const list = activeTab === 'lost' ? myLostItems : myFoundItems;

            if (list.length === 0) {
              return (
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">
                    No {activeTab} reports yet
                  </h3>
                  <p className="text-xs text-slate-500">
                    You have not reported any {activeTab} items under your account.
                  </p>
                  <button
                    onClick={() => onOpenReportModal(activeTab === 'lost' ? 'LOST' : 'FOUND')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold text-white ${
                      activeTab === 'lost' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    Report {activeTab === 'lost' ? 'Lost' : 'Found'} Item
                  </button>
                </div>
              );
            }

            return (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="px-5 py-3.5">Report ID</th>
                        <th className="px-5 py-3.5">Item Name</th>
                        <th className="px-5 py-3.5">Category</th>
                        <th className="px-5 py-3.5">Date & Location</th>
                        <th className="px-5 py-3.5">Status</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {list.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-5 py-4 font-mono font-bold text-slate-700">
                            #{item.reportId}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.imageUrl}
                                alt={item.itemName}
                                className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                              />
                              <div>
                                <span className="font-bold text-slate-900 block text-sm line-clamp-1">
                                  {item.itemName}
                                </span>
                                <span className="text-[11px] text-slate-400">
                                  Brand: {item.brand || 'N/A'} • Color: {item.color || 'N/A'}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 font-semibold text-slate-700">
                              {item.category}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-slate-600">
                            <div className="font-medium text-slate-800">{item.location}</div>
                            <div className="text-[11px] text-slate-400">{item.date} ({item.time})</div>
                          </td>
                          <td className="px-5 py-4">
                            {item.status === 'RESOLVED' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                                <Check className="w-3 h-3 text-blue-600" />
                                RESOLVED
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                                ACTIVE / OPEN
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => onViewItemDetails(item)}
                                className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onEditItem(item)}
                                className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                title="Edit Report"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item)}
                                disabled={actionLoading === item.id}
                                className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Delete Report"
                              >
                                {actionLoading === item.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 3: INCOMING CLAIMS (RECEIVED ON USER'S FOUND ITEMS) */}
      {activeTab === 'claims_received' && (
        <div className="space-y-4">
          {claims.received.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center space-y-2">
              <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">
                No incoming claims yet
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                When fellow students believe a found item you reported belongs to them, their claim statements and proof details will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {claims.received.map((claim) => (
                <div
                  key={claim.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[11px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                        #{claim.itemReportId}
                      </span>
                      <h3 className="text-base font-extrabold text-slate-900 mt-1">
                        Claim on: {claim.itemTitle}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          claim.status === 'ACCEPTED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : claim.status === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {claim.status}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(claim.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Claimant Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl text-xs">
                    <div>
                      <span className="text-slate-400 block font-medium">Claimant Name</span>
                      <span className="font-bold text-slate-800">{claim.claimantName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">College Email</span>
                      <span className="font-mono text-slate-800">{claim.claimantEmail}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Phone Number</span>
                      <span className="text-slate-800">{claim.claimantPhone}</span>
                    </div>
                  </div>

                  {/* Statements & Proof */}
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="font-bold text-slate-700 block">Why they think it's theirs:</span>
                      <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                        {claim.reason}
                      </p>
                    </div>

                    {claim.additionalDetails && (
                      <div>
                        <span className="font-bold text-slate-700 block">Identifying Details Provided:</span>
                        <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                          {claim.additionalDetails}
                        </p>
                      </div>
                    )}

                    {claim.proofDetails && (
                      <div>
                        <span className="font-bold text-slate-700 block">Proof / Serial Number / Match Clue:</span>
                        <p className="text-slate-600 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100 font-mono">
                          {claim.proofDetails}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Accept / Reject Buttons if Pending */}
                  {claim.status === 'PENDING' && (
                    <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                      <button
                        onClick={() => handleRejectClaim(claim)}
                        disabled={actionLoading === claim.id}
                        className="px-3.5 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer"
                      >
                        Reject Claim
                      </button>
                      <button
                        onClick={() => handleAcceptClaim(claim)}
                        disabled={actionLoading === claim.id}
                        className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Accept Claim & Mark Resolved
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CLAIMS I SUBMITTED */}
      {activeTab === 'claims_submitted' && (
        <div className="space-y-4">
          {claims.submitted.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center space-y-2">
              <UserCheck className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">
                You have not submitted any claims
              </h3>
              <p className="text-xs text-slate-500">
                When you spot an item in Browse that you lost and submit a claim, track its approval status here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {claims.submitted.map((claim) => (
                <div
                  key={claim.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                        #{claim.itemReportId}
                      </span>
                      <h3 className="text-base font-extrabold text-slate-900 mt-1">
                        Claim on: {claim.itemTitle}
                      </h3>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        claim.status === 'ACCEPTED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : claim.status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {claim.status === 'ACCEPTED' ? '✓ ACCEPTED - CONTACT FINDER' : claim.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
                    <span className="font-bold text-slate-700 block mb-1">Your Claim Statement:</span>
                    <p>{claim.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
