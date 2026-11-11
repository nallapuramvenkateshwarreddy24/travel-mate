import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  MapPin, 
  Calendar, 
  Clock, 
  IndianRupee, 
  Users, 
  Check, 
  ArrowRight,
  ShieldCheck,
  Compass,
  Building,
  TreePine,
  Sun,
  Mountain,
  Landmark,
  Camera,
  Activity,
  Waves,
  AlertTriangle
} from 'lucide-react';
import { travelApi } from '../services/api';
import { useTrip } from '../context/TripContext';

const TRAVEL_INTERESTS = [
  { id: 'Historical Places', label: 'Historical Places', desc: 'Forts, ancient monuments & royal bastions', icon: Landmark },
  { id: 'Nature and Wildlife', label: 'Nature and Wildlife', desc: 'National parks, reserves & flora/fauna', icon: TreePine },
  { id: 'Beaches', label: 'Beaches', desc: 'Coastal shorelines, islands & marine breeze', icon: Sun },
  { id: 'Hill Stations', label: 'Hill Stations', desc: 'Mountain peaks, lush valleys & scenic viewpoints', icon: Mountain },
  { id: 'Temples and Spiritual Places', label: 'Temples and Spiritual Places', desc: 'Jyotirlingas, gurudwaras & spiritual retreats', icon: Building },
  { id: 'Adventure', label: 'Adventure', desc: 'Trekking routes, caves & thrill sports', icon: Activity },
  { id: 'Cultural Experiences', label: 'Cultural Experiences', desc: 'Historic town areas, ghats & bazaars', icon: Compass },
  { id: 'Museums', label: 'Museums', desc: 'Galleries, tribal artifacts & science centres', icon: Camera },
  { id: 'Waterfalls', label: 'Waterfalls', desc: 'Cascading natural falls & river confluences', icon: Waves },
  { id: 'Family Destinations', label: 'Family Destinations', desc: 'Amusement parks, botanical gardens & promenades', icon: Users },
];

const BUDGET_TIERS = [
  { id: 'Below ₹2,000', label: 'Below ₹2,000', amount: 1800, desc: 'Budget backpacker / Day trips' },
  { id: '₹2,000–₹5,000', label: '₹2,000–₹5,000', amount: 3500, desc: 'Comfort explorer / Weekend trip' },
  { id: '₹5,000–₹10,000', label: '₹5,000–₹10,000', amount: 7500, desc: 'Popular standard / 2-3 Days' },
  { id: '₹10,000–₹20,000', label: '₹10,000–₹20,000', amount: 15000, desc: 'Extended getaway / 3-5 Days' },
  { id: '₹20,000–₹50,000', label: '₹20,000–₹50,000', amount: 30000, desc: 'Premium comprehensive / 5-7 Days' },
  { id: 'Custom Budget', label: 'Custom Budget', amount: null, desc: 'Specify your exact budget amount' },
];

const DURATION_OPTIONS = [
  { id: '1 Day', label: '1 Day', days: 1 },
  { id: '2 Days', label: '2 Days', days: 2 },
  { id: '3 Days', label: '3 Days', days: 3 },
  { id: '5 Days', label: '5 Days', days: 5 },
  { id: '7 Days', label: '7 Days', days: 7 },
  { id: 'Custom Number of Days', label: 'Custom Days', days: null },
];

const COMPANIONS = [
  { id: 'Solo', label: 'Solo Traveler', icon: '🎒', desc: 'Flexible, independent exploration' },
  { id: 'Couple', label: 'Couple', icon: '✨', desc: 'Romantic sights and cozy pace' },
  { id: 'Family', label: 'Family', icon: '👨‍👩‍👧‍👦', desc: 'Kid-friendly, relaxed & comfortable' },
  { id: 'Friends', label: 'Friends Group', icon: '🏕️', desc: 'Active, vibrant & shared adventures' },
];

