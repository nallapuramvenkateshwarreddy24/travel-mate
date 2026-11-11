import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Star, 
  MapPin, 
  Clock, 
  IndianRupee, 
  Plus, 
  Check, 
  Sparkles, 
  Compass,
  Camera,
  Plane
} from 'lucide-react';
import { useTrip } from '../../context/TripContext';

// Color themes based on category type
const getCategoryTheme = (type) => {
  const t = (type || '').toLowerCase();
  if (t.includes('temple') || t.includes('gurudwara') || t.includes('shrine') || t.includes('church') || t.includes('mosque')) {
    return { bg: 'from-amber-500/10 to-orange-500/10', badge: 'bg-amber-100 text-amber-800 border-amber-200' };
  }
  if (t.includes('fort') || t.includes('palace') || t.includes('monument') || t.includes('archaeological')) {
    return { bg: 'from-rose-500/10 to-orange-500/10', badge: 'bg-rose-100 text-rose-800 border-rose-200' };
  }
  if (t.includes('beach') || t.includes('lake') || t.includes('waterfall') || t.includes('river')) {
    return { bg: 'from-sky-500/10 to-teal-500/10', badge: 'bg-sky-100 text-sky-800 border-sky-200' };
  }
  if (t.includes('national park') || t.includes('sanctuary') || t.includes('garden') || t.includes('valley')) {
    return { bg: 'from-emerald-500/10 to-green-500/10', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
  }
  return { bg: 'from-slate-500/10 to-sky-500/10', badge: 'bg-slate-100 text-slate-800 border-slate-200' };
};

export default function DestinationCard({ destination }) {
  const { isInTrip, addToTrip, removeFromTrip } = useTrip();

  if (!destination) return null;

  const inTrip = isInTrip(destination.id);
  const theme = getCategoryTheme(destination.type);

  const handleTripToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (inTrip) {
      removeFromTrip(destination.id);
    } else {
      addToTrip(destination);
    }
  };

  const formatReviews = (totalReviews, lakhs) => {
    if (totalReviews >= 100000) {
      return `${(totalReviews / 100000).toFixed(1)}L reviews`;
    }
    if (totalReviews >= 1000) {
      return `${(totalReviews / 1000).toFixed(0)}k reviews`;
    }
    return `${totalReviews} reviews`;
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-200 overflow-hidden">
      
      {/* Top Banner & Popularity Rank */}
      <div className={`relative h-36 bg-gradient-to-br ${theme.bg} p-4 flex flex-col justify-between overflow-hidden border-b border-slate-100`}>
        {/* Subtle decorative background circle */}
        <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-white/40 blur-xs pointer-events-none" />

        <div className="flex items-center justify-between z-10">
          {/* Popularity Rank Badge */}
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md shadow-xs text-xs font-bold text-slate-800 border border-slate-200/60">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Rank #{destination.popularity_rank}</span>
          </span>

          {/* Quick Add to Trip button */}
          <button
            onClick={handleTripToggle}
            className={`p-2 rounded-xl transition-all shadow-xs ${
              inTrip
                ? 'bg-sky-600 text-white shadow-sky-500/30'
                : 'bg-white/90 text-slate-700 hover:bg-sky-600 hover:text-white border border-slate-200/80'
            }`}
            title={inTrip ? 'Remove from trip' : 'Add to trip planner'}
          >
            {inTrip ? <Check className="w-4 h-4 stroke-[3]" /> : <Plus className="w-4 h-4 stroke-[2.5]" />}
          </button>
        </div>

        {/* Category & Best Time Chips */}
        <div className="flex flex-wrap items-center gap-1.5 z-10">
          <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${theme.badge}`}>
            {destination.type}
          </span>
          {destination.best_time_to_visit && (
            <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-white/80 text-slate-600 border border-slate-200/60">
              🕒 {destination.best_time_to_visit}
            </span>
          )}
        </div>
      </div>

      {/* Main Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Destination Name */}
          <Link to={`/destinations/${destination.id}`}>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-1">
              {destination.name}
            </h3>
          </Link>

          {/* Location */}
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-sky-500 shrink-0" />
            <span className="truncate">{destination.city}, {destination.state}</span>
          </div>

          {/* Metrics: Rating, Reviews, Bayesian Score */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs">
            {/* Google Rating */}
            <div className="flex items-center gap-1 text-slate-700">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800 font-bold border border-amber-200/70">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                {destination.rating.toFixed(1)}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                ({formatReviews(destination.total_reviews, destination.reviews_lakhs)})
              </span>
            </div>

            {/* Bayesian Score */}
            <div className="text-right" title="Bayesian Weighted Rating (Popularity Metric)">
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Popularity</span>
              <span className="font-extrabold text-sky-700 text-xs">
                {destination.bayesian_weighted_rating.toFixed(3)}
              </span>
            </div>
          </div>

          {/* Amenities & Attributes Bar */}
          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400 shrink-0" />
              <span>{destination.time_needed_hours} hrs needed</span>
            </div>
            <div className="flex items-center gap-1">
              <IndianRupee className="w-3 h-3 text-slate-400 shrink-0" />
              <span>{destination.entrance_fee_inr === 0 ? 'Free Entry' : `₹${destination.entrance_fee_inr}`}</span>
            </div>
          </div>
        </div>

        {/* Action Link */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
          <Link
            to={`/destinations/${destination.id}`}
            className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
          >
            <span>View Details</span>
            <span>→</span>
          </Link>

          <span className="text-[10px] font-medium text-slate-400">
            {destination.weekly_off === 'None' ? 'Open All Days' : `Closed ${destination.weekly_off}`}
          </span>
        </div>
      </div>

    </div>
  );
}

