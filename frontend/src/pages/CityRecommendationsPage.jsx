import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Building2, Sparkles, MapPin, Search } from 'lucide-react';
import { travelApi } from '../services/api';
import DestinationCard from '../components/destinations/DestinationCard';

export default function CityRecommendationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const cityFromUrl = searchParams.get('city') || '';

  const [citiesList, setCitiesList] = useState([]);
  const [selectedCity, setSelectedCity] = useState(cityFromUrl);
  const [cityData, setCityData] = useState({});
  const [loading, setLoading] = useState(true);

  const popularCities = ['Amritsar', 'Mumbai', 'Jaipur', 'Delhi', 'Agra', 'Varanasi', 'Kolkata', 'Hyderabad', 'Bengaluru', 'Chennai'];

  // Load cities list
  useEffect(() => {
    async function loadMetadata() {
      try {
        const meta = await travelApi.getFilterMetadata();
        const cities = meta.cities || [];
        setCitiesList(cities);
        if (!selectedCity && cities.length > 0) {
          setSelectedCity('Amritsar');
        }
      } catch (err) {
        console.error('Failed to load city metadata:', err);
      }
    }
    loadMetadata();
  }, []);

  // Fetch city recommendations
  useEffect(() => {
    async function fetchCityRecommendations() {
      if (!selectedCity) return;
      try {
        setLoading(true);
        const data = await travelApi.getCityWisePopular(selectedCity, 10);
        setCityData(data || {});
      } catch (err) {
        console.error('Failed to load city recommendations:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCityRecommendations();
  }, [selectedCity]);

  const handleCitySelect = (cityName) => {
    setSelectedCity(cityName);
    setSearchParams({ city: cityName });
  };

  const destinations = cityData[selectedCity] || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold mb-3">
          <Building2 className="w-4 h-4 text-teal-600" />
          <span>City-Level Rankings</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Popular Attractions by Indian City
        </h1>
        <p className="text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
          Explore iconic landmarks and top-rated tourist stops situated within India's prominent heritage, commercial, and spiritual hubs.
        </p>
      </div>

      {/* City Selector */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Select or Search City:
          </label>
          <select
            value={selectedCity}
            onChange={(e) => handleCitySelect(e.target.value)}
            className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-sky-500 max-w-xs"
          >
            {citiesList.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Quick select pills */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
          {popularCities.map((c) => (
            <button
              key={c}
              onClick={() => handleCitySelect(c)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedCity.toLowerCase() === c.toLowerCase()
                  ? 'bg-teal-600 text-white shadow-xs font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>Popular Destinations in</span>
            <span className="text-teal-600 underline decoration-teal-300 underline-offset-4">{selectedCity}</span>
          </h2>
          <span className="text-xs font-medium text-slate-500">
            {destinations.length} {destinations.length === 1 ? 'Attraction' : 'Attractions'}
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-72 rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : destinations.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
            <p className="text-sm font-semibold text-slate-600">No destinations found for this city.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map((destination) => (
              <DestinationCard key={destination.id} destination={destination} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

