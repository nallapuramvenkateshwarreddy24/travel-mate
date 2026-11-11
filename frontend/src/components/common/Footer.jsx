import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Sparkles, ExternalLink, Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-teal-400 flex items-center justify-center text-white shadow-md">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Travel <span className="text-sky-400">Mate</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed font-light">
              <strong className="text-white font-medium">Discover Places. Explore Experiences.</strong>
              <br />
              India's premier popularity-ranked tourism guide, featuring 321 iconic attractions across 32 states and union territories.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-800/40 w-fit">
              <Sparkles className="w-3.5 h-3.5" />
              <span>100% Popularity-Based (Bayesian Ranking)</span>
            </div>
          </div>

          {/* Quick Discover Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Discover</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/explore" className="hover:text-white transition-colors">Explore All 321 Destinations</Link>
              </li>
              <li>
                <Link to="/popular" className="hover:text-white transition-colors">Top 10 Indian Attractions</Link>
              </li>
              <li>
                <Link to="/state-wise" className="hover:text-white transition-colors">State-Wise Recommendations</Link>
              </li>
              <li>
                <Link to="/city-wise" className="hover:text-white transition-colors">City-Wise Highlights</Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-white transition-colors">Browse by Category (Temples, Forts, Beaches)</Link>
              </li>
              <li>
                <Link to="/seasonal" className="hover:text-white transition-colors">Best Time to Visit (Morning, Evening, All Day)</Link>
              </li>
            </ul>
          </div>

          {/* Planning & Account */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Tools & Itinerary</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/planner" className="hover:text-white transition-colors">Interactive Trip Planner</Link>
              </li>
              <li>
                <Link to="/my-trips" className="hover:text-white transition-colors">My Saved Trips (Browser Storage)</Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-white transition-colors">Admin & Analytics Dashboard</Link>
              </li>
              <li>
                <Link to="/auth" className="hover:text-white transition-colors">Account / Guest Session</Link>
              </li>
            </ul>
          </div>

          {/* Dataset Transparency & Integrity */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Data Integrity</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Curated from the verified Indian Tourist Attractions Dataset:
            </p>
            <a
              href="https://github.com/SampurnaK/indian-tourist-attractions-analysis"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 transition-colors font-medium break-all"
            >
              <span>GitHub: SampurnaK / indian-tourist-attractions-analysis</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            </a>
            <p className="text-[11px] text-slate-500 pt-2">
              Bayesian Mean Rating model:
              <br />
              <code className="text-slate-400 bg-slate-800 px-1 py-0.5 rounded text-[10px]">
                WR = (v / (v + 17,000)) * R + (17,000 / (v + 17,000)) * 4.4925
              </code>
            </p>
          </div>

        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Travel Mate. All actual dataset records preserved.</p>
          <p className="mt-2 sm:mt-0 flex items-center gap-2">
            <span>Powered by FastAPI & React + Tailwind CSS</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

