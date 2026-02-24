import React, { useState, useEffect } from 'react';
import { getAttendances, getEmployees } from '../../../shared/services/apiClient';

const MonthlyAttendanceCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [employees, setEmployees] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  // Generate days for the current month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const date = new Date(year, month, i + 1);
    return {
      fullDate: date.toISOString().split('T')[0],
      date: String(i + 1).padStart(2, '0'),
      day: date.toLocaleString('default', { weekday: 'short' }).toUpperCase()
    };
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [empRes, attRes] = await Promise.all([
          getEmployees(),
          getAttendances({ 
            start_date: `${year}-${String(month + 1).padStart(2, '0')}-01`,
            end_date: `${year}-${String(month + 1).padStart(2, '0')}-${daysInMonth}`
          })
        ]);

        setEmployees(empRes.data);
        
        // Map attendance to { employeeId: { date: status } }
        const mappedAtt = attRes.data.reduce((acc, curr) => {
          if (!acc[curr.employee]) acc[curr.employee] = {};
          acc[curr.employee][curr.date] = curr.status.toLowerCase();
          return acc;
        }, {});
        
        setAttendanceData(mappedAtt);
      } catch (err) {
        console.error("Failed to fetch monthly data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentDate]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]';
      case 'half_day': return 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.4)]';
      case 'absent': return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]';
      case 'leave': return 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]';
      default: return 'bg-slate-800';
    }
  };

  const handleMonthChange = (offset) => {
    setCurrentDate(new Date(year, month + offset, 1));
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Monthly Attendance</h1>
          <p className="text-slate-400 mt-1">Comprehensive view of team availability.</p>
        </div>

        <div className="flex items-center gap-4 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button onClick={() => handleMonthChange(-1)} className="p-2.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <span className="text-sm font-bold text-white uppercase tracking-widest min-w-[140px] text-center">{monthName} {year}</span>
          <button onClick={() => handleMonthChange(1)} className="p-2.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-inner overflow-x-auto custom-scrollbar">
        <table className="min-w-full divide-y divide-slate-800">
          <thead>
            <tr className="bg-slate-950/50">
              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] sticky left-0 bg-slate-900/95 backdrop-blur-sm z-20 border-r border-slate-800">
                Employee
              </th>
              {days.map((day, index) => (
                <th key={index} className="px-2 py-4 text-center min-w-[45px]">
                  <span className="block text-[10px] font-bold text-slate-500 leading-none mb-1">{day.day}</span>
                  <span className="text-xs font-mono font-bold text-slate-300">{day.date}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {employees.map((emp, empIndex) => (
              <tr key={emp.id} className="hover:bg-slate-800/20 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap sticky left-0 bg-slate-900/95 backdrop-blur-sm z-10 border-r border-slate-800">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold shadow-lg">
                      {emp.name?.charAt(0) || 'U'}
                    </div>
                    <div className="ml-3">
                      <p className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">{emp.name}</p>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">{emp.employee_code}</p>
                    </div>
                  </div>
                </td>
                {days.map((day, dayIndex) => {
                  const status = attendanceData[emp.id]?.[day.fullDate] || 'off-day';
                  return (
                    <td key={dayIndex} className="px-1 py-4 text-center">
                      <div 
                        className={`w-2.5 h-2.5 mx-auto rounded-full transition-transform hover:scale-150 cursor-help ${getStatusColor(status)}`}
                        title={`${emp.name} - ${day.fullDate}: ${status.toUpperCase()}`}
                      ></div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap justify-center gap-8 mt-10 p-6 bg-slate-950/50 rounded-2xl border border-slate-800/50">
        {[
          { label: 'Present', color: 'bg-green-500' },
          { label: 'Half Day', color: 'bg-yellow-500' },
          { label: 'Absent', color: 'bg-red-500' },
          { label: 'Leave', color: 'bg-blue-500' },
          { label: 'No Data', color: 'bg-slate-800' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <span className={`w-3 h-3 rounded-full ${item.color} shadow-[0_0_8px_currentColor]`}></span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonthlyAttendanceCalendar;
