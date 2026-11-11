import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { TripProvider, useTrip } from './context/TripContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

// Pages
import AuthPage from './pages/AuthPage';
import PreferencesPage from './pages/PreferencesPage';
import ItineraryPage from './pages/ItineraryPage';
import UserDashboardPage from './pages/UserDashboardPage';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import PopularDestinationsPage from './pages/PopularDestinationsPage';
import StateRecommendationsPage from './pages/StateRecommendationsPage';
import CityRecommendationsPage from './pages/CityRecommendationsPage';
import CategoryRecommendationsPage from './pages/CategoryRecommendationsPage';
import SeasonalRecommendationsPage from './pages/SeasonalRecommendationsPage';
import DestinationDetailPage from './pages/DestinationDetailPage';
import TripPlannerPage from './pages/TripPlannerPage';
import MyTripsPage from './pages/MyTripsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminLoginPage from './pages/AdminLoginPage';

function RootRoute() {
  const { user } = useTrip();
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  return <AuthPage />;
}

function ProtectedRoute({ children }) {
  const { user } = useTrip();
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function LayoutWrapper({ children }) {
  const location = useLocation();
  const hideNavFooter = ['/', '/login', '/register', '/admin/login'].includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased font-sans selection:bg-sky-500 selection:text-white">
      {!hideNavFooter && <Navbar />}
      <main className="flex-1">
        {children}
      </main>
      {!hideNavFooter && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <TripProvider>
      <Router>
        <LayoutWrapper>
          <Routes>
            {/* First Page when opening Travel Mate is Login & Registration */}
            <Route path="/" element={<RootRoute />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage />} />

            {/* Authenticated User Portal */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <UserDashboardPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/preferences"
              element={
                <ProtectedRoute>
                  <PreferencesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/itinerary"
              element={
                <ProtectedRoute>
                  <ItineraryPage />
                </ProtectedRoute>
              }
            />

            {/* Public and Portal Routes */}
            <Route path="/home" element={<HomePage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/popular" element={<PopularDestinationsPage />} />
            <Route path="/state-wise" element={<StateRecommendationsPage />} />
            <Route path="/city-wise" element={<CityRecommendationsPage />} />
            <Route path="/categories" element={<CategoryRecommendationsPage />} />
            <Route path="/seasonal" element={<SeasonalRecommendationsPage />} />
            <Route path="/destinations/:id" element={<DestinationDetailPage />} />
            <Route path="/planner" element={<TripPlannerPage />} />
            <Route path="/my-trips" element={<MyTripsPage />} />
            <Route path="/auth" element={<AuthPage />} />
            
            {/* Admin Portal */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </LayoutWrapper>
      </Router>
    </TripProvider>
  );
}
