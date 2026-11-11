import React, { createContext, useContext, useState, useEffect } from 'react';
import { travelApi } from '../services/api';

const TripContext = createContext();

export function TripProvider({ children }) {
  // Current user token & profile
  const [token, setToken] = useState(() => {
    const raw = localStorage.getItem('travel_mate_token');
    return raw ? raw.replace(/^"(.*)"$/, '$1').trim() : null;
  });
  const [user, setUser] = useState(() => {
    try {
      const rawToken = localStorage.getItem('travel_mate_token');
      const saved = localStorage.getItem('travel_mate_user');
      return (rawToken && saved) ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Admin token & profile
  const [adminToken, setAdminToken] = useState(() => {
    const raw = localStorage.getItem('travel_mate_admin_token');
    return raw ? raw.replace(/^"(.*)"$/, '$1').trim() : null;
  });
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const rawToken = localStorage.getItem('travel_mate_admin_token');
      const saved = localStorage.getItem('travel_mate_admin_user');
      return (rawToken && saved) ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Current active trip planner destinations (quick builder)
  const [currentTrip, setCurrentTrip] = useState(() => {
    try {
      const saved = localStorage.getItem('travel_mate_current_trip');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Saved trip itineraries from database or local storage
  const [savedTrips, setSavedTrips] = useState(() => {
    try {
      const saved = localStorage.getItem('travel_mate_saved_trips_local');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [loadingTrips, setLoadingTrips] = useState(false);

  // User preferences from database
  const [userPreferences, setUserPreferences] = useState(null);

  useEffect(() => {
    localStorage.setItem('travel_mate_current_trip', JSON.stringify(currentTrip));
  }, [currentTrip]);

  // Load user trips and preferences from backend whenever user is authenticated
  useEffect(() => {
    if (token) {
      fetchUserTrips();
      fetchUserPreferences();
    } else {
      setSavedTrips([]);
      setUserPreferences(null);
    }
  }, [token]);

  const fetchUserTrips = async () => {
    try {
      setLoadingTrips(true);
      const data = await travelApi.getMyTrips();
      setSavedTrips(data || []);
    } catch (err) {
      console.warn('Could not fetch server trips:', err);
    } finally {
      setLoadingTrips(false);
    }
  };

  const fetchUserPreferences = async () => {
    try {
      const data = await travelApi.getPreferences();
      setUserPreferences(data || null);
    } catch (err) {
      // 404 is normal if preferences haven't been saved yet
      setUserPreferences(null);
    }
  };

  // Auth actions
  const login = async (email, password) => {
    const data = await travelApi.login(email, password);
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('travel_mate_token', data.access_token);
    localStorage.setItem('travel_mate_user', JSON.stringify(data.user));
    return data;
  };

  const register = async (email, name, password) => {
    const data = await travelApi.register(email, name, password);
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('travel_mate_token', data.access_token);
    localStorage.setItem('travel_mate_user', JSON.stringify(data.user));
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setUserPreferences(null);
    setSavedTrips([]);
    localStorage.removeItem('travel_mate_token');
    localStorage.removeItem('travel_mate_user');
  };

  // Admin auth actions
  const loginAdmin = async (email, password) => {
    const data = await travelApi.adminLogin(email, password);
    setAdminToken(data.access_token);
    setAdminUser(data.user);
    localStorage.setItem('travel_mate_admin_token', data.access_token);
    localStorage.setItem('travel_mate_admin_user', JSON.stringify(data.user));
    return data;
  };

  const logoutAdmin = () => {
    setAdminToken(null);
    setAdminUser(null);
    localStorage.removeItem('travel_mate_admin_token');
    localStorage.removeItem('travel_mate_admin_user');
  };

  // Trip planner helpers
  const addToTrip = (destination) => {
    if (!currentTrip.some((item) => item.id === destination.id)) {
      setCurrentTrip([...currentTrip, destination]);
      return true;
    }
    return false;
  };

  const removeFromTrip = (destinationId) => {
    setCurrentTrip(currentTrip.filter((item) => item.id !== destinationId));
  };

  const clearTrip = () => {
    setCurrentTrip([]);
  };

  const isInTrip = (destinationId) => {
    return currentTrip.some((item) => item.id === destinationId);
  };

  const saveTripToDatabase = async (title, itineraryData) => {
    try {
      const saved = await travelApi.saveItinerary(title, itineraryData);
      setSavedTrips((prev) => [saved, ...prev.filter((t) => t.id !== saved.id)]);
      return saved;
    } catch (err) {
      console.error('Failed to save trip to database:', err);
      throw err;
    }
  };

  const deleteSavedTrip = async (tripId) => {
    try {
      if (token && typeof tripId === 'number' && tripId < 1000000000000) {
        await travelApi.deleteTrip(tripId);
      }
    } catch (err) {
      console.warn('Could not delete trip from server:', err);
    }
    setSavedTrips((prev) => {
      const updated = prev.filter((t) => t.id !== tripId);
      localStorage.setItem('travel_mate_saved_trips_local', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteTripFromDatabase = deleteSavedTrip;

  const saveCurrentTrip = async (title = 'My India Tour') => {
    if (currentTrip.length === 0) return null;
    const totalFees = currentTrip.reduce((acc, d) => acc + (d.entrance_fee_inr || 0), 0);
    const totalHours = currentTrip.reduce((acc, d) => acc + (d.time_needed_hours || 1), 0);
    const durationDays = Math.max(1, Math.ceil(currentTrip.length / 3));

    // Construct day structure
    const days = [];
    for (let dayIdx = 0; dayIdx < durationDays; dayIdx++) {
      const morningD = currentTrip[dayIdx * 3] || null;
      const afternoonD = currentTrip[dayIdx * 3 + 1] || null;
      const eveningD = currentTrip[dayIdx * 3 + 2] || null;
      const dayFee = (morningD?.entrance_fee_inr || 0) + (afternoonD?.entrance_fee_inr || 0) + (eveningD?.entrance_fee_inr || 0);

      days.push({
        day: dayIdx + 1,
        day_entrance_fee: dayFee,
        morning: morningD ? { destination: morningD, visiting_hours: morningD.time_needed_hours || 2, est_travel_cost: 250 } : null,
        afternoon: afternoonD ? { destination: afternoonD, visiting_hours: afternoonD.time_needed_hours || 2, est_travel_cost: 250 } : null,
        evening: eveningD ? { destination: eveningD, visiting_hours: eveningD.time_needed_hours || 2, est_travel_cost: 250 } : null,
      });
    }

    const estStay = durationDays * 2200;
    const estFood = durationDays * 1200;
    const estTransit = durationDays * 800;
    const estTotal = estStay + estFood + estTransit + totalFees;
    const budget = estTotal + 2500;

    const itineraryData = {
      title: title || 'Custom India Tour',
      duration_days: durationDays,
      starting_state: currentTrip[0]?.state || 'India',
      starting_city: currentTrip[0]?.city || 'Multi-city',
      companion_type: 'Custom',
      travel_month_or_season: 'All Year',
      financials: {
        total_budget: budget,
        estimated_accommodation: estStay,
        estimated_food: estFood,
        estimated_transport: estTransit,
        estimated_entrance_fees: totalFees,
        total_estimated_cost: estTotal,
        remaining_budget: budget - estTotal,
        is_budget_sufficient: true,
        disclaimer: 'Estimated figures calculated based on selected destinations and duration.'
      },
      days
    };

    if (token) {
      try {
        const saved = await travelApi.saveItinerary(title, itineraryData);
        setSavedTrips((prev) => [saved, ...prev.filter((t) => t.id !== saved.id)]);
        return saved;
      } catch (err) {
        console.warn('Could not save to server DB, saving locally:', err);
      }
    }

    const localTrip = {
      id: Date.now(),
      title: title || 'Custom India Tour',
      created_at: new Date().toISOString(),
      duration_days: durationDays,
      total_budget: budget,
      estimated_accommodation: estStay,
      estimated_food: estFood,
      estimated_transport: estTransit,
      estimated_entrance_fees: totalFees,
      total_estimated_cost: estTotal,
      remaining_budget: budget - estTotal,
      is_budget_sufficient: true,
      itinerary: days,
      destinations: [...currentTrip],
      totalFee: totalFees,
      totalHours: totalHours
    };

    setSavedTrips((prev) => {
      const updated = [localTrip, ...prev];
      localStorage.setItem('travel_mate_saved_trips_local', JSON.stringify(updated));
      return updated;
    });
    return localTrip;
  };

  return (
    <TripContext.Provider
      value={{
        token,
        user,
        adminToken,
        adminUser,
        currentTrip,
        savedTrips,
        loadingTrips,
        userPreferences,
        setUserPreferences,
        login,
        register,
        logout,
        loginAdmin,
        logoutAdmin,
        addToTrip,
        removeFromTrip,
        clearTrip,
        isInTrip,
        saveTripToDatabase,
        saveCurrentTrip,
        deleteSavedTrip,
        deleteTripFromDatabase,
        fetchUserTrips,
        fetchUserPreferences,
      }}
    >
      {children}
    </TripContext.Provider>
  );
}

export function useTrip() {
  return useContext(TripContext);
}
