import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  MapPin, 
  Sparkles, 
  Calendar, 
  Clock, 
  IndianRupee, 
  BookmarkCheck, 
  RotateCcw, 
  Edit3, 
  LogOut, 
  ArrowRight,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Compass,
  Star,
  Layers,
  Map
} from 'lucide-react';
import { travelApi } from '../services/api';
import { useTrip } from '../context/TripContext';
import DestinationCard from '../components/destinations/DestinationCard';

export default function UserDashboardPage() {
  const { 
    user, 
    userPreferences, 
    savedTrips, 
    loadingTrips, 
    deleteTripFromDatabase, 
    logout 
  } = useTrip();

  const navigate = useNavigate();

  const [itinerary, setItinerary] = useState(null);
  const [loadingItinerary, setLoadingItinerary] = useState(false);
  const [preferences, setPreferences] = useState(userPreferences);
  const [loadingPrefs, setLoadingPrefs] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  // Load preferences and initial itinerary on mount
  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoadingPrefs(true);
        let prefs = userPreferences;
        if (!prefs) {
          try {
            prefs = await travelApi.getPreferences();
            setPreferences(prefs);
          } catch (e) {
            // No preferences yet
            navigate('/preferences');
            return;
          }
        } else {
          setPreferences(prefs);
        }

        // Generate or load itinerary
        setLoadingItinerary(true);
        const plan = await travelApi.generateItinerary(prefs);
        setItinerary(plan);
      } catch (err) {
        console.error('Failed to load dashboard itinerary:', err);
      } finally {
        setLoadingPrefs(false);
        setLoadingItinerary(false);
      }
    }

    loadDashboard();
  }, [userPreferences, navigate]);

  const handleRegenerateItinerary = async () => {
    if (!preferences) return;
    try {
      setRegenerating(true);
      setStatusMsg(null);
      const plan = await travelApi.generateItinerary(preferences);
      setItinerary(plan);
      setStatusMsg('Itinerary refreshed with latest popularity metrics!');
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err) {
      console.error('Failed to regenerate itinerary:', err);
      setStatusMsg('Failed to refresh itinerary.');
    } finally {
      setRegenerating(false);
    }
  };

  const handleDeleteTrip = async (tripId) => {
    if (window.confirm('Are you sure you want to remove this saved trip?')) {
      try {
        await deleteTripFromDatabase(tripId);
      } catch (err) {
        alert('Could not delete trip.');
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* 1. Welcome & Actions Bar */}
      <div className="bg-gradient-to-r from-sky-900 via-slate-900 to-teal-950 text-white rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sky-300 text-xs font-bold border border-white/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Traveler Dashboard</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Welcome back, {user?.name || 'Traveler'}!
          </h1>
          <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
            Your personalized travel portal powered by Bayesian Popularity Recommendations.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate('/preferences')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-colors"
          >
            <Edit3 className="w-4 h-4 text-sky-400" />
            <span>Edit Preferences</span>
          </button>

          <button
            onClick={handleRegenerateItinerary}
            disabled={regenerating}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition-all shadow-md shadow-sky-500/30 disabled:opacity-50"
          >
            <RotateCcw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
            <span>{regenerating ? 'Regenerating...' : 'Regenerate Itinerary'}</span>
          </button>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold border border-rose-500/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* 2. Preferences & Budget Summary Grid */}
      {preferences && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Selected Interests */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-sky-600" />
              <span>Selected Interests</span>
            </h3>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {preferences.interests?.map((interest) => (
                <span
                  key={interest}
                  className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 font-semibold text-xs border border-sky-100"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* Travel Budget & Duration */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <IndianRupee className="w-4 h-4 text-emerald-600" />
              <span>Budget & Duration</span>
            </h3>
            <div className="space-y-1.5">
              <p className="text-lg font-black text-slate-900">
                ₹{preferences.budget_amount?.toLocaleString() || 7500}
                <span className="text-xs text-slate-400 font-normal ml-1">({preferences.budget_tier})</span>
              </p>
              <p className="text-xs text-slate-600 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-purple-600" />
                <span>{preferences.duration_days} Days ({preferences.duration_tier})</span>
              </p>
            </div>
          </div>

          {/* Location & Companion */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-600" />
              <span>Origin & Group</span>
            </h3>
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-800">
                {preferences.starting_city}, {preferences.starting_state}
              </p>
              <p className="text-xs text-slate-500">
                Group: <strong>{preferences.companion_type}</strong> • Season: <strong>{preferences.travel_month_or_season}</strong>
              </p>
            </div>
          </div>

        </div>
      )}

      {/* 3. Generated Day-Wise Itinerary Preview */}
      {loadingItinerary ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
          <Sparkles className="w-8 h-8 text-sky-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-medium">Computing day-wise route...</p>
        </div>
      ) : itinerary && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="text-[11px] font-bold text-sky-600 uppercase tracking-wider">Active Route</span>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">{itinerary.title}</h2>
              <p className="text-xs text-slate-500">
                {itinerary.duration_days} Days • Total Projected Cost: ₹{itinerary.financials?.total_estimated_cost?.toLocaleString()}
              </p>
            </div>

            <Link
              to="/itinerary"
              state={{ itinerary }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-xs"
            >
              <span>View Full Day-Wise Itinerary</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Quick 3-Day Preview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {itinerary.days?.slice(0, 3).map((dayPlan) => (
              <div key={dayPlan.day} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">Day {dayPlan.day}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    Fees: ₹{dayPlan.day_entrance_fee}
                  </span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  <li className="truncate">
                    🌅 <strong className="text-slate-800">{dayPlan.morning?.destination?.name || 'Sightseeing'}</strong>
                  </li>
                  <li className="truncate">
                    ☀️ <strong className="text-slate-800">{dayPlan.afternoon?.destination?.name || 'Heritage tour'}</strong>
                  </li>
                  <li className="truncate">
                    🌇 <strong className="text-slate-800">{dayPlan.evening?.destination?.name || 'Illuminated monument'}</strong>
                  </li>
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Recommended Destinations based on Popularity & Interests */}
      {itinerary?.recommended_destinations && itinerary.recommended_destinations.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>Recommended Destinations for You</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Top Bayesian popularity-ranked destinations matching your travel interests.
              </p>
            </div>
            <Link to="/explore" className="text-xs font-semibold text-sky-600 hover:underline">
              Browse All →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {itinerary.recommended_destinations.slice(0, 3).map((d) => (
              <DestinationCard key={d.id} destination={d} />
            ))}
          </div>
        </div>
      )}

      {/* 5. My Trips (Saved in SQLite Database) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookmarkCheck className="w-5 h-5 text-emerald-600" />
              <span>My Saved Trips ({savedTrips.length})</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Permanently stored in the SQLite database under your account profile.
            </p>
          </div>

          <Link
            to="/itinerary"
            className="text-xs font-semibold text-sky-600 hover:underline"
          >
            Create New Trip
          </Link>
        </div>

        {loadingTrips ? (
          <p className="text-xs text-slate-400 py-6 text-center">Loading trips from database...</p>
        ) : savedTrips.length === 0 ? (
          <div className="text-center py-10 text-slate-500 space-y-2">
            <BookmarkCheck className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs">No trips saved yet.</p>
            <p className="text-[11px] text-slate-400">
              Open your generated itinerary above and click <strong>"Save Itinerary in Database"</strong>.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedTrips.map((trip) => (
              <div
                key={trip.id}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-sky-300 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{trip.title}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Created on {new Date(trip.created_at).toLocaleDateString()} • {trip.duration_days} Days
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteTrip(trip.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Delete saved trip"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200/60">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Total Est. Cost</span>
                    <span className="font-bold text-slate-800">₹{trip.total_estimated_cost?.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Budget</span>
                    <span className="font-semibold text-slate-700">₹{trip.total_budget?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

