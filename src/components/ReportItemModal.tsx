import React, { useState } from 'react';
import {
  X,
  Upload,
  Calendar,
  Clock,
  MapPin,
  Tag,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Image as ImageIcon,
  Loader2,
  Sparkles
} from 'lucide-react';
import { User, Item } from '../types';
import { api } from '../services/api';

interface ReportItemModalProps {
  type: 'LOST' | 'FOUND';
  currentUser: User | null;
  onClose: () => void;
  onSuccess: (newItem: Item) => void;
  onOpenAuth: () => void;
  editItem?: Item | null;
}

const CATEGORIES = [
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

const CAMPUS_LOCATIONS = [
  'Central Library (1st & 2nd Floor)',
  'Main Canteen / Food Court',
  'Computer Centre (Lab 4B / Lab 3)',
  'Lecture Hall Complex (LH-1 to LH-6)',
  'Science Block & Physics Labs',
  'Sports Complex / Badminton Court',
  'Two-Wheeler Student Parking Lot B',
  'Auditorium & Seminar Hall',
  'Campus Security Gate #1 / #2',
  'Hostel Corridor / Common Room',
  'Other Campus Location'
];

// Sample images by category for quick one-click preview if student does not have a photo
const SAMPLE_CATEGORY_IMAGES: Record<string, string> = {
  'Electronics': 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80',
  'ID Cards': 'https://images.unsplash.com/photo-1589330694653-dad6ef0100f8?w=600&auto=format&fit=crop&q=80',
  'Books': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
  'Bags': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
  'Wallets': 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80',
  'Keys': 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&auto=format&fit=crop&q=80',
  'Accessories': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80',
  'Clothing': 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80',
  'Stationery': 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=600&auto=format&fit=crop&q=80',
  'Other': 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80'
};

export const ReportItemModal: React.FC<ReportItemModalProps> = ({
  type,
  currentUser,
  onClose,
  onSuccess,
  onOpenAuth,
  editItem
}) => {
  const isLost = type === 'LOST';

  const [itemName, setItemName] = useState(editItem?.itemName || '');
  const [category, setCategory] = useState(editItem?.category || 'Electronics');
  const [description, setDescription] = useState(editItem?.description || '');
  const [date, setDate] = useState(editItem?.date || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(editItem?.time || '12:00 PM');
  const [location, setLocation] = useState(editItem?.location || CAMPUS_LOCATIONS[0]);
  const [customLocation, setCustomLocation] = useState('');
  const [color, setColor] = useState(editItem?.color || '');
  const [brand, setBrand] = useState(editItem?.brand || '');
  const [identifyingDetails, setIdentifyingDetails] = useState(editItem?.identifyingDetails || '');
  const [contactPreference, setContactPreference] = useState<'EMAIL' | 'PHONE' | 'PLATFORM'>(
    editItem?.contactPreference || 'PLATFORM'
  );
  const [imageUrl, setImageUrl] = useState(editItem?.imageUrl || SAMPLE_CATEGORY_IMAGES['Electronics']);
  const [status, setStatus] = useState<'OPEN' | 'RESOLVED'>(
    editItem ? (editItem.status as 'OPEN' | 'RESOLVED') : 'OPEN'
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            Sign In to Report
          </h3>
          <p className="text-sm text-slate-600">
            College student/staff verification is required to report lost or found items on campus.
          </p>
          <div className="flex gap-2 justify-center pt-2">
            <button
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="px-5 py-2.5 rounded-xl font-bold text-sm bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
            >
              Sign In / Register
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl font-semibold text-sm bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle local file upload (converts to base64 for persistent storage in MySQL/db)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setError('Image file is too large. Please select an image under 8MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    // If using default sample image, update to match category
    if (!editItem && SAMPLE_CATEGORY_IMAGES[cat]) {
      setImageUrl(SAMPLE_CATEGORY_IMAGES[cat]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || !description.trim() || !date) {
      setError('Please fill all required fields.');
      return;
    }

    const finalLocation = location === 'Other Campus Location' && customLocation.trim()
      ? customLocation.trim()
      : location;

    try {
      setLoading(true);
      setError(null);

      if (editItem) {
        const res = await api.updateItem(editItem.id, {
          itemName: itemName.trim(),
          category,
          description: description.trim(),
          date,
          time: time.trim(),
          location: finalLocation,
          color: color.trim(),
          brand: brand.trim(),
          identifyingDetails: identifyingDetails.trim(),
          contactPreference,
          imageUrl,
          status
        });
        onSuccess(res.item);
      } else {
        const res = await api.createItem({
          itemName: itemName.trim(),
          type,
          category,
          description: description.trim(),
          date,
          time: time.trim(),
          location: finalLocation,
          color: color.trim(),
          brand: brand.trim(),
          identifyingDetails: identifyingDetails.trim(),
          contactPreference,
          imageUrl,
          status: 'OPEN'
        });
        onSuccess(res.item);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit report. Please check details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="relative bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b border-slate-100 ${
            isLost ? 'bg-amber-50/80' : 'bg-emerald-50/80'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-white ${
                isLost ? 'bg-amber-600' : 'bg-emerald-600'
              }`}
            >
              {isLost ? <HelpCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                {editItem ? `Edit Report #${editItem.reportId}` : `Report ${isLost ? 'Lost' : 'Found'} Item`}
              </h3>
              <p className="text-xs text-slate-500">
                {isLost
                  ? 'Provide detailed clues so campus finders can identify and return your property.'
                  : 'Report an item you located on campus to reconnect with the verified owner.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 flex-1">
          
          {/* Supabase backend indicator pill */}
          <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900">
            <span className="flex items-center gap-1.5 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Connected to Supabase Project: <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-emerald-300">nldzgkhjrhztwipecdnb</code>
            </span>
            <span className="text-emerald-700 font-medium hidden sm:inline">
              Auto-syncs on submission
            </span>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Item Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Item Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="e.g. Casio Scientific Calculator fx-991EX, Blue Wildcraft Backpack..."
                className="w-full text-sm rounded-xl border border-slate-300 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full text-sm rounded-xl border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe where it was kept, visible condition, what is inside, key landmarks..."
              className="w-full text-sm rounded-xl border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Date {isLost ? 'Lost' : 'Found'} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-sm rounded-xl border border-slate-300 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Approximate Time
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g. 11:30 AM, During Afternoon Break"
                className="w-full text-sm rounded-xl border border-slate-300 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Campus Location <span className="text-rose-500">*</span>
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full text-sm rounded-xl border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {CAMPUS_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>

            {location === 'Other Campus Location' && (
              <input
                type="text"
                placeholder="Specify exact building / room / hallway..."
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                className="mt-2 w-full text-sm rounded-xl border border-slate-300 px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>

          {/* Color & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Color
              </label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g. Matte Black, Navy Blue, Silver"
                className="w-full text-sm rounded-xl border border-slate-300 px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Brand / Make
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Apple, Dell, Casio, Wildcraft, Samsonite"
                className="w-full text-sm rounded-xl border border-slate-300 px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Identifying Details (Crucial for verification) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Identifying Details / Secret Marks (For Match Verification)
            </label>
            <input
              type="text"
              value={identifyingDetails}
              onChange={(e) => setIdentifyingDetails(e.target.value)}
              placeholder="e.g. Initials scratched on battery cover, specific sticker, keychain, password hint..."
              className="w-full text-sm rounded-xl border border-slate-300 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Claimants will be required to describe or prove these details before receiving the item.
            </p>
          </div>

          {/* Contact Preference & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Contact Preference
              </label>
              <select
                value={contactPreference}
                onChange={(e) => setContactPreference(e.target.value as any)}
                className="w-full text-sm rounded-xl border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="PLATFORM">Platform Secure Match (Protects Phone/Email)</option>
                <option value="EMAIL">Show College Email ({currentUser.collegeEmail})</option>
                <option value="PHONE">Show Phone Number ({currentUser.phone})</option>
              </select>
            </div>

            {editItem && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Report Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full text-sm rounded-xl border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-bold"
                >
                  <option value="OPEN">OPEN / Active</option>
                  <option value="RESOLVED">RESOLVED / Returned</option>
                </select>
              </div>
            )}
          </div>

          {/* Photo Upload & Preview */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Item Photo
            </label>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              {/* Thumbnail preview */}
              <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-inner">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 space-y-2">
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors shadow-2xs">
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span>Upload Photo from Device</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <div>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Or paste direct image URL (https://...)"
                    className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Tip: A clear photograph increases campus identification speed by 80%.
                </p>
              </div>
            </div>
          </div>

        </form>

        {/* Modal Footer */}
        <div className="p-4 sm:px-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-200 border border-slate-300 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 ${
              isLost
                ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving to MySQL...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                {editItem ? 'Save Changes' : `Submit ${type} Report`}
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
