import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Users, 
  Database, 
  BarChart2, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  FileText, 
  LogOut, 
  Eye, 
  Lock, 
  TrendingUp, 
  MapPin, 
  IndianRupee, 
  Layers,
  Calendar,
  X,
  Clock,
  Compass,
  AlertTriangle,
  Hotel,
  Utensils,
  Car,
  Ticket,
  Sparkles
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { travelApi } from '../services/api';
import { useTrip } from '../context/TripContext';

const PIE_COLORS = ['#0284c7', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];

export default function AdminDashboardPage() {
  const { adminUser, adminToken, logoutAdmin } = useTrip();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'users', 'audit'

  // Admin Data States
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Users Management State
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [userQuery, setUserQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [loadingUserDetail, setLoadingUserDetail] = useState(false);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Status message
  const [actionMsg, setActionMsg] = useState(null);

  // Security guard: If no admin session, redirect to /admin/login
  useEffect(() => {
    if (!adminToken || !adminUser || adminUser.role !== 'admin') {
      navigate('/admin/login');
    }
  }, [adminToken, adminUser, navigate]);

  // Load Dashboard Stats
  useEffect(() => {
    if (activeTab === 'dashboard') {
      loadStats();
    } else if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'audit') {
      loadAuditLogs();
    }
  }, [activeTab]);

  const loadStats = async () => {
    try {
      setLoadingStats(true);
      const data = await travelApi.getAdminStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const params = {};
      if (userQuery.trim()) params.query = userQuery.trim();
      if (roleFilter) params.role = roleFilter;
      if (statusFilter !== '') params.is_active = statusFilter === 'active';

      const data = await travelApi.getAdminUsers(params);
      setUsers(data.users || []);
      setTotalUsers(data.total || 0);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadAuditLogs = async () => {
    try {
      setLoadingLogs(true);
      const data = await travelApi.getAdminAuditLogs();
      setAuditLogs(data.logs || []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleViewUser = async (userId) => {
    try {
      setLoadingUserDetail(true);
      const detail = await travelApi.getAdminUserDetail(userId);
      setSelectedUserDetail(detail);
    } catch (err) {
      alert('Could not load user detail.');
    } finally {
      setLoadingUserDetail(false);
    }
  };

  const handleToggleUserStatus = async (userObj) => {
    const newStatus = !userObj.is_active;
    const confirmMsg = `Are you sure you want to ${newStatus ? 'ACTIVATE' : 'DEACTIVATE'} account ${userObj.email}?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await travelApi.updateAdminUserStatus(userObj.id, newStatus, `Admin toggle via dashboard`);
      setActionMsg(`Account ${userObj.email} successfully ${newStatus ? 'activated' : 'deactivated'}.`);
      setTimeout(() => setActionMsg(null), 3000);
      loadUsers();
      if (selectedUserDetail && selectedUserDetail.user.id === userObj.id) {
        setSelectedUserDetail({
          ...selectedUserDetail,
          user: { ...selectedUserDetail.user, is_active: newStatus }
        });
      }
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update user status.');
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-20">
      
      {/* Admin Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-sky-600/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-white text-base tracking-tight block leading-none">
                Travel <span className="text-sky-400">Mate</span> <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 ml-1">Admin</span>
              </span>
              <span className="text-[10px] text-slate-400 block mt-1 uppercase tracking-wider font-semibold">
                Control Portal
              </span>
            </div>
          </div>

          {/* Admin Navigation Tabs */}
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'users'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              User Management
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'audit'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Audit Logs
            </button>
          </nav>

          {/* Admin User Info & Logout */}
          <div className="flex items-center space-x-3">
            <span className="text-xs text-slate-400 hidden sm:inline">
              Signed in as <strong className="text-slate-200">{adminUser?.name}</strong>
            </span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold border border-rose-500/30 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {actionMsg && (
          <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionMsg}</span>
          </div>
        )}

        {/* 1. DASHBOARD OVERVIEW TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            
            {/* KPI Cards */}
            {stats && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-xs">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Users</p>
                  <p className="text-3xl font-black text-white mt-1">{stats.total_users}</p>
                  <p className="text-[10px] text-slate-400 mt-1">Platform registered</p>
                </div>

                <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-xs">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Active Users</p>
                  <p className="text-3xl font-black text-emerald-400 mt-1">{stats.active_users}</p>
                  <p className="text-[10px] text-emerald-500/80 mt-1">Enabled accounts</p>
                </div>

                <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-xs">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-rose-400">Inactive Users</p>
                  <p className="text-3xl font-black text-rose-400 mt-1">{stats.inactive_users ?? (stats.total_users - stats.active_users)}</p>
                  <p className="text-[10px] text-rose-500/80 mt-1">Deactivated accounts</p>
                </div>

                <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-xs">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-sky-400">Total Saved Trips</p>
                  <p className="text-3xl font-black text-sky-400 mt-1">{stats.total_trips}</p>
                  <p className="text-[10px] text-slate-400 mt-1">Stored in SQLite</p>
                </div>

                <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-xs">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Total Destinations</p>
                  <p className="text-3xl font-black text-amber-400 mt-1">{stats.total_destinations}</p>
                  <p className="text-[10px] text-slate-400 mt-1">32 Indian States</p>
                </div>
              </div>
            )}

            {/* Charts Row */}
            {stats && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Most Selected Interests */}
                <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-sky-400" />
                    <span>Most Selected Travel Interests</span>
                  </h3>
                  <div className="h-64 w-full">
                    {stats.most_selected_interests?.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={stats.most_selected_interests.slice(0, 6)}
                          margin={{ top: 10, right: 10, left: -20, bottom: 30 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                          <XAxis dataKey="interest" tick={{ fontSize: 10, fill: '#94a3b8' }} angle={-20} textAnchor="end" />
                          <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', fontSize: '11px' }} />
                          <Bar dataKey="count" fill="#0284c7" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-xs text-slate-500 text-center py-20">No user interest records yet.</p>
                    )}
                  </div>
                </div>

                {/* Budget Distribution */}
                <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-emerald-400" />
                    <span>User Budget Preferences Distribution</span>
                  </h3>
                  <div className="h-64 w-full flex items-center justify-center">
                    {stats.budget_distribution?.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats.budget_distribution}
                            cx="50%"
                            cy="50%"
                            outerRadius={75}
                            dataKey="count"
                            nameKey="tier"
                            label={({ tier, count }) => `${tier} (${count})`}
                          >
                            {stats.budget_distribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', fontSize: '11px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-xs text-slate-500 text-center py-20">No budget records yet.</p>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* Top 5 Destinations Leaderboard & State Stats */}
            {stats && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Top Destinations */}
                <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                    <span>Top 5 Destinations by Bayesian Popularity</span>
                  </h3>
                  <div className="space-y-2">
                    {stats.top_popular_destinations?.map((d) => (
                      <div key={d.id} className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/50 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-white">#{d.popularity_rank} {d.name}</p>
                          <p className="text-[11px] text-slate-400">{d.city}, {d.state} • {d.type}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-sky-400">{d.bayesian_weighted_rating}</span>
                          <span className="text-[10px] text-slate-500 block">{d.total_reviews.toLocaleString()} reviews</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* State Tourism Statistics */}
                <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-teal-400" />
                    <span>State-wise Attraction Count (Dataset)</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {stats.state_tourism_statistics?.map((st) => (
                      <div key={st.state} className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-700/50 flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-medium truncate">{st.state}</span>
                        <span className="font-bold text-teal-400">{st.attractions} sites</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

        {/* 2. USER MANAGEMENT TAB */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Search & Filters */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  placeholder="Search user by name or email..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-sky-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-hidden"
                >
                  <option value="">All Roles</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-hidden"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Deactivated</option>
                </select>

                <button
                  onClick={loadUsers}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold"
                >
                  Filter
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl overflow-hidden shadow-xs">
              <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Registered Accounts ({totalUsers})
                </h3>
                <span className="text-[11px] text-slate-400">Passwords & tokens strictly hidden</span>
              </div>

              {loadingUsers ? (
                <p className="text-xs text-slate-400 py-12 text-center">Loading users...</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3 px-3">User ID</th>
                        <th className="py-3 px-4">Name</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-3">Registered</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-4">Travel Interests</th>
                        <th className="py-3 px-3">Budget</th>
                        <th className="py-3 px-3">Duration</th>
                        <th className="py-3 px-3 text-center">Saved Trips</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/60">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-700/30 transition-colors">
                          <td className="py-3 px-3 font-mono font-bold text-slate-400">
                            #{u.id}
                          </td>
                          <td className="py-3 px-4 font-bold text-white">
                            {u.name}
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-300">
                            {u.email}
                          </td>
                          <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                            {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              u.is_active ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                            }`}>
                              {u.is_active ? 'Active' : 'Deactivated'}
                            </span>
                          </td>
                          <td className="py-3 px-4 max-w-[200px]">
                            {u.interests && u.interests.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {u.interests.slice(0, 2).map((item, i) => (
                                  <span key={i} className="px-1.5 py-0.5 rounded bg-sky-950/80 border border-sky-800/80 text-[10px] text-sky-300 truncate max-w-[120px]">
                                    {item}
                                  </span>
                                ))}
                                {u.interests.length > 2 && (
                                  <span className="text-[10px] text-slate-400 font-semibold self-center">
                                    +{u.interests.length - 2}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-500 italic text-[11px]">Not configured</span>
                            )}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            {u.budget_tier && u.budget_tier !== 'Not set' ? (
                              <span className="font-semibold text-emerald-400">{u.budget_tier}</span>
                            ) : (
                              <span className="text-slate-500 italic text-[11px]">Not set</span>
                            )}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            {u.duration_tier && u.duration_tier !== 'Not set' ? (
                              <span className="font-semibold text-purple-300">{u.duration_tier}</span>
                            ) : (
                              <span className="text-slate-500 italic text-[11px]">Not set</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-sky-400 font-bold text-[11px]">
                              {u.saved_trips_count || 0}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                            <button
                              onClick={() => handleViewUser(u.id)}
                              className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-[11px] font-semibold transition-colors"
                            >
                              Inspect Details
                            </button>
                            {u.id !== adminUser?.id && (
                              <button
                                onClick={() => handleToggleUserStatus(u)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                                  u.is_active
                                    ? 'bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800'
                                    : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800'
                                }`}
                              >
                                {u.is_active ? 'Deactivate' : 'Activate'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* 3. AUDIT LOGS TAB */}
        {activeTab === 'audit' && (
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl overflow-hidden shadow-xs space-y-4 animate-in fade-in duration-200">
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Administrative Audit Logs</h3>
                <p className="text-[11px] text-slate-400">Chronological trail of administrative operations and status changes.</p>
              </div>
              <button
                onClick={loadAuditLogs}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Refresh Logs</span>
              </button>
            </div>

            {loadingLogs ? (
              <p className="text-xs text-slate-400 py-12 text-center">Loading audit logs...</p>
            ) : auditLogs.length === 0 ? (
              <p className="text-xs text-slate-500 py-12 text-center">No audit logs recorded yet.</p>
            ) : (
              <div className="overflow-x-auto p-4">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Timestamp</th>
                      <th className="py-2.5 px-3">Action</th>
                      <th className="py-2.5 px-3">Admin</th>
                      <th className="py-2.5 px-3">Target User ID</th>
                      <th className="py-2.5 px-3">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60 font-mono text-[11px]">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-700/30">
                        <td className="py-2.5 px-3 text-slate-400">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-sky-400">
                          {log.action}
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">
                          {log.admin_email}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">
                          {log.target_user_id ? `#${log.target_user_id}` : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-300 font-sans text-xs">
                          {log.details}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </main>

      {/* User Details Modal */}
      {selectedUserDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="bg-slate-900 text-slate-100 border border-slate-700/80 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl relative space-y-6 my-8 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setSelectedUserDetail(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Information Header */}
            <div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-md">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white">{selectedUserDetail.user.name}</h3>
                    <span className="font-mono text-xs text-sky-400 bg-sky-950/80 border border-sky-800 px-2 py-0.5 rounded-md">
                      #{selectedUserDetail.user.id}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      selectedUserDetail.user.role === 'admin'
                        ? 'bg-purple-900/60 text-purple-300 border border-purple-700'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {selectedUserDetail.user.role.toUpperCase()}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      selectedUserDetail.user.is_active
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}>
                      {selectedUserDetail.user.is_active ? 'Active' : 'Deactivated'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedUserDetail.user.email}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Registered</span>
                  <span className="text-slate-300 font-medium">
                    {selectedUserDetail.user.created_at ? new Date(selectedUserDetail.user.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Account Role</span>
                  <span className="text-slate-300 font-medium capitalize">{selectedUserDetail.user.role}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Saved Itineraries</span>
                  <span className="text-sky-400 font-bold">{selectedUserDetail.saved_trips?.length || 0} Trips</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Status</span>
                  <span className={selectedUserDetail.user.is_active ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                    {selectedUserDetail.user.is_active ? 'Active' : 'Deactivated'}
                  </span>
                </div>
              </div>
            </div>

            {/* Travel Preferences Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-sky-400" />
                <span>Travel Preferences</span>
              </h4>

              {selectedUserDetail.preferences ? (
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block font-semibold flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-amber-400" />
                        <span>Starting Location</span>
                      </span>
                      <p className="font-bold text-white mt-1">
                        {selectedUserDetail.preferences.starting_city}, {selectedUserDetail.preferences.starting_state}
                      </p>
                    </div>

                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block font-semibold flex items-center gap-1">
                        <IndianRupee className="w-3 h-3 text-emerald-400" />
                        <span>Budget</span>
                      </span>
                      <p className="font-bold text-emerald-400 mt-1">
                        ₹{selectedUserDetail.preferences.budget_amount?.toLocaleString() || selectedUserDetail.preferences.budget_tier}
                      </p>
                      <span className="text-[10px] text-slate-400 block">{selectedUserDetail.preferences.budget_tier}</span>
                    </div>

                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-purple-400" />
                        <span>Travel Duration</span>
                      </span>
                      <p className="font-bold text-purple-300 mt-1">
                        {selectedUserDetail.preferences.duration_days} Days
                      </p>
                      <span className="text-[10px] text-slate-400 block">{selectedUserDetail.preferences.duration_tier}</span>
                    </div>

                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block font-semibold flex items-center gap-1">
                        <Users className="w-3 h-3 text-teal-400" />
                        <span>Group & Season</span>
                      </span>
                      <p className="font-bold text-white mt-1">
                        {selectedUserDetail.preferences.companion_type}
                      </p>
                      <span className="text-[10px] text-slate-400 block truncate">{selectedUserDetail.preferences.travel_month_or_season}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1.5">Selected Travel Interests:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedUserDetail.preferences.interests?.map((item, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-lg bg-sky-950 border border-sky-800 text-sky-300 text-xs font-medium">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 text-center text-xs text-slate-500 italic">
                  This user has not configured travel preferences yet.
                </div>
              )}
            </div>

            {/* Saved Itineraries Section with Full Day-wise Breakdown & Financials */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Saved Itineraries in SQLite ({selectedUserDetail.saved_trips?.length || 0})</span>
              </h4>

              {selectedUserDetail.saved_trips && selectedUserDetail.saved_trips.length > 0 ? (
                <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                  {selectedUserDetail.saved_trips.map((t) => {
                    const days = Array.isArray(t.itinerary) ? t.itinerary : (t.itinerary?.days || []);

                    return (
                      <div key={t.id} className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                        
                        {/* Trip Summary Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-bold text-sm text-white">{t.title}</h5>
                              <span className="px-2 py-0.5 rounded-full bg-sky-950 border border-sky-800 text-[10px] text-sky-400 font-bold">
                                {t.duration_days} Days
                              </span>
                              {t.is_budget_sufficient === false && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-950 border border-amber-800 text-[10px] text-amber-400 font-bold">
                                  Exceeds Budget
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Saved on {t.created_at ? new Date(t.created_at).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block font-medium">Projected Cost</span>
                            <span className="font-bold text-sm text-sky-400">₹{t.total_estimated_cost?.toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Itemized Estimated Expenses */}
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Itemized Estimated Expenses:</p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                            <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/80">
                              <span className="text-[10px] text-slate-500 block">🏨 Accommodation</span>
                              <span className="font-bold text-slate-200">₹{t.estimated_accommodation?.toLocaleString()}</span>
                            </div>
                            <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/80">
                              <span className="text-[10px] text-slate-500 block">🍽️ Food & Dining</span>
                              <span className="font-bold text-slate-200">₹{t.estimated_food?.toLocaleString()}</span>
                            </div>
                            <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/80">
                              <span className="text-[10px] text-slate-500 block">🚗 Local Transit</span>
                              <span className="font-bold text-slate-200">₹{t.estimated_transport?.toLocaleString()}</span>
                            </div>
                            <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/80">
                              <span className="text-[10px] text-slate-500 block">🎟️ Entrance Fees</span>
                              <span className="font-bold text-slate-200">₹{t.estimated_entrance_fees?.toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="mt-2 p-2.5 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                            <span>Total Budget: <strong className="text-emerald-400">₹{t.total_budget?.toLocaleString()}</strong></span>
                            <span>Remaining Surplus: <strong className={t.remaining_budget >= 0 ? 'text-emerald-400' : 'text-rose-400'}>₹{t.remaining_budget?.toLocaleString()}</strong></span>
                          </div>
                        </div>

                        {/* Day-wise Destination Details */}
                        {days && days.length > 0 && (
                          <div className="space-y-2 pt-1 border-t border-slate-800/80">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Day-Wise Scheduled Attractions:</p>
                            <div className="space-y-2">
                              {days.map((dayPlan, dIdx) => {
                                const m = dayPlan.morning?.destination || dayPlan.morning;
                                const a = dayPlan.afternoon?.destination || dayPlan.afternoon;
                                const e = dayPlan.evening?.destination || dayPlan.evening;

                                return (
                                  <div key={dIdx} className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-xs space-y-1.5">
                                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                                      <span>Day {dayPlan.day || dIdx + 1}</span>
                                      {dayPlan.day_entrance_fee !== undefined && (
                                        <span className="text-[10px] text-slate-500 font-normal">Day Entry Fees: ₹{dayPlan.day_entrance_fee}</span>
                                      )}
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                                      <div className="p-2 bg-slate-950 rounded-lg border border-slate-800/60">
                                        <span className="text-[10px] text-amber-400 font-bold block">🌅 Morning</span>
                                        {m ? (
                                          <div className="mt-0.5">
                                            <p className="font-semibold text-slate-200 truncate">{m.name}</p>
                                            <p className="text-[10px] text-slate-500 truncate">{m.city}, {m.state} • {m.type}</p>
                                            <p className="text-[10px] text-sky-400 mt-0.5">{m.rating || m.google_review_rating}★ • ₹{m.entrance_fee_inr || 0}</p>
                                          </div>
                                        ) : (
                                          <p className="text-[10px] text-slate-600 italic">Self-guided leisure</p>
                                        )}
                                      </div>

                                      <div className="p-2 bg-slate-950 rounded-lg border border-slate-800/60">
                                        <span className="text-[10px] text-sky-400 font-bold block">☀️ Afternoon</span>
                                        {a ? (
                                          <div className="mt-0.5">
                                            <p className="font-semibold text-slate-200 truncate">{a.name}</p>
                                            <p className="text-[10px] text-slate-500 truncate">{a.city}, {a.state} • {a.type}</p>
                                            <p className="text-[10px] text-sky-400 mt-0.5">{a.rating || a.google_review_rating}★ • ₹{a.entrance_fee_inr || 0}</p>
                                          </div>
                                        ) : (
                                          <p className="text-[10px] text-slate-600 italic">Free exploration</p>
                                        )}
                                      </div>

                                      <div className="p-2 bg-slate-950 rounded-lg border border-slate-800/60">
                                        <span className="text-[10px] text-purple-400 font-bold block">🌇 Evening</span>
                                        {e ? (
                                          <div className="mt-0.5">
                                            <p className="font-semibold text-slate-200 truncate">{e.name}</p>
                                            <p className="text-[10px] text-slate-500 truncate">{e.city}, {e.state} • {e.type}</p>
                                            <p className="text-[10px] text-sky-400 mt-0.5">{e.rating || e.google_review_rating}★ • ₹{e.entrance_fee_inr || 0}</p>
                                          </div>
                                        ) : (
                                          <p className="text-[10px] text-slate-600 italic">Evening dining & stroll</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 text-center text-xs text-slate-500 italic">
                  This user has not saved any trip itineraries in SQLite yet.
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