const SEASONS = [
  { id: 'Winter (Nov - Feb)', label: 'Winter (Nov - Feb)', desc: 'Pleasant, cool weather across most states' },
  { id: 'Summer (Mar - Jun)', label: 'Summer (Mar - Jun)', desc: 'Ideal for hill stations, lakes & high Himalayas' },
  { id: 'Monsoon (Jul - Sep)', label: 'Monsoon (Jul - Sep)', desc: 'Lush greenery, active waterfalls & misty valleys' },
  { id: 'Spring / Autumn (Oct - Nov)', label: 'Spring / Autumn (Oct - Nov)', desc: 'Festive seasons, clear skies & temple festivities' },
];

export default function PreferencesPage() {
  const { user, userPreferences, setUserPreferences } = useTrip();
  const navigate = useNavigate();

  // Form states
  const [selectedInterests, setSelectedInterests] = useState(['Historical Places', 'Temples and Spiritual Places']);
  const [selectedBudget, setSelectedBudget] = useState('₹5,000–₹10,000');
  const [customBudgetAmount, setCustomBudgetAmount] = useState(12000);
  const [selectedDuration, setSelectedDuration] = useState('3 Days');
  const [customDays, setCustomDays] = useState(4);
  const [selectedState, setSelectedState] = useState('Punjab');
  const [selectedCity, setSelectedCity] = useState('Amritsar');
  const [selectedCompanion, setSelectedCompanion] = useState('Solo');
  const [selectedSeason, setSelectedSeason] = useState('Winter (Nov - Feb)');

  // Metadata for states and cities
  const [statesList, setStatesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const [feedbackType, setFeedbackType] = useState('success');

  useEffect(() => {
    async function loadMetadataAndExistingPrefs() {
      try {
        setLoading(true);
        const meta = await travelApi.getFilterMetadata();
        setStatesList(meta.states || []);
        setCitiesList(meta.cities || []);

        // Load existing saved preferences if available
        try {
          const existing = await travelApi.getPreferences();
          if (existing) {
            if (existing.interests && existing.interests.length > 0) setSelectedInterests(existing.interests);
            if (existing.budget_tier) setSelectedBudget(existing.budget_tier);
            if (existing.budget_amount) setCustomBudgetAmount(existing.budget_amount);
            if (existing.duration_tier) setSelectedDuration(existing.duration_tier);
            if (existing.duration_days) setCustomDays(existing.duration_days);
            if (existing.starting_state) setSelectedState(existing.starting_state);
            if (existing.starting_city) setSelectedCity(existing.starting_city);
            if (existing.companion_type) setSelectedCompanion(existing.companion_type);
            if (existing.travel_month_or_season) setSelectedSeason(existing.travel_month_or_season);
          }
        } catch (e) {
          // No preferences saved yet is normal
        }
      } catch (err) {
        console.error('Failed to load filter metadata:', err);
      } finally {
        setLoading(false);
      }
    }

    loadMetadataAndExistingPrefs();
  }, []);

  const toggleInterest = (id) => {
    if (selectedInterests.includes(id)) {
      if (selectedInterests.length === 1) return; // Must have at least 1
      setSelectedInterests(selectedInterests.filter((item) => item !== id));
    } else {
      setSelectedInterests([...selectedInterests, id]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedbackMsg(null);

    // Calculate numeric amounts
    let budgetAmt = 7500;
    const tierObj = BUDGET_TIERS.find((b) => b.id === selectedBudget);
    if (tierObj && tierObj.amount) {
      budgetAmt = tierObj.amount;
    } else if (selectedBudget === 'Custom Budget') {
      budgetAmt = Number(customBudgetAmount) || 10000;
    }

    let daysCount = 3;
    const durObj = DURATION_OPTIONS.find((d) => d.id === selectedDuration);
    if (durObj && durObj.days) {
      daysCount = durObj.days;
    } else if (selectedDuration === 'Custom Number of Days') {
      daysCount = Number(customDays) || 3;
    }

    const payload = {
      interests: selectedInterests,
      budget_tier: selectedBudget,
      budget_amount: budgetAmt,
      duration_tier: selectedDuration,
      duration_days: daysCount,
      starting_state: selectedState,
      starting_city: selectedCity,
      companion_type: selectedCompanion,
      travel_month_or_season: selectedSeason,
    };

    try {
      const saved = await travelApi.savePreferences(payload);
      setUserPreferences(saved);
      setFeedbackMsg('Preferences saved successfully! Generating your personalized itinerary...');
      setFeedbackType('success');
      setTimeout(() => {
        navigate('/itinerary');
      }, 1000);
    } catch (err) {
      console.error('Failed to save preferences:', err);
      let message = 'Failed to save preferences. Please check your connection.';
      if (err.response?.status === 401) {
        message = 'Your session has expired. Redirecting to login page...';
        setFeedbackMsg(message);
        setFeedbackType('error');
        setSaving(false);
        setTimeout(() => {
          navigate('/login');
        }, 1500);
        return;
      } else if (err.response?.data?.detail) {
        if (typeof err.response.data.detail === 'string') {
          message = err.response.data.detail;
        } else if (Array.isArray(err.response.data.detail)) {
          message = err.response.data.detail.map((d) => d.msg || JSON.stringify(d)).join('; ');
        }
      } else if (err.message === 'Network Error') {
        message = 'Cannot reach backend server. Please verify FastAPI is running on port 8000.';
      }
      setFeedbackMsg(message);
      setFeedbackType('error');
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-sky-900 via-slate-900 to-teal-950 text-white rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-sky-300 text-xs font-bold border border-white/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Personalized Travel Setup</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Tell Us Your Travel Preferences
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Customize your trip interests, budget, duration, and origin. Travel Mate’s Bayesian Popularity Engine will design your day-wise itinerary and calculate detailed cost estimates.
          </p>
        </div>
      </div>

      {feedbackMsg && (
        <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-2.5 transition-all shadow-xs ${
          feedbackType === 'error'
            ? 'bg-rose-50 border-rose-200 text-rose-800'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          {feedbackType === 'error' ? (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          ) : (
            <Sparkles className="w-4 h-4 text-emerald-600 animate-spin shrink-0" />
          )}
          <span>{feedbackMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-10">
        
        {/* A. Travel Interests */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 text-xs flex items-center justify-center font-bold">A</span>
                <span>Travel Interests (Multiple Selections Allowed)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Choose the types of experiences you want highlighted in your itinerary.
              </p>
            </div>
            <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full">
              {selectedInterests.length} Selected
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {TRAVEL_INTERESTS.map((interest) => {
              const Icon = interest.icon;
              const isSelected = selectedInterests.includes(interest.id);
              return (
                <button
                  type="button"
                  key={interest.id}
                  onClick={() => toggleInterest(interest.id)}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
                    isSelected
                      ? 'bg-sky-50/70 border-sky-500 shadow-xs ring-1 ring-sky-500'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-xs font-bold truncate ${isSelected ? 'text-sky-900' : 'text-slate-800'}`}>
                        {interest.label}
                      </p>
                      {isSelected && <Check className="w-4 h-4 text-sky-600 stroke-[3] shrink-0" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                      {interest.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* B. Travel Budget */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs flex items-center justify-center font-bold">B</span>
              <span>Total Travel Budget (INR)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              We allocate your budget realistically across stays, food, transit, and attraction entry fees.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {BUDGET_TIERS.map((tier) => {
              const isSelected = selectedBudget === tier.id;
              return (
                <button
                  type="button"
                  key={tier.id}
                  onClick={() => setSelectedBudget(tier.id)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'bg-emerald-50/70 border-emerald-500 shadow-xs ring-1 ring-emerald-500'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className={`text-xs font-bold ${isSelected ? 'text-emerald-900' : 'text-slate-800'}`}>
                      {tier.label}
                    </p>
                    {isSelected && <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {tier.desc}
                  </p>
                </button>
              );
            })}
          </div>

          {selectedBudget === 'Custom Budget' && (
            <div className="mt-4 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 max-w-sm">
              <label className="block text-xs font-bold text-emerald-900 mb-1">
                Enter Custom Budget Amount (₹)
              </label>
              <div className="relative">
                <IndianRupee className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600" />
                <input
                  type="number"
                  min="500"
                  step="500"
                  value={customBudgetAmount}
                  onChange={(e) => setCustomBudgetAmount(e.target.value)}
                  placeholder="e.g. 15000"
                  required
                  className="w-full pl-9 pr-4 py-2 border border-emerald-300 rounded-xl text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-bold"
                />
              </div>
            </div>
          )}
        </div>

        {/* C. Travel Duration */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs flex items-center justify-center font-bold">C</span>
              <span>Travel Duration</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              The planner schedules 3 attractions per day (Morning, Afternoon, Evening) for this duration.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
            {DURATION_OPTIONS.map((dur) => {
              const isSelected = selectedDuration === dur.id;
              return (
                <button
                  type="button"
                  key={dur.id}
                  onClick={() => setSelectedDuration(dur.id)}
                  className={`p-4 rounded-2xl border text-center transition-all ${
                    isSelected
                      ? 'bg-purple-50/70 border-purple-500 shadow-xs ring-1 ring-purple-500'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <p className={`text-xs font-bold ${isSelected ? 'text-purple-900' : 'text-slate-800'}`}>
                    {dur.label}
                  </p>
                  {dur.days && (
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {dur.days * 3} Activities
                    </p>
                  )}
                </button>
              );
            })}
          </div>

          {selectedDuration === 'Custom Number of Days' && (
            <div className="mt-4 p-4 rounded-2xl bg-purple-50/50 border border-purple-200 max-w-sm">
              <label className="block text-xs font-bold text-purple-900 mb-1">
                Enter Number of Days (1 to 14)
              </label>
              <input
                type="number"
                min="1"
                max="14"
                value={customDays}
                onChange={(e) => setCustomDays(e.target.value)}
                required
                className="w-full px-4 py-2 border border-purple-300 rounded-xl text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-bold"
              />
            </div>
          )}
        </div>

        {/* D. Starting Location */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs flex items-center justify-center font-bold">D</span>
              <span>Starting Location in India</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Itinerary destinations prioritize your starting state and city first before expanding to nearby regional highlights.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Starting State</label>
              <select
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                }}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs bg-white font-medium focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              >
                {statesList.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Starting City / Base</label>
              <input
                type="text"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                placeholder="e.g. Amritsar, Mumbai, Jaipur, Varanasi"
                required
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs bg-white font-medium focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* E & F: Travel Companion & Season */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* E. Companions */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 text-xs flex items-center justify-center font-bold">E</span>
                <span>Travel Preferences (Companions)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Adjusts accommodation and transit cost calculations.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              {COMPANIONS.map((comp) => {
                const isSelected = selectedCompanion === comp.id;
                return (
                  <button
                    type="button"
                    key={comp.id}
                    onClick={() => setSelectedCompanion(comp.id)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-sky-50 border-sky-500 ring-1 ring-sky-500'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xl block mb-1">{comp.icon}</span>
                    <p className={`text-xs font-bold ${isSelected ? 'text-sky-900' : 'text-slate-800'}`}>
                      {comp.label}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{comp.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* F. Season / Month */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 text-xs flex items-center justify-center font-bold">F</span>
                <span>Travel Season or Window</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Helps align with peak regional visiting windows.</p>
            </div>

            <div className="space-y-2 pt-1">
              {SEASONS.map((season) => {
                const isSelected = selectedSeason === season.id;
                return (
                  <button
                    type="button"
                    key={season.id}
                    onClick={() => setSelectedSeason(season.id)}
                    className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-teal-50 border-teal-500 ring-1 ring-teal-500'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <p className={`text-xs font-bold ${isSelected ? 'text-teal-900' : 'text-slate-800'}`}>
                        {season.label}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{season.desc}</p>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-teal-600 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Submit Action */}
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <h3 className="text-lg font-bold text-white">Ready to plan your India adventure?</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md">
              We will save your preferences in SQLite and generate a complete day-wise itinerary matching your budget and interests.
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-8 py-3.5 bg-sky-500 hover:bg-sky-400 text-white rounded-2xl text-xs font-extrabold transition-all shadow-lg shadow-sky-500/30 flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
          >
            <span>{saving ? 'Saving & Generating...' : 'Save Preferences & Generate Itinerary'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </form>

    </div>
  );
}

