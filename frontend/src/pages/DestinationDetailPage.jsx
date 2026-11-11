import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Star, 
  MapPin, 
  Clock, 
  IndianRupee, 
  Calendar, 
  Plane, 
  Camera, 
  AlertCircle, 
  ArrowLeft, 
  Plus, 
  Check, 
  Sparkles, 
  Share2, 
  ShieldCheck, 
  Building,
  Info
} from 'lucide-react';
import { travelApi } from '../services/api';
import { useTrip } from '../context/TripContext';

export default function DestinationDetailPage() {
  const { id } = useParams();
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const { isInTrip, addToTrip, removeFromTrip } = useTrip();

  useEffect(() => {
    async function loadDestination() {
      try {
        setLoading(true);
        setError(null);
        const data = await travelApi.getDestinationById(id);
        setDestination(data);
      } catch (err) {
        console.error('Failed to load destination details:', err);
        setError('Destination not found or network error occurred.');
      } finally {
        setLoading(false);
      }
    }
    loadDestination();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20">
        <div className="h-8 w-32 bg-slate-200 rounded-md animate-pulse mb-8" />
        <div className="h-72 bg-slate-100 rounded-3xl animate-pulse mb-8" />
        <div className="h-40 bg-slate-100 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-800">Destination Not Found</h2>
        <p className="text-sm text-slate-500 mt-2">{error || 'Unable to retrieve destination data.'}</p>
        <Link
          to="/explore"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 text-white rounded-xl text-xs font-semibold hover:bg-sky-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Explore</span>
        </Link>
      </div>
    );
  }

  const inTrip = isInTrip(destination.id);

  const formatYear = (year) => {
    if (!year) return 'Historical / Ancient';
    if (year < 0) return `${Math.abs(year)} BCE`;
    return `${year} CE`;
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Back Button & Share */}
      <div className="flex items-center justify-between">
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Destinations</span>
        </Link>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{copied ? 'Link Copied!' : 'Share'}</span>
        </button>
      </div>

      {/* Hero Header Card */}
      <div className="bg-gradient-to-br from-sky-900 via-slate-900 to-teal-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-bold border border-white/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>National Popularity Rank #{destination.popularity_rank}</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-semibold border border-white/20">
              {destination.type}
            </span>
            <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30">
              {destination.significance}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            {destination.name}
          </h1>

          <div className="flex items-center gap-2 text-slate-300 text-sm">
            <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
            <span>{destination.city}, {destination.state} ({destination.zone} Zone)</span>
          </div>

          {/* Quick Metrics Strip */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-white/10 max-w-2xl">
            <div>
              <p className="text-xs text-slate-400 font-medium">Google Rating</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-lg font-bold text-white">{destination.rating.toFixed(1)}</span>
                <span className="text-xs text-slate-400">/ 5.0</span>
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-400 font-medium">Total Reviews</p>
              <p className="text-lg font-bold text-white mt-0.5">
                {destination.total_reviews.toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-400">({destination.reviews_lakhs} Lakhs)</p>
            </div>

            <div>
              <p className="text-xs text-slate-400 font-medium">Bayesian Score (WR)</p>
              <p className="text-lg font-bold text-emerald-400 mt-0.5">
                {destination.bayesian_weighted_rating.toFixed(4)}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400 font-medium">Entrance Fee</p>
              <p className="text-lg font-bold text-white mt-0.5">
                {destination.entrance_fee_inr === 0 ? 'Free Entry' : `₹${destination.entrance_fee_inr}`}
              </p>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-4">
            <button
              onClick={() => inTrip ? removeFromTrip(destination.id) : addToTrip(destination)}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold transition-all shadow-md ${
                inTrip
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
                  : 'bg-sky-500 hover:bg-sky-600 text-white shadow-sky-500/30'
              }`}
            >
              {inTrip ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Added to Trip Planner</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Add to Trip Planner</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Dataset Specification Grid */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Info className="w-5 h-5 text-sky-600" />
          <span>Attraction Specifications & Dataset Attributes</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
          
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
            <Clock className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold uppercase text-slate-500">Visit Duration</p>
              <p className="font-semibold text-slate-900 mt-0.5">
                {destination.time_needed_hours} Hours Needed
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
            <Calendar className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold uppercase text-slate-500">Best Time to Visit</p>
              <p className="font-semibold text-slate-900 mt-0.5">
                {destination.best_time_to_visit}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
            <Building className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold uppercase text-slate-500">Establishment Era</p>
              <p className="font-semibold text-slate-900 mt-0.5">
                {formatYear(destination.establishment_year)}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
            <Plane className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold uppercase text-slate-500">Airport within 50km</p>
              <p className="font-semibold text-slate-900 mt-0.5">
                {destination.airport_within_50km ? 'Yes (Accessible nearby airport)' : 'No (>50 km from airport)'}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
            <Camera className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold uppercase text-slate-500">DSLR Photography</p>
              <p className="font-semibold text-slate-900 mt-0.5">
                {destination.dslr_allowed ? 'Allowed' : 'Not Allowed / Restricted'}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
            <Clock className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold uppercase text-slate-500">Weekly Closing</p>
              <p className="font-semibold text-slate-900 mt-0.5">
                {destination.weekly_off === 'None' ? 'Open All 7 Days' : `Closed on ${destination.weekly_off}`}
              </p>
            </div>
          </div>

        </div>

        {/* Dataset Verification Notice */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Source: Indian Tourist Attractions Analysis</span>
          <span className="font-mono text-[11px]">Attraction ID: #{destination.id}</span>
        </div>
      </div>

    </div>
  );
}

