import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layers, Sparkles, Tag, ChevronRight } from 'lucide-react';
import { travelApi } from '../services/api';
import DestinationCard from '../components/destinations/DestinationCard';

export default function CategoryRecommendationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category') || '';

  const [categoriesList, setCategoriesList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl);
  const [categoryData, setCategoryData] = useState({});
  const [loading, setLoading] = useState(true);

  const topCategories = ['Temple', 'Fort', 'Beach', 'Palace', 'National Park', 'Museum', 'Lake', 'Waterfall', 'Gurudwara', 'Viewpoint'];

  useEffect(() => {
    async function loadCategories() {
      try {
        const meta = await travelApi.getFilterMetadata();
        const types = meta.types || [];
        setCategoriesList(types);
        if (!selectedCategory && types.length > 0) {
          const defaultCat = types.includes('Temple') ? 'Temple' : types[0];
          setSelectedCategory(defaultCat);
        }
      } catch (err) {
        console.error('Failed to load category metadata:', err);
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    async function fetchCategoryRecommendations() {
      if (!selectedCategory) return;
      try {
        setLoading(true);
        const data = await travelApi.getCategoryWisePopular(selectedCategory, 12);
        setCategoryData(data || {});
      } catch (err) {
        console.error('Failed to load category recommendations:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCategoryRecommendations();
  }, [selectedCategory]);

  const handleCategorySelect = (categoryName) => {
    setSelectedCategory(categoryName);
    setSearchParams({ category: categoryName });
  };

  const destinations = categoryData[selectedCategory] || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-800 text-xs font-bold mb-3">
          <Layers className="w-4 h-4 text-purple-600" />
          <span>Curated Categories</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Category-Wise Popular Destinations
        </h1>
        <p className="text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
          Filter through 66 verified tourist attraction categories — from ancient jyotirlingas and UNESCO forts to wildlife sanctuaries and pristine beaches.
        </p>
      </div>

      {/* Category Selection Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Select Attraction Category:
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => handleCategorySelect(e.target.value)}
            className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-sky-500 max-w-xs"
          >
            {categoriesList.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Popular Category Badges */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
          {topCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? 'bg-purple-600 text-white shadow-xs font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Destination Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>Popular Attractions in</span>
            <span className="text-purple-600 underline decoration-purple-300 underline-offset-4">{selectedCategory}</span>
          </h2>
          <span className="text-xs font-medium text-slate-500">
            {destinations.length} {destinations.length === 1 ? 'Destination' : 'Destinations'}
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-72 rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : destinations.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
            <p className="text-sm font-semibold text-slate-600">No destinations found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {destinations.map((destination) => (
              <DestinationCard key={destination.id} destination={destination} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

