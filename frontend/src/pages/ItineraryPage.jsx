import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  Sparkles, 
  MapPin, 
  Clock, 
  IndianRupee, 
  Star, 
  Calendar, 
  BookmarkCheck, 
  ArrowRight, 
  ArrowLeft,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Download,
  Info,
  Car,
  Utensils,
  Hotel,
  Ticket,
  Sun,
  CloudSun,
  Sunset
} from 'lucide-react';
import { travelApi } from '../services/api';
import { useTrip } from '../context/TripContext';

// High quality curated images by category
const CATEGORY_IMAGES = {
  temple: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80',
  gurudwara: 'https://images.unsplash.com/photo-1596405344148-2d0df5f2998d?auto=format&fit=crop&w=600&q=80',
  fort: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80',
  palace: 'https://images.unsplash.com/photo-1600100397608-f463991216d5?auto=format&fit=crop&w=600&q=80',
  beach: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
  'national park': 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80',
  lake: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
  waterfall: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=600&q=80',
  museum: 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?auto=format&fit=crop&w=600&q=80',
  monument: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=600&q=80',
  default: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&w=600&q=80',
};

const getDestinationImage = (type) => {
  const t = (type || '').toLowerCase();
  for (const [key, url] of Object.entries(CATEGORY_IMAGES)) {
    if (t.includes(key)) return url;
  }
  return CATEGORY_IMAGES.default;
};

