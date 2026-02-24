import React, { useState, useEffect } from 'react';
import { useAuth } from '../../shared/context/AuthContext';
import { getProjects, getProjectStageElements, getFinanceSummary } from '../../shared/services/apiClient';
import { 
    LayoutDashboard, 
    Search, 
    Bell, 
    Briefcase, 
    CheckCircle2, 
    DollarSign, 
    Clock, 
    TrendingUp, 
    ArrowUpRight,
    MoreHorizontal,
    FileText,
    Activity
} from 'lucide-react';

function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [finance, setFinance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [projRes, tasksRes, financeRes] = await Promise.all([
          getProjects(),
          getProjectStageElements(),
          getFinanceSummary()
        ]);
        setProjects(projRes.data);
        setTasks(tasksRes.data);
        setFinance(financeRes.data);
      } catch (err) {
        console.error("Dashboard data fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const getStatusClasses = (status) => {
    const s = status?.toLowerCase();
    if (s?.includes('progress')) return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    if (s?.includes('completed')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (s?.includes('hold') || s?.includes('blocked')) return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    return 'bg-slate-700/50 text-slate-400 border-slate-700/50';
  };

  const userEmailInitial = user?.name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U';
  const userDisplayName = user?.name || user?.email?.split('@')[0] || 'Team Member';
  const userRoleDisplay = user?.groups?.[0] || (user?.is_staff ? 'Staff' : 'Artist');

  const stats = [
    { 
        label: 'Active Projects', 
        value: projects.filter(p => p.status !== 'completed').length, 
        icon: Briefcase, 
        color: 'text-blue-500',
        bg: 'bg-blue-500/10'
    },
    { 
        label: 'Tasks In Review', 
        value: tasks.filter(t => t.status === 'waiting_review').length, 
        icon: Activity, 
        color: 'text-amber-500',
        bg: 'bg-amber-500/10'
    },
    { 
        label: 'Total Revenue', 
        value: `$${(finance?.total_paid || 0).toLocaleString()}`, 
        icon: DollarSign, 
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10'
    },
    { 
        label: 'Completed Tasks', 
        value: tasks.filter(t => t.status === 'completed').length, 
        icon: CheckCircle2, 
        color: 'text-purple-500',
        bg: 'bg-purple-500/10'
    }
  ];

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Dynamic Header */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-2">
        <div className="space-y-1">
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                <LayoutDashboard className="text-blue-500" size={32} />
                Dashboard
            </h1>
            <p className="text-slate-400 text-lg">Welcome back, <span className="text-white font-semibold">{userDisplayName}</span>. Here's what's happening today.</p>
        </div>

        <div className="flex items-center gap-4">
            <div className="flex flex-col items-end pr-4 border-r border-slate-800">
                <span className="text-sm font-bold text-white uppercase tracking-wider">{userRoleDisplay}</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">System Role</span>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
                {userEmailInitial}
            </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
            <div key={idx} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl hover:border-slate-700 transition-all group">
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                        <stat.icon size={24} />
                    </div>
                    <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                        <TrendingUp size={12} />
                        Live
                    </span>
                </div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-3xl font-bold text-white mt-1">{stat.value}</h3>
            </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Projects */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white">Active Projects</h2>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Real-time status of your production pipeline</p>
                </div>
                <button className="p-2 hover:bg-slate-800 rounded-xl text-slate-500 transition-colors">
                    <MoreHorizontal size={20} />
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-slate-950/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Project</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Client</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Progress</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {projects.slice(0, 5).map((project) => (
                            <tr key={project.id} className="hover:bg-slate-800/30 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-400 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-all">
                                            {project.name.charAt(0)}
                                        </div>
                                        <span className="text-sm font-bold text-white">{project.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-400 font-medium">{project.client_name}</td>
                                <td className="px-6 py-4">
                                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                        <div 
                                            className="bg-blue-500 h-full rounded-full transition-all duration-1000" 
                                            style={{ width: `${project.overall_progress}%` }}
                                        />
                                    </div>
                                    <span className="text-[10px] text-slate-500 mt-1 font-bold">{project.overall_progress}% COMPLETE</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusClasses(project.status)}`}>
                                        {project.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {projects.length === 0 && (
                            <tr>
                                <td colSpan="4" className="px-6 py-12 text-center text-slate-500 italic">No active projects found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* System Activity / Health */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col">
            <h2 className="text-xl font-bold text-white mb-6">Financial Pulse</h2>
            
            <div className="flex-1 space-y-6">
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Collections</span>
                        <span className="text-emerald-400 text-xs font-bold">{((finance?.total_paid / finance?.total_invoiced) * 100 || 0).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                        <div 
                            className="bg-emerald-500 h-full rounded-full" 
                            style={{ width: `${(finance?.total_paid / finance?.total_invoiced) * 100 || 0}%` }}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-4 p-3 hover:bg-slate-800 rounded-2xl transition-colors">
                        <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
                            <FileText size={18} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">${(finance?.total_pending || 0).toLocaleString()}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase">Pending Invoices</p>
                        </div>
                        <ArrowUpRight size={16} className="ml-auto text-slate-600" />
                    </div>

                    <div className="flex items-center gap-4 p-3 hover:bg-slate-800 rounded-2xl transition-colors">
                        <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
                            <Clock size={18} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">{tasks.filter(t => t.status === 'in_progress').length}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase">Active Work Tasks</p>
                        </div>
                        <ArrowUpRight size={16} className="ml-auto text-slate-600" />
                    </div>
                </div>
            </div>

            <div className="mt-8 p-4 bg-blue-600/5 border border-blue-500/20 rounded-2xl">
                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-1">System Health</p>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs text-white font-medium">All services operational</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
