import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Sun, 
  Sunset, 
  Moon, 
  Clock, 
  Sparkles, 
  Calendar,
  CloudSun
} from 'lucide-react';
import { travelApi } from '../services/api';
import DestinationCard from '../components/destinations/DestinationCard';

export default function SeasonalRecommendationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const timeSlotFromUrl = searchParams.get('best_time') || '';

  const [seasonalData, setSeasonalData] = useState({});
  const [activeSlot, setActiveSlot] = useState(timeSlotFromUrl || 'All');
  const [loading, setLoading] = useState(true);

  const timeSlots = [
    { key: 'All', label: 'All Day (Flexible)', icon: Clock, desc: 'Great to visit at any hour of the day' },
    { key: 'Morning', label: 'Morning Visits', icon: Sun, desc: 'Ideal for sunrise, fresh air, and spiritual serenity' },
    { key: 'Afternoon', label: 'Afternoon Exploration', icon: CloudSun, desc: 'Indoor museums, shaded forts & commercial parks' },
    { key: 'Evening', label: 'Evening Highlights', icon: Sunset, desc: 'Golden hours, night illumination & promenade walks' },
  ];

  useEffect(() => {
    async function fetchSeasonal() {
      try {
        setLoading(true);
        const data = await travelApi.getSeasonalPopular(null, 12);
        setSeasonalData(data || {});
      } catch (err) {
        console.error('Failed to load seasonal recommendations:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSeasonal();
  }, []);

  const handleSlotChange = (slotKey) => {
    setActiveSlot(slotKey);
    setSearchParams({ best_time: slotKey });
  };

  // Map slot key to dataset value
  // In dataset, "All Day" was standardized from "All"
  const getMappedDestinations = (slotKey) => {
    if (slotKey === 'All') {
      return seasonalData['All Day'] || seasonalData['All'] || [];
    }
    return seasonalData[slotKey] || [];
  };

  const currentDestinations = getMappedDestinations(activeSlot);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold mb-3">
          <Calendar className="w-4 h-4 text-amber-600" />
          <span>Optimal Visiting Times</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Seasonal & Time-Based Recommendations
        </h1>
        <p className="text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
          Discover attractions categorized by their optimal visitation windows — whether you're seeking peaceful morning darshans, shaded afternoon heritage tours, or illuminated evening walks.
        </p>
      </div>

      {/* Time Slot Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {timeSlots.map((slot) => {
          const Icon = slot.icon;
          const isSelected = activeSlot === slot.key;
          return (
            <button
              key={slot.key}
              onClick={() => handleSlotChange(slot.key)}
              className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-sky-50 border-sky-400 shadow-md ring-2 ring-sky-400/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                  isSelected ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className={`font-bold text-sm ${isSelected ? 'text-sky-900' : 'text-slate-800'}`}>
                  {slot.label}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-snug">
                  {slot.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center justify-between text-[11px] font-semibold">
                <span className={isSelected ? 'text-sky-600' : 'text-slate-400'}>
                  {getMappedDestinations(slot.key).length} Destinations
                </span>
                <span className={isSelected ? 'text-sky-600 font-bold' : 'text-slate-400'}>
                  {isSelected ? 'Active Selection' : 'Select'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">
            Top Recommendations for {timeSlots.find((s) => s.key === activeSlot)?.label}
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Sorted by Bayesian Popularity Rank
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-72 rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : currentDestinations.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
            <p className="text-sm font-semibold text-slate-600">No destinations found for this time slot.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentDestinations.map((destination) => (
              <DestinationCard key={destination.id} destination={destination} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

