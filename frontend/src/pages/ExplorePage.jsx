import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  RotateCcw, 
  MapPin, 
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { travelApi } from '../services/api';
import DestinationCard from '../components/destinations/DestinationCard';

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Filter States
  const [query, setQuery] = useState(searchParams.get('query') || '');
  const [selectedState, setSelectedState] = useState(searchParams.get('state') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedZone, setSelectedZone] = useState('');
  const [selectedBestTime, setSelectedBestTime] = useState('');
  const [feeFilter, setFeeFilter] = useState('all'); // 'all', 'free', 'under_50', 'under_200'
  const [sortBy, setSortBy] = useState('popularity');
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // Data States
  const [destinations, setDestinations] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [metadata, setMetadata] = useState({ states: [], types: [], zones: [], best_times: [] });
  const [loading, setLoading] = useState(true);

  // Load filter metadata once
  useEffect(() => {
    async function loadMetadata() {
      try {
        const meta = await travelApi.getFilterMetadata();
        setMetadata(meta);
      } catch (err) {
        console.error('Failed to load filter metadata:', err);
      }
    }
    loadMetadata();
  }, []);

  // Update URL params when query/state/category changes
  useEffect(() => {
    const q = searchParams.get('query');
    const s = searchParams.get('state');
    const c = searchParams.get('category');
    if (q !== null && q !== query) setQuery(q);
    if (s !== null && s !== selectedState) setSelectedState(s);
    if (c !== null && c !== selectedCategory) setSelectedCategory(c);
  }, [searchParams]);

  // Fetch destinations when parameters change
  useEffect(() => {
    async function fetchDestinations() {
      try {
        setLoading(true);
        const params = {
          page,
          page_size: pageSize,
          sort_by: sortBy,
        };

        if (query.trim()) params.query = query.trim();
        if (selectedState) params.state = selectedState;
        if (selectedCategory) params.category = selectedCategory;
        if (selectedZone) params.zone = selectedZone;
        if (selectedBestTime) params.best_time = selectedBestTime;

        if (feeFilter === 'free') params.max_fee = 0;
        if (feeFilter === 'under_50') params.max_fee = 50;
        if (feeFilter === 'under_200') params.max_fee = 200;

        const response = await travelApi.getDestinations(params);
        setDestinations(response.destinations || []);
        setTotalCount(response.total || 0);
        setTotalPages(response.total_pages || 1);
      } catch (err) {
        console.error('Failed to fetch destinations:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDestinations();
  }, [query, selectedState, selectedCategory, selectedZone, selectedBestTime, feeFilter, sortBy, page]);

  const handleResetFilters = () => {
    setQuery('');
    setSelectedState('');
    setSelectedCategory('');
    setSelectedZone('');
    setSelectedBestTime('');
    setFeeFilter('all');
    setSortBy('popularity');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-sky-600 uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4" />
          <span>Complete Catalog</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Explore All Tourist Destinations in India
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Browse, filter, and sort through 321 verified destinations with authentic Google review statistics.
        </p>
      </div>

      {/* Filter and Search Controls Box */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        
        {/* Search Bar & Sort Selector */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, city, significance..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-500 bg-slate-50/50"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <span className="text-xs font-medium text-slate-500 shrink-0">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            >
              <option value="popularity">Popularity Rank (Bayesian)</option>
              <option value="rating">Highest Rating</option>
              <option value="reviews">Most Reviews Count</option>
              <option value="fee_asc">Lowest Entrance Fee</option>
            </select>

            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          
          {/* State Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">State</label>
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            >
              <option value="">All States ({metadata.states?.length || 32})</option>
              {metadata.states?.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            >
              <option value="">All Categories ({metadata.types?.length || 66})</option>
              {metadata.types?.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Entrance Fee Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Entrance Fee</label>
            <select
              value={feeFilter}
              onChange={(e) => {
                setFeeFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            >
              <option value="all">Any Fee</option>
              <option value="free">Free Entry (₹0)</option>
              <option value="under_50">Under ₹50</option>
              <option value="under_200">Under ₹200</option>
            </select>
          </div>

          {/* Best Time Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Best Time</label>
            <select
              value={selectedBestTime}
              onChange={(e) => {
                setSelectedBestTime(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            >
              <option value="">All Times</option>
              <option value="Morning">Morning</option>
              <option value="Afternoon">Afternoon</option>
              <option value="Evening">Evening</option>
              <option value="All Day">All Day</option>
            </select>
          </div>

        </div>

      </div>

      {/* Results Header Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing {destinations.length > 0 ? (page - 1) * pageSize + 1 : 0} -{' '}
          {Math.min(page * pageSize, totalCount)} of {totalCount} destinations
        </span>
        <span>Page {page} of {totalPages}</span>
      </div>

      {/* Destinations Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="h-80 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : destinations.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8">
          <p className="text-lg font-bold text-slate-700">No destinations match your filters</p>
          <p className="text-xs text-slate-500 mt-1">Try resetting the filters or modifying your search keyword.</p>
          <button
            onClick={handleResetFilters}
            className="mt-4 px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-semibold hover:bg-sky-700 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {destinations.map((destination) => (
            <DestinationCard key={destination.id} destination={destination} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
            .map((p, idx, arr) => {
              const prev = arr[idx - 1];
              return (
                <React.Fragment key={p}>
                  {prev && p - prev > 1 && <span className="text-slate-400 px-1">...</span>}
                  <button
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                      page === p
                        ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                        : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </button>
                </React.Fragment>
              );
            })}

          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

    </div>
  );
}

