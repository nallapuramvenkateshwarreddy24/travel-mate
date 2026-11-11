import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapPin, Sparkles, Filter, ChevronRight } from 'lucide-react';
import { travelApi } from '../services/api';
import DestinationCard from '../components/destinations/DestinationCard';

export default function StateRecommendationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const stateFromUrl = searchParams.get('state') || '';

  const [statesList, setStatesList] = useState([]);
  const [selectedState, setSelectedState] = useState(stateFromUrl);
  const [stateDestinations, setStateDestinations] = useState({});
  const [loading, setLoading] = useState(true);

  // Load available states
  useEffect(() => {
    async function loadStates() {
      try {
        const meta = await travelApi.getFilterMetadata();
        const states = meta.states || [];
        setStatesList(states);
        if (!selectedState && states.length > 0) {
          // Default to Punjab or first state
          const defaultState = states.includes('Punjab') ? 'Punjab' : states[0];
          setSelectedState(defaultState);
        }
      } catch (err) {
        console.error('Failed to load state metadata:', err);
      }
    }
    loadStates();
  }, []);

  // Fetch recommendations whenever selectedState changes
  useEffect(() => {
    async function fetchStateRecommendations() {
      if (!selectedState) return;
      try {
        setLoading(true);
        const data = await travelApi.getStateWisePopular(selectedState, 8);
        setStateDestinations(data || {});
      } catch (err) {
        console.error('Failed to fetch state recommendations:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStateRecommendations();
  }, [selectedState]);

  const handleStateClick = (stateName) => {
    setSelectedState(stateName);
    setSearchParams({ state: stateName });
  };

  const currentDests = stateDestinations[selectedState] || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-xs font-bold mb-3">
          <MapPin className="w-4 h-4 text-sky-600" />
          <span>Regional Highlights</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          State-Wise Popular Tourist Attractions
        </h1>
        <p className="text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
          Select any of the 32 Indian states and Union Territories to view top-rated monuments, heritage sites, and natural attractions ranked by Bayesian popularity.
        </p>
      </div>

      {/* State Selection Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Select State / Union Territory:
          </label>
          <select
            value={selectedState}
            onChange={(e) => handleStateClick(e.target.value)}
            className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-sky-500 max-w-xs"
          >
            {statesList.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>

        {/* Scrollable Quick Selection Pills for Major States */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
          {statesList.slice(0, 14).map((st) => (
            <button
              key={st}
              onClick={() => handleStateClick(st)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedState === st
                  ? 'bg-sky-600 text-white shadow-xs font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Selected State Results */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>Popular Destinations in</span>
            <span className="text-sky-600 underline decoration-sky-300 underline-offset-4">{selectedState}</span>
          </h2>
          <span className="text-xs font-medium text-slate-500">
            {currentDests.length} {currentDests.length === 1 ? 'Attraction' : 'Attractions'} Found
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-72 rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : currentDests.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
            <p className="text-sm font-semibold text-slate-600">No destinations found for this state in the dataset.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentDests.map((destination) => (
              <DestinationCard key={destination.id} destination={destination} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