export default function ItineraryPage() {
  const { user, userPreferences, saveTripToDatabase } = useTrip();
  const navigate = useNavigate();
  const location = useLocation();

  const [itinerary, setItinerary] = useState(location.state?.itinerary || null);
  const [loading, setLoading] = useState(!itinerary);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function fetchOrGenerateItinerary() {
      if (itinerary) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch user preferences first
        let prefs = userPreferences;
        if (!prefs) {
          try {
            prefs = await travelApi.getPreferences();
          } catch (e) {
            // No preferences yet, redirect to preferences
            navigate('/preferences');
            return;
          }
        }

        const generated = await travelApi.generateItinerary(prefs);
        setItinerary(generated);
      } catch (err) {
        console.error('Failed to generate itinerary:', err);
        setError('Could not generate itinerary. Please verify your preferences and connection.');
      } finally {
        setLoading(false);
      }
    }

    fetchOrGenerateItinerary();
  }, [itinerary, userPreferences, navigate]);

  const handleSaveToDatabase = async () => {
    if (!itinerary) return;
    try {
      setIsSaving(true);
      await saveTripToDatabase(itinerary.title, itinerary);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert('Failed to save trip to database.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportText = () => {
    if (!itinerary) return;
    const fin = itinerary.financials;
    const lines = [
      `TRAVEL MATE - DAY-WISE TOUR ITINERARY`,
      `Title: ${itinerary.title}`,
      `Starting Location: ${itinerary.starting_city}, ${itinerary.starting_state}`,
      `Duration: ${itinerary.duration_days} Days | Group: ${itinerary.companion_type} | Season: ${itinerary.travel_month_or_season}`,
      `----------------------------------------------------------------`,
      `FINANCIAL ALLOCATION SUMMARY (ESTIMATED):`,
      `- Total Budget: Rs. ${fin.total_budget.toLocaleString()}`,
      `- Estimated Accommodation: Rs. ${fin.estimated_accommodation.toLocaleString()}`,
      `- Estimated Food: Rs. ${fin.estimated_food.toLocaleString()}`,
      `- Estimated Transit: Rs. ${fin.estimated_transport.toLocaleString()}`,
      `- Attraction Entrance Fees: Rs. ${fin.estimated_entrance_fees.toLocaleString()}`,
      `- Total Projected Trip Cost: Rs. ${fin.total_estimated_cost.toLocaleString()}`,
      `- Remaining Budget: Rs. ${fin.remaining_budget.toLocaleString()}`,
      `- Note: ${fin.disclaimer}`,
      `----------------------------------------------------------------`,
      `DAY-BY-DAY ITINERARY:`,
    ];

    itinerary.days.forEach((day) => {
      lines.push(`\n[DAY ${day.day}] ${day.title}`);
      if (day.morning?.destination) {
        const d = day.morning.destination;
        lines.push(`  * MORNING: ${d.name} (${d.city}, ${d.state})`);
        lines.push(`    - Type: ${d.type} | Rating: ${d.rating}★ (${d.total_reviews} reviews) | Fee: Rs.${d.entrance_fee_inr}`);
        lines.push(`    - Duration: ${d.time_needed_hours} hrs | Est. Transit: Rs.${day.morning.estimated_travel_cost}`);
      }
      if (day.afternoon?.destination) {
        const d = day.afternoon.destination;
        lines.push(`  * AFTERNOON: ${d.name} (${d.city}, ${d.state})`);
        lines.push(`    - Type: ${d.type} | Rating: ${d.rating}★ (${d.total_reviews} reviews) | Fee: Rs.${d.entrance_fee_inr}`);
        lines.push(`    - Duration: ${d.time_needed_hours} hrs | Est. Transit: Rs.${day.afternoon.estimated_travel_cost}`);
      }
      if (day.evening?.destination) {
        const d = day.evening.destination;
        lines.push(`  * EVENING: ${d.name} (${d.city}, ${d.state})`);
        lines.push(`    - Type: ${d.type} | Rating: ${d.rating}★ (${d.total_reviews} reviews) | Fee: Rs.${d.entrance_fee_inr}`);
        lines.push(`    - Duration: ${d.time_needed_hours} hrs | Est. Transit: Rs.${day.evening.estimated_travel_cost}`);
      }
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${itinerary.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <Sparkles className="w-10 h-10 text-sky-600 animate-spin mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Generating Your Personalized Itinerary...</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Filtering destinations by your interests, matching your budget, and ranking candidates via Bayesian Popularity.
        </p>
      </div>
    );
  }

  if (error || !itinerary) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Failed to Load Itinerary</h2>
        <p className="text-xs text-slate-500">{error || 'Unable to retrieve itinerary data.'}</p>
        <Link
          to="/preferences"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-semibold"
        >
          <span>Configure Preferences</span>
        </Link>
      </div>
    );
  }

  const fin = itinerary.financials;

  const renderSlotCard = (slotData, icon, title, bgClass) => {
    if (!slotData || !slotData.destination) return null;
    const dest = slotData.destination;
    const imgUrl = getDestinationImage(dest.type);

    return (
      <div className={`p-4 rounded-2xl border ${bgClass} flex flex-col justify-between space-y-3`}>
        {/* Slot Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            {icon}
            <span>{title}</span>
          </div>
          <span className="text-[11px] font-semibold text-sky-700 bg-sky-100/70 px-2 py-0.5 rounded-full">
            Score: {dest.bayesian_weighted_rating?.toFixed(3)}
          </span>
        </div>

        {/* Image & Main Info */}
        <div className="flex gap-3">
          <img
            src={imgUrl}
            alt={dest.name}
            className="w-20 h-20 rounded-xl object-cover shrink-0 shadow-xs border border-white/60"
            loading="lazy"
          />
          <div className="min-w-0 flex-1">
            <Link
              to={`/destinations/${dest.id}`}
              className="font-bold text-xs text-slate-900 hover:text-sky-600 transition-colors line-clamp-1"
            >
              {dest.name}
            </Link>
            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
              <MapPin className="w-3 h-3 text-sky-500 shrink-0" />
              <span>{dest.city}, {dest.state}</span>
            </p>
            <div className="flex items-center gap-2 mt-1.5 text-[11px]">
              <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-700 font-medium">
                {dest.type}
              </span>
              <span className="flex items-center gap-0.5 text-amber-700 font-bold">
                <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                {dest.rating.toFixed(1)}
              </span>
              <span className="text-slate-400">({dest.reviews_lakhs}L)</span>
            </div>
          </div>
        </div>

        {/* Detailed Metrics Strip */}
        <div className="pt-2 border-t border-slate-200/60 grid grid-cols-3 gap-1 text-[11px] text-slate-600">
          <div>
            <span className="text-[10px] text-slate-400 block">Entrance Fee</span>
            <span className="font-bold text-slate-800">
              {dest.entrance_fee_inr === 0 ? 'Free' : `₹${dest.entrance_fee_inr}`}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Est. Transit</span>
            <span className="font-semibold text-slate-800">
              ₹{slotData.estimated_travel_cost}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Duration</span>
            <span className="font-semibold text-slate-800">
              {dest.time_needed_hours} hrs
            </span>
          </div>
        </div>

        {slotData.notes && (
          <p className="text-[10px] text-slate-500 italic bg-white/60 p-1.5 rounded-lg border border-slate-100">
            {slotData.notes}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Top Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/preferences"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Edit Travel Preferences</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveToDatabase}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
          >
            <BookmarkCheck className="w-4 h-4" />
            <span>{savedSuccess ? 'Saved to My Trips!' : 'Save Itinerary in Database'}</span>
          </button>

          <button
            onClick={handleExportText}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Text</span>
          </button>
        </div>
      </div>

      {/* Itinerary Header Card */}
      <div className="bg-gradient-to-r from-sky-900 via-slate-900 to-teal-950 text-white rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold border border-sky-500/30 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bayesian Popularity Itinerary</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-medium border border-white/10">
              {itinerary.duration_days} Days Plan
            </span>
            <span className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-medium border border-white/10">
              {itinerary.companion_type} Trip
            </span>
            <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-medium border border-teal-500/30">
              {itinerary.travel_month_or_season}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {itinerary.title}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Curated using genuine attractions in and around <strong>{itinerary.starting_state}</strong>, scheduled into optimal morning, afternoon, and evening slots based on verified visitor metrics.
          </p>
        </div>
      </div>

      {/* Financial & Budget Allocation Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-emerald-600" />
              <span>Trip Financials & Budget Allocation</span>
            </h2>
            <p className="text-xs text-slate-500">
              Estimated expenses tailored for a {itinerary.companion_type.toLowerCase()} group over {itinerary.duration_days} days.
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            fin.is_budget_sufficient
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}>
            {fin.is_budget_sufficient ? '✓ Budget Sufficient' : '⚠ Budget Advisory'}
          </span>
        </div>

        {/* 4 Cost Pillars + Total */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
              <Hotel className="w-3.5 h-3.5 text-sky-600" />
              <span>Accommodation</span>
            </div>
            <p className="text-base font-bold text-slate-900">₹{fin.estimated_accommodation.toLocaleString()}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Estimated stay</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
              <Utensils className="w-3.5 h-3.5 text-amber-600" />
              <span>Food & Dining</span>
            </div>
            <p className="text-base font-bold text-slate-900">₹{fin.estimated_food.toLocaleString()}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Estimated meals</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
              <Car className="w-3.5 h-3.5 text-teal-600" />
              <span>Local Transit</span>
            </div>
            <p className="text-base font-bold text-slate-900">₹{fin.estimated_transport.toLocaleString()}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Taxis / autos</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
              <Ticket className="w-3.5 h-3.5 text-purple-600" />
              <span>Entrance Fees</span>
            </div>
            <p className="text-base font-bold text-slate-900">₹{fin.estimated_entrance_fees.toLocaleString()}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Dataset verified</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-1.5 text-sky-800 text-xs mb-1 font-bold">
              <IndianRupee className="w-3.5 h-3.5 text-sky-600" />
              <span>Total Estimated</span>
            </div>
            <p className="text-lg font-black text-sky-900">₹{fin.total_estimated_cost.toLocaleString()}</p>
            <p className="text-[10px] text-sky-600 mt-0.5">Budget: ₹{fin.total_budget.toLocaleString()}</p>
          </div>
        </div>

        {/* Budget Advisory Box */}
        <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${
          fin.is_budget_sufficient
            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
            : 'bg-amber-50/80 border-amber-200 text-amber-900'
        }`}>
          <div className="flex items-start gap-2.5">
            {fin.is_budget_sufficient ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-semibold">{fin.budget_message}</p>
              <p className="text-[11px] text-slate-500 mt-1">{fin.disclaimer}</p>
            </div>
          </div>
        </div>

      </div>

      {/* Day-Wise Schedules */}
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-slate-900">
          Day-Wise Detailed Route
        </h2>

        {itinerary.days.map((dayPlan) => (
          <div
            key={dayPlan.day}
            className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6"
          >
            {/* Day Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-sky-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                  D{dayPlan.day}
                </span>
                <div>
                  <h3 className="font-bold text-base text-slate-900">{dayPlan.title}</h3>
                  <p className="text-xs text-slate-400">3 Curated Popularity-Ranked Stops</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                <span>Day Fees: ₹{dayPlan.day_entrance_fee}</span>
                <span>•</span>
                <span>Est. Day Transit: ₹{dayPlan.day_transport_cost}</span>
              </div>
            </div>

            {/* 3 Day Slots: Morning, Afternoon, Evening */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderSlotCard(
                dayPlan.morning,
                <Sun className="w-4 h-4 text-amber-500" />,
                'Morning Destination',
                'bg-amber-50/40 border-amber-100'
              )}
              {renderSlotCard(
                dayPlan.afternoon,
                <CloudSun className="w-4 h-4 text-sky-500" />,
                'Afternoon Destination',
                'bg-sky-50/40 border-sky-100'
              )}
              {renderSlotCard(
                dayPlan.evening,
                <Sunset className="w-4 h-4 text-purple-500" />,
                'Evening Destination',
                'bg-purple-50/40 border-purple-100'
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

