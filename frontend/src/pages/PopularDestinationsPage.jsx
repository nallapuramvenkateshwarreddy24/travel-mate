import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  Star, 
  MapPin, 
  BarChart2, 
  Clock, 
  IndianRupee, 
  Award,
  Info
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { travelApi } from '../services/api';
import DestinationCard from '../components/destinations/DestinationCard';

export default function PopularDestinationsPage() {
  const [topDestinations, setTopDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPopular() {
      try {
        setLoading(true);
        const data = await travelApi.getTopPopular(10);
        setTopDestinations(data || []);
      } catch (err) {
        console.error('Failed to load top popular destinations:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPopular();
  }, []);

  // Format data for Recharts visualization
  const chartData = topDestinations.map((d) => ({
    name: d.name.length > 14 ? d.name.substring(0, 12) + '...' : d.name,
    fullName: d.name,
    bayesianScore: Number(d.bayesian_weighted_rating.toFixed(3)),
    rawRating: Number(d.rating.toFixed(2)),
    reviewsInLakhs: Number(d.reviews_lakhs.toFixed(2)),
    totalReviews: d.total_reviews,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold mb-3">
          <Award className="w-4 h-4 text-amber-600" />
          <span>Official Top 10 Indian Attractions</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          India's Top 10 Popular Destinations
        </h1>
        <p className="text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
          Determined strictly through <strong>Bayesian Weighted Rating ($WR$)</strong>. This formula evaluates both the destination's average Google review rating and visitor review volume against the national median ($m = 17,000$ votes, mean $C = 4.4925$).
        </p>
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-sky-600" />
              <span>Popularity Score vs Google Rating Comparison</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Visualizing how review volume stabilizes the Bayesian Weighted Rating across the Top 10.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <Info className="w-3.5 h-3.5 text-sky-600" />
            <span>Dataset: 321 attractions, 32 states</span>
          </div>
        </div>

        {/* Recharts Bar Chart */}
        <div className="h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 20, left: 0, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 11, fill: '#64748b' }} 
                interval={0}
                angle={-25}
                textAnchor="end"
              />
              <YAxis 
                domain={[4.4, 5.0]} 
                tick={{ fontSize: 11, fill: '#64748b' }} 
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1">
                        <p className="font-bold text-sky-300">{data.fullName}</p>
                        <p>Popularity Score ($WR$): <span className="font-bold text-emerald-400">{data.bayesianScore}</span></p>
                        <p>Google Review Rating: <span className="font-bold text-amber-400">{data.rawRating} ★</span></p>
                        <p>Total Reviews: <span className="font-bold">{data.totalReviews.toLocaleString()} ({data.reviewsInLakhs}L)</span></p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
              <Bar 
                dataKey="bayesianScore" 
                name="Bayesian Popularity Score" 
                fill="#0284c7" 
                radius={[6, 6, 0, 0]} 
              />
              <Bar 
                dataKey="rawRating" 
                name="Google Rating (Raw)" 
                fill="#f59e0b" 
                radius={[6, 6, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top 10 List Showcase */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-900">
          Ranked Leaderboard
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-72 rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {topDestinations.map((destination) => (
              <DestinationCard key={destination.id} destination={destination} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

