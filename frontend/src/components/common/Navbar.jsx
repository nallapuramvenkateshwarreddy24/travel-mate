import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Compass, 
  MapPin, 
  TrendingUp, 
  Calendar, 
  Layers, 
  BookmarkCheck, 
  ShieldCheck, 
  Menu, 
  X,
  User,
  Map,
  Sliders,
  LogOut
} from 'lucide-react';
import { useTrip } from '../../context/TripContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentTrip, user, logout } = useTrip();

  const navLinks = [
    { name: 'Home', path: '/home' },
    { name: 'My Preferences', path: '/preferences' },
    { name: 'Explore Destinations', path: '/explore' },
    { name: 'Top 10', path: '/popular' },
    { name: 'State-wise', path: '/state-wise' },
    { name: 'City-wise', path: '/city-wise' },
    { name: 'Categories', path: '/categories' },
    { name: 'Seasonal', path: '/seasonal' },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Tagline */}
          <Link to="/home" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 block leading-none">
                Travel <span className="text-sky-600">Mate</span>
              </span>
              <span className="text-[10px] font-medium tracking-wide text-slate-500 block mt-1 uppercase">
                Discover Places. Explore Experiences.
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  isActive(link.path)
                    ? 'bg-sky-50 text-sky-700 font-bold'
                    : 'text-slate-600 hover:text-sky-600 hover:bg-slate-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Action Icons & Trip Planner Badge */}
          <div className="hidden lg:flex items-center space-x-3">
            <Link
              to="/planner"
              className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 border border-sky-200/60 text-sky-700 text-xs font-semibold hover:bg-sky-100 transition-colors"
            >
              <Map className="w-4 h-4 text-sky-600" />
              <span>Trip Planner</span>
              {currentTrip.length > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-extrabold leading-none text-white bg-sky-600 rounded-full animate-bounce">
                  {currentTrip.length}
                </span>
              )}
            </Link>

            <Link
              to="/my-trips"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-sky-600 text-xs font-medium hover:bg-slate-50 transition-colors"
            >
              <BookmarkCheck className="w-4 h-4" />
              <span>My Trips</span>
            </Link>

            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                  {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors shadow-xs"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )}

            <Link
              to="/admin"
              className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-slate-400 hover:text-slate-700 text-[11px] font-medium hover:bg-slate-100 transition-colors"
              title="Admin Portal"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link
              to="/planner"
              className="relative p-2 text-sky-600 bg-sky-50 rounded-lg"
              aria-label="Trip Planner"
            >
              <Map className="w-5 h-5" />
              {currentTrip.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-sky-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                  {currentTrip.length}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg animate-in fade-in duration-150">
          <div className="grid grid-cols-2 gap-2 pb-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg text-xs font-medium ${
                  isActive(link.path)
                    ? 'bg-sky-50 text-sky-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="border-t border-slate-100 pt-3 space-y-2">
            <Link
              to="/planner"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-sky-700 bg-sky-50"
            >
              <div className="flex items-center gap-2">
                <Map className="w-4 h-4 text-sky-600" />
                <span>Trip Planner</span>
              </div>
              <span className="bg-sky-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                {currentTrip.length} Places
              </span>
            </Link>

            <Link
              to="/my-trips"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <BookmarkCheck className="w-4 h-4 text-slate-500" />
              <span>My Saved Trips</span>
            </Link>

            {user ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg bg-rose-50 text-rose-700 text-xs font-bold"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out ({user.name})</span>
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold"
              >
                <User className="w-4 h-4" />
                <span>Sign In / Create Account</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
