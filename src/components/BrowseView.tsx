import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  X,
  PlusCircle,
  HelpCircle,
  CheckCircle2,
  Tag,
  MapPin,
  ArrowUpDown,
  RotateCcw
} from 'lucide-react';
import { Item, User } from '../types';
import { ItemCard } from './ItemCard';

interface BrowseViewProps {
  items: Item[];
  currentUser: User | null;
  onViewItemDetails: (item: Item) => void;
  onClaimItem: (item: Item) => void;
  onOpenReportModal: (type: 'LOST' | 'FOUND') => void;
}

const CATEGORIES = [
  'ALL',
  'Electronics',
  'ID Cards',
  'Books',
  'Bags',
  'Wallets',
  'Keys',
  'Accessories',
  'Clothing',
  'Stationery',
  'Other'
];

const LOCATIONS = [
  'ALL',
  'Central Library',
  'Main Canteen',
  'Computer Centre',
  'Lecture Hall Complex',
  'Science Block',
  'Sports Complex',
  'Two-Wheeler Student Parking',
  'Auditorium',
  'Hostel'
];

export const BrowseView: React.FC<BrowseViewProps> = ({
  items,
  currentUser,
  onViewItemDetails,
  onClaimItem,
  onOpenReportModal
}) => {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<'ALL' | 'LOST' | 'FOUND'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedLocation, setSelectedLocation] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'OPEN' | 'RESOLVED'>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  // Filter items in memory or fetched
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesName = item.itemName.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesLoc = item.location.toLowerCase().includes(q);
        const matchesBrand = item.brand.toLowerCase().includes(q);
        const matchesReportId = item.reportId.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesLoc && !matchesBrand && !matchesReportId) {
          return false;
        }
      }

      // Type
      if (selectedType !== 'ALL' && item.type !== selectedType) {
        return false;
      }

      // Category
      if (selectedCategory !== 'ALL' && item.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }

      // Location
      if (selectedLocation !== 'ALL' && !item.location.toLowerCase().includes(selectedLocation.toLowerCase())) {
        return false;
      }

      // Status
      if (selectedStatus !== 'ALL' && item.status !== selectedStatus) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
    });
  }, [items, search, selectedType, selectedCategory, selectedLocation, selectedStatus, sortBy]);

  const resetFilters = () => {
    setSearch('');
    setSelectedType('ALL');
    setSelectedCategory('ALL');
    setSelectedLocation('ALL');
    setSelectedStatus('ALL');
    setSortBy('newest');
  };

  const hasActiveFilters =
    search ||
    selectedType !== 'ALL' ||
    selectedCategory !== 'ALL' ||
    selectedLocation !== 'ALL' ||
    selectedStatus !== 'ALL';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Page Title & Intro */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Browse Campus Items
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Search active reports across all campus departments, hostels, and academic halls.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenReportModal('LOST')}
            className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <HelpCircle className="w-4 h-4" />
            Report Lost
          </button>
          <button
            onClick={() => onOpenReportModal('FOUND')}
            className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4" />
            Report Found
          </button>
        </div>
      </div>

      {/* Search & Filter Controls Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        
        {/* Top search input */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by item name, description, brand (e.g. Casio, AirPods), location, or Report ID..."
            className="w-full pl-12 pr-10 py-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/70 focus:bg-white"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills / Selects */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-1 text-xs">
          
          {/* Type Filter */}
          <div>
            <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1">
              Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="w-full py-2 px-3 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Types (Lost & Found)</option>
              <option value="LOST">Lost Items Only</option>
              <option value="FOUND">Found Items Only</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-2 px-3 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c === 'ALL' ? 'All Categories' : c}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1">
              Campus Location
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full py-2 px-3 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {LOCATIONS.map((l) => (
                <option key={l} value={l}>
                  {l === 'ALL' ? 'All Campus Locations' : l}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="w-full py-2 px-3 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Active / Open Only</option>
              <option value="RESOLVED">Resolved / Returned</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full py-2 px-3 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

        </div>

        {/* Results count & reset filters */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div>
            Showing <strong className="text-slate-800">{filteredItems.length}</strong> {filteredItems.length === 1 ? 'item' : 'items'}
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}
        </div>

      </div>

      {/* Items Cards Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">
            No matching items found
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Try adjusting your search query, selecting different campus areas, or clear filters.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={resetFilters}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
              Clear All Filters
            </button>
            <button
              onClick={() => onOpenReportModal('LOST')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-white hover:bg-amber-600"
            >
              Report Lost Item
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onViewDetails={onViewItemDetails}
              onClaim={onClaimItem}
              isOwner={currentUser?.id === item.userId}
            />
          ))}
        </div>
      )}

    </div>
  );
};
