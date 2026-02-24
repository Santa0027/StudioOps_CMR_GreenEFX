import React, { useState, useEffect } from 'react';
import AddUserForm from '../components/AddUserForm';
import Attendance from '../../hr/components/Attendance';
import MonthlyAttendanceCalendar from '../../hr/components/MonthlyAttendanceCalendar';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { getUsers, deleteUser, checkIn, checkOut, getAttendances } from '../../../shared/services/apiClient';
import { User, Clock, Calendar, Shield, Users as UsersIcon, LogIn, LogOut, CheckCircle2, Eye, Trash2, Info, Plus } from 'lucide-react';

function UserManagement() {
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); 
  const [apiUsers, setApiUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [myTodayAttendance, setMyTodayAttendance] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { user: currentUser } = useAuth();
  const isStaff = currentUser?.is_staff || false;
  const isManagerOrAdmin = currentUser?.groups?.some(g => ['Admin', 'Manager'].includes(g)) || isStaff;

  const fetchUsers = async () => {
    if (!isManagerOrAdmin) return;
    setLoading(true);
    setError(null);
    try {
      const response = await getUsers();
      setApiUsers(response.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyAttendance = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await getAttendances({ date: today });
      setMyTodayAttendance(response.data[0] || null);
    } catch (err) {
      console.error("Failed to fetch my attendance:", err);
    }
  };

  useEffect(() => {
    if (isManagerOrAdmin) {
      fetchUsers();
    } else {
      setActiveTab('my-attendance');
      setLoading(false);
    }
    fetchMyAttendance();
  }, [isManagerOrAdmin]);

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      await checkIn();
      await fetchMyAttendance();
      alert("Checked in successfully!");
    } catch (err) {
      alert(err.response?.data?.detail || "Check-in failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      await checkOut();
      await fetchMyAttendance();
      alert("Checked out successfully!");
    } catch (err) {
      alert(err.response?.data?.detail || "Check-out failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddUser = () => {
    setShowAddUserForm(false);
    fetchUsers(); 
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      await deleteUser(userId);
      fetchUsers(); 
    } catch (err) {
      console.error("Failed to delete user:", err);
      setError("Failed to delete user.");
    }
  };

  const filteredUsers = apiUsers.filter(u => {
    if (activeTab === 'all') return true;
    if (activeTab === 'managers') return u.groups && u.groups.some(g => g.name === 'Manager');
    if (activeTab === 'staff') return u.groups && u.groups.some(g => g.name === 'Staff');
    if (activeTab === 'admins') return u.groups && u.groups.some(g => g.name === 'Admin');
    return true;
  });

  const TabButton = ({ id, label, icon: Icon, count }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
        activeTab === id 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
      }`}
    >
      {Icon && <Icon size={16} />}
      {label}
      {count !== undefined && (
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === id ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-500'}`}>
          {count}
        </span>
      )}
    </button>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <UsersIcon className="text-blue-500" size={32} />
            Team & Attendance
          </h1>
          <p className="text-slate-400 mt-1">Manage team members and track daily presence.</p>
        </div>
        {isManagerOrAdmin && (
          <button
            onClick={() => setShowAddUserForm(true)}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 transition-all duration-200"
          >
            <Plus size={20} />
            Add New User
          </button>
        )}
      </header>

      {/* Daily Check-In Card */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-2xl ${myTodayAttendance?.check_in ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>
              <Clock size={32} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Daily Check-In</h2>
              <p className="text-sm text-slate-500">Today: {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {!myTodayAttendance?.check_in ? (
              <button 
                onClick={handleCheckIn}
                disabled={actionLoading}
                className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                <LogIn size={20} />
                Check In Now
              </button>
            ) : !myTodayAttendance?.check_out ? (
              <div className="flex items-center gap-3">
                <div className="text-right mr-2">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Checked In At</p>
                  <p className="text-lg font-mono font-bold text-emerald-400">{myTodayAttendance.check_in}</p>
                </div>
                <button 
                  onClick={handleCheckOut}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-8 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-rose-500/20 disabled:opacity-50"
                >
                  <LogOut size={20} />
                  Check Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4 p-4 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="flex flex-col border-r border-slate-800 pr-4">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">In</span>
                  <span className="text-sm font-mono text-slate-300">{myTodayAttendance.check_in}</span>
                </div>
                <div className="flex flex-col pr-4">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Out</span>
                  <span className="text-sm font-mono text-slate-300">{myTodayAttendance.check_out}</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <CheckCircle2 size={16} />
                  COMPLETED
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 p-1 bg-slate-900 border border-slate-800 rounded-2xl w-fit">
        {isManagerOrAdmin && (
          <>
            <TabButton id="all" label="All Users" count={apiUsers.length} />
            <TabButton id="admins" label="Admins" icon={Shield} />
            <TabButton id="managers" label="Managers" />
            <TabButton id="staff" label="Staff" />
            <div className="w-px h-6 bg-slate-800 self-center mx-2" />
            <TabButton id="attendance" label="Team Attendance" icon={Clock} />
            <TabButton id="monthly-attendance" label="Team Calendar" icon={Calendar} />
          </>
        )}
        {!isManagerOrAdmin && <TabButton id="my-attendance" label="My Attendance History" icon={Calendar} />}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-rose-500/10 border border-rose-500/50 text-rose-500 p-4 rounded-xl flex items-center gap-3">
          <Info size={20} />
          {error}
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'my-attendance' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center">
              <Calendar className="mx-auto text-slate-700 mb-4 opacity-20" size={48} />
              <p className="text-slate-500 italic">Individual attendance history view coming soon.</p>
            </div>
          )}

          {['all', 'admins', 'managers', 'staff'].includes(activeTab) && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <table className="min-w-full divide-y divide-slate-800">
                <thead className="bg-slate-950/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Team Member</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Roles / Groups</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-10 text-center text-slate-500 italic">No users found in this category.</td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/30 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-inner">
                              {u.name?.charAt(0) || u.email.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{u.name || 'Unnamed User'}</div>
                              <div className="text-xs text-slate-500 font-medium">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1.5">
                            {u.groups?.map(g => (
                              <span key={g.id} className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-bold uppercase tracking-wider">
                                {g.name}
                              </span>
                            ))}
                            {u.is_staff && (
                              <span className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                                Staff
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            u.is_active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-500 border border-slate-700'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
                            {u.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                          <Link to={`/users/${u.id}`} className="inline-flex p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all shadow-sm">
                            <Eye size={16} />
                          </Link>
                          <button onClick={() => handleDeleteUser(u.id)} className="inline-flex p-2 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'attendance' && isManagerOrAdmin && <Attendance />}
          {activeTab === 'monthly-attendance' && isManagerOrAdmin && <MonthlyAttendanceCalendar />}
        </div>
      )}

      {showAddUserForm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <AddUserForm onClose={() => handleAddUser()} />
        </div>
      )}
    </div>
  );
}

export default UserManagement;
