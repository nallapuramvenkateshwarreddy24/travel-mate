import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Sparkles, 
  MapPin, 
  TrendingUp, 
  Award, 
  Compass, 
  ArrowRight,
  ShieldCheck,
  Calendar,
  Layers,
  Building,
  TreePine,
  Sun
} from 'lucide-react';
import { travelApi } from '../services/api';
import DestinationCard from '../components/destinations/DestinationCard';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [popularDestinations, setPopularDestinations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [topRes, statsRes] = await Promise.all([
          travelApi.getTopPopular(6),
          travelApi.getDatasetStats(),
        ]);
        setPopularDestinations(topRes || []);
        setStats(statsRes || null);
      } catch (err) {
        console.error('Failed to load home page data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?query=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  const featureStates = [
    { name: 'Punjab', count: 'Golden Temple & Heritage', color: 'from-amber-500/20 to-orange-500/20' },
    { name: 'Uttarakhand', count: 'Kedarnath & Himalayas', color: 'from-sky-500/20 to-blue-500/20' },
    { name: 'Maharashtra', count: 'Siddhivinayak & Forts', color: 'from-rose-500/20 to-pink-500/20' },
    { name: 'Delhi', count: 'Gurudwara Bangla Sahib & Monuments', color: 'from-purple-500/20 to-indigo-500/20' },
    { name: 'Rajasthan', count: 'Chittorgarh & Palaces', color: 'from-amber-600/20 to-yellow-500/20' },
    { name: 'Tamil Nadu', count: 'Brihadeeswarar & Temples', color: 'from-emerald-500/20 to-teal-500/20' },
  ];

  const featureCategories = [
    { name: 'Temple', label: 'Temples & Shrines', icon: Building, desc: 'Sacred architecture & ancient jyotirlingas' },
    { name: 'Fort', label: 'Historic Forts', icon: ShieldCheck, desc: 'Royal bastions, hillforts & ramparts' },
    { name: 'Palace', label: 'Royal Palaces', icon: Award, desc: 'Majestic residences & imperial halls' },
    { name: 'Beach', label: 'Beaches & Coasts', icon: Sun, desc: 'Scenic coastlines & tropical sands' },
    { name: 'National Park', label: 'National Parks', icon: TreePine, desc: 'Untamed wildlife & sanctuaries' },
    { name: 'Lake', label: 'Alpine & High Lakes', icon: Compass, desc: 'Crystal waters & valley landscapes' },
  ];

  return (
    <div className="space-y-20 pb-20">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-50 via-white to-slate-50 pt-20 pb-24 px-4 sm:px-6 lg:px-8 border-b border-slate-100">
        <div className="max-w-5xl mx-auto text-center">
          
          {/* Tagline / Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100/70 border border-sky-200 text-sky-800 text-xs font-semibold mb-6 shadow-xs animate-in fade-in duration-300">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>Discover Places. Explore Experiences.</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            Explore India’s Most Popular <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-sky-600 via-teal-500 to-emerald-500 bg-clip-text text-transparent">
              Destinations & Landmarks
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Welcome to <strong className="text-slate-900 font-bold">Travel Mate</strong>. Discover 321 verified attractions across 32 Indian states, ranked purely by statistical popularity (Bayesian Weighted Rating) using millions of real traveler reviews.
          </p>

          {/* Search Input Bar */}
          <form onSubmit={handleSearch} className="mt-10 max-w-2xl mx-auto">
            <div className="relative flex items-center bg-white rounded-2xl shadow-lg shadow-sky-900/5 border border-slate-200/80 p-2 focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-transparent transition-all">
              <div className="pl-3 text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by monument name, city (e.g. Amritsar, Mumbai), or state..."
                className="w-full px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden bg-transparent"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-sky-600/20 shrink-0"
              >
                <span>Search</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick Metrics Bar */}
          {stats && (
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-6 border-t border-slate-200/60">
              <div className="text-center">
                <p className="text-2xl font-black text-slate-900">{stats.total_destinations}</p>
                <p className="text-xs text-slate-500 font-medium">Attractions Verified</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-sky-600">{stats.unique_states}</p>
                <p className="text-xs text-slate-500 font-medium">States & UTs Covered</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-emerald-600">{stats.unique_cities}</p>
                <p className="text-xs text-slate-500 font-medium">Cities Represented</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-amber-500">100%</p>
                <p className="text-xs text-slate-500 font-medium">Popularity-Based</p>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* 2. Top Popular Destinations Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-sky-600 uppercase tracking-wider mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>Nationwide Standouts</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              India’s Most Popular Tourist Destinations
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Ranked with statistical precision using Bayesian Weighted Rating ($WR$).
            </p>
          </div>
          <Link
            to="/popular"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-sky-600 hover:text-sky-700 hover:underline"
          >
            <span>View Full Top 10 Leaderboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-72 rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularDestinations.map((destination) => (
              <DestinationCard key={destination.id} destination={destination} />
            ))}
          </div>
        )}
      </section>

      {/* 3. Explore by State Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Regional Discovery</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mt-1">
              Explore Attractions Across Indian States
            </h2>
            <p className="text-sm text-slate-300 mt-3 leading-relaxed">
              From the high-altitude pilgrimage routes in Uttarakhand to the historic palaces of Rajasthan and the tranquil backwaters of the South.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
            {featureStates.map((st) => (
              <Link
                key={st.name}
                to={`/state-wise?state=${encodeURIComponent(st.name)}`}
                className="group p-5 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 transition-all flex items-center justify-between"
              >
                <div>
                  <h3 className="font-bold text-white text-base group-hover:text-sky-300 transition-colors">
                    {st.name}
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">{st.count}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center relative z-10">
            <span className="text-xs text-slate-400">Total 32 States & Union Territories Available</span>
            <Link
              to="/state-wise"
              className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 hover:underline"
            >
              <span>Explore All States</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Browse by Category */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">Diverse Heritage</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
            Browse by Travel Category
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            66 distinct attraction categories extracted from authentic dataset classifications.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {featureCategories.map((cat) => {
            const IconComponent = cat.icon;
            return (
              <Link
                key={cat.name}
                to={`/categories?category=${encodeURIComponent(cat.name)}`}
                className="group p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-sky-500 hover:shadow-lg transition-all flex flex-col items-center text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 group-hover:bg-sky-600 group-hover:text-white flex items-center justify-center transition-colors mb-3">
                  <IconComponent className="w-6 h-6" />
                </div>
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                  {cat.label}
                </h3>
                <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-tight">
                  {cat.desc}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 5. Transparency & Algorithm Explanation Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-3xl bg-gradient-to-r from-sky-50 via-teal-50 to-emerald-50 border border-sky-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-800 bg-sky-200/60 px-2.5 py-0.5 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-700" />
              <span>Statistical Purity Guarantee</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              Why Popularity-Based Recommendation?
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Unlike opaque collaborative filtering (NCF or Matrix Factorization) that struggles with cold-start biases and synthetic distortions, Travel Mate uses Bayesian Weighted Rating. It balances real review volumes and traveler ratings to give transparent, verifiable tourist recommendations.
            </p>
          </div>
          <Link
            to="/admin"
            className="px-5 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-bold hover:bg-slate-50 transition-colors shrink-0 shadow-xs"
          >
            View Dataset Analytics & Schema
          </Link>
        </div>
      </section>

    </div>
  );
}

