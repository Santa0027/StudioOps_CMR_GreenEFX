import React, { useState, useEffect } from 'react';
import { getAttendances, updateAttendance, getEmployees } from '../../../shared/services/apiClient';

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedStatus, setSelectedStatus] = useState('All Status');

  const fetchAttendance = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        date: selectedDate,
      };
      if (selectedStatus !== 'All Status') {
        params.status = selectedStatus.toUpperCase();
      }
      const response = await getAttendances(params);
      setAttendanceData(response.data);
    } catch (err) {
      console.error("Failed to fetch attendance:", err);
      setError("Failed to load attendance data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate, selectedStatus]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'PRESENT':
        return 'bg-green-500';
      case 'HALF_DAY':
        return 'bg-yellow-500';
      case 'ABSENT':
        return 'bg-red-500';
      case 'LEAVE':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateAttendance(id, { status: newStatus });
      fetchAttendance(); // Refresh list
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update attendance status.");
    }
  };

  return (
    <div className="p-6 bg-slate-900 min-h-screen text-white rounded-3xl border border-slate-800 shadow-2xl animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Daily Attendance</h1>
          <p className="text-slate-400 mt-1">Track and manage employee presence for today.</p>
        </div>
        <div className="flex gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
          <button className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/20">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            Export CSV
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-8">
        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
          {['All Status', 'Present', 'Half Day', 'Absent', 'Leave'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                selectedStatus === status 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="p-10 text-center bg-rose-500/5 border border-rose-500/20 rounded-3xl">
          <p className="text-rose-400 font-medium">{error}</p>
          <button onClick={fetchAttendance} className="mt-4 px-6 py-2 bg-slate-800 rounded-xl hover:bg-slate-700 transition-all">Try Again</button>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <table className="min-w-full divide-y divide-slate-800">
            <thead className="bg-slate-950/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Employee</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">In / Out</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-widest">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {attendanceData.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-500 italic">No attendance records found for this date.</td>
                </tr>
              ) : (
                attendanceData.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-blue-400 font-bold border border-slate-700">
                          {record.employee_name?.charAt(0) || 'U'}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-white">{record.employee_name}</div>
                          <div className="text-[10px] text-slate-500 font-bold uppercase">{record.employee_code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Check In</span>
                          <span className="text-xs text-slate-300 font-mono">{record.check_in || '--:--'}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Check Out</span>
                          <span className="text-xs text-slate-300 font-mono">{record.check_out || '--:--'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(record.status)} bg-opacity-10 ring-1 ring-current/20`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor(record.status)}`}></span>
                        {record.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <select 
                        className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[10px] font-bold uppercase text-slate-400 focus:ring-1 focus:ring-blue-500 outline-none"
                        value={record.status}
                        onChange={(e) => handleUpdateStatus(record.id, e.target.value)}
                      >
                        <option value="PRESENT">Present</option>
                        <option value="HALF_DAY">Half Day</option>
                        <option value="ABSENT">Absent</option>
                        <option value="LEAVE">Leave</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Attendance;
