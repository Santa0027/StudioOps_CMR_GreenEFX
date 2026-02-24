import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUser, updateUser } from '../../../shared/services/apiClient';
import { useAuth } from '../../../shared/context/AuthContext';

const UserProfile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');

  // Use param ID or current user ID
  const userId = id || currentUser?.user_id || currentUser?.id;

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) {
        setError("User identification not found.");
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const response = await getUser(userId);
        setUserData(response.data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setError("Failed to load user profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error || !userData) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white">
      <p className="text-xl text-rose-400 mb-4">{error || "User not found"}</p>
      <button onClick={() => navigate('/dashboard')} className="px-6 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-all">Go Home</button>
    </div>
  );

  const tabs = ['Overview', 'Account & Security', 'KYC / Documents', 'Attendance', 'Assigned Projects', 'Activity'];

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/users')}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">User Profile</h1>
            <p className="text-slate-400 mt-1">View and manage member information.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column: Sidebar Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-xl flex flex-col items-center text-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold shadow-2xl border-4 border-slate-800">
                {userData.name?.charAt(0) || userData.email.charAt(0).toUpperCase()}
              </div>
              <div className={`absolute bottom-1 right-1 w-6 h-6 rounded-full border-4 border-slate-900 ${userData.is_active ? 'bg-emerald-500' : 'bg-slate-500'}`}></div>
            </div>
            
            <h2 className="text-2xl font-bold text-white mt-6 mb-1">{userData.name || 'Unnamed User'}</h2>
            <p className="text-slate-400 font-medium text-sm mb-4">{userData.email}</p>
            
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {userData.groups?.map(g => (
                <span key={g.id} className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                  {g.name}
                </span>
              ))}
              {userData.is_staff && (
                <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                  Staff
                </span>
              )}
            </div>

            <div className="w-full space-y-3">
              <button className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                Edit Profile
              </button>
              <button className="w-full px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                Reset Password
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Content Area */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex gap-2 p-1 bg-slate-900 border border-slate-800 rounded-2xl w-fit overflow-x-auto max-w-full">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab 
                    ? 'bg-slate-800 text-white shadow-md' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-lg">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                Personal Details
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Full Name', value: userData.name || 'N/A' },
                  { label: 'Email', value: userData.email },
                  { label: 'Phone', value: userData.phone || 'N/A' },
                  { label: 'Joining Date', value: new Date(userData.created_at).toLocaleDateString() },
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col gap-1 pb-4 border-b border-slate-800 last:border-0 last:pb-0">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.label}</span>
                    <span className="text-white font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-lg">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                System Access
              </h3>
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Primary Role</span>
                  <span className="px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold text-sm">
                    {userData.groups?.[0]?.name || 'No Role Assigned'}
                  </span>
                </div>
                
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3">Permissions Summary</span>
                  <div className="flex flex-wrap gap-2">
                    {userData.user_permissions?.length > 0 ? (
                      userData.user_permissions.map((p, i) => (
                        <span key={i} className="px-2 py-1 rounded-md bg-slate-800 text-slate-400 text-[10px] font-medium border border-slate-700">
                          {p.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-600 text-xs italic">Inherited from group</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Account Status</span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    userData.is_active ? 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20' : 'text-slate-500 bg-slate-800 border border-slate-700'
                  }`}>
                    {userData.is_active ? 'ACTIVE' : 'DEACTIVATED'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
