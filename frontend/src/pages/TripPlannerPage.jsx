import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Map, 
  Trash2, 
  Calendar, 
  Clock, 
  IndianRupee, 
  MapPin, 
  Sparkles, 
  BookmarkCheck, 
  ArrowRight,
  Download,
  Share2
} from 'lucide-react';
import { useTrip } from '../context/TripContext';

export default function TripPlannerPage() {
  const { currentTrip, removeFromTrip, clearTrip, saveCurrentTrip } = useTrip();
  const [tripTitle, setTripTitle] = useState('My India Tour');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Compute Trip Summary
  const totalHours = currentTrip.reduce((acc, d) => acc + (d.time_needed_hours || 1), 0);
  const totalFees = currentTrip.reduce((acc, d) => acc + (d.entrance_fee_inr || 0), 0);
  const uniqueStates = new Set(currentTrip.map((d) => d.state)).size;
  const uniqueCities = new Set(currentTrip.map((d) => d.city)).size;

  const handleSave = async () => {
    if (currentTrip.length === 0) return;
    try {
      await saveCurrentTrip(tripTitle);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      alert('Could not save trip.');
    }
  };

  const handleExportText = () => {
    const lines = [
      `TRAVEL MATE - TRIP ITINERARY: ${tripTitle.toUpperCase()}`,
      `Total Destinations: ${currentTrip.length}`,
      `States Covered: ${uniqueStates} | Cities: ${uniqueCities}`,
      `Total Estimated Time: ${totalHours.toFixed(1)} Hours`,
      `Total Entrance Fees: Rs. ${totalFees}`,
      `--------------------------------------------------`,
      ...currentTrip.map((d, i) => 
        `${i + 1}. ${d.name} (${d.city}, ${d.state})\n   - Category: ${d.type} | Rating: ${d.rating}★\n   - Time: ${d.time_needed_hours}h | Fee: Rs.${d.entrance_fee_inr} | Best Time: ${d.best_time_to_visit}`
      )
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tripTitle.toLowerCase().replace(/\s+/g, '_')}_itinerary.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-xs font-bold mb-3">
          <Map className="w-4 h-4 text-sky-600" />
          <span>Personal Itinerary</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Interactive Trip Planner
        </h1>
        <p className="text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
          Assemble and manage your personalized travel route. All calculations (hours, fees, state distribution) are computed live from authentic dataset metrics.
        </p>
      </div>

      {currentTrip.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 max-w-xl mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-4">
            <Map className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Your trip itinerary is empty</h2>
          <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
            Browse through India's popular destinations, state highlights, or explore the catalog to add attractions to your itinerary.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/explore"
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors shadow-xs"
            >
              Browse Destinations
            </Link>
            <Link
              to="/popular"
              className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
            >
              View Top 10
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left 2 Cols: Destination List */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <input
                type="text"
                value={tripTitle}
                onChange={(e) => setTripTitle(e.target.value)}
                placeholder="Give your trip a title..."
                className="w-full sm:max-w-md px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              />
              <button
                onClick={clearTrip}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All ({currentTrip.length})</span>
              </button>
            </div>

            <div className="space-y-3">
              {currentTrip.map((destination, index) => (
                <div
                  key={destination.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between gap-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-xl bg-sky-100 text-sky-800 text-xs font-black flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <div>
                      <Link
                        to={`/destinations/${destination.id}`}
                        className="text-sm font-bold text-slate-900 hover:text-sky-600 transition-colors"
                      >
                        {destination.name}
                      </Link>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-sky-500" />
                          <span>{destination.city}, {destination.state}</span>
                        </span>
                        <span>•</span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-semibold text-slate-700">
                          {destination.type}
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-amber-600">
                          ★ {destination.rating}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right text-xs hidden sm:block">
                      <p className="font-semibold text-slate-800">
                        {destination.entrance_fee_inr === 0 ? 'Free' : `₹${destination.entrance_fee_inr}`}
                      </p>
                      <p className="text-[11px] text-slate-400">{destination.time_needed_hours}h duration</p>
                    </div>

                    <button
                      onClick={() => removeFromTrip(destination.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remove from itinerary"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Right Col: Trip Summary & Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
              <h2 className="text-lg font-bold text-slate-900">Trip Overview</h2>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Total Attractions</span>
                  <span className="font-bold text-slate-900">{currentTrip.length}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">States Covered</span>
                  <span className="font-bold text-slate-900">{uniqueStates}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Cities Covered</span>
                  <span className="font-bold text-slate-900">{uniqueCities}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Total Estimated Duration</span>
                  <span className="font-bold text-slate-900">{totalHours.toFixed(1)} Hours</span>
                </div>
                <div className="flex justify-between py-2 text-sm pt-2">
                  <span className="font-bold text-slate-800">Total Entrance Fees</span>
                  <span className="font-extrabold text-sky-700">₹{totalFees}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleSave}
                  className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-md shadow-sky-600/20 flex items-center justify-center gap-2"
                >
                  <BookmarkCheck className="w-4 h-4" />
                  <span>{savedSuccess ? 'Saved to My Trips!' : 'Save Itinerary'}</span>
                </button>

                <button
                  onClick={handleExportText}
                  className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Text Itinerary</span>
                </button>
              </div>

              <div className="pt-2 text-[11px] text-slate-400 text-center">
                Saved trips are stored in your local browser storage.
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

