import React, { useState } from 'react';

const MonthlyAttendanceCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState('December 2023');

  const employees = [
    { name: 'Alex Hartman', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29329?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
    { name: 'Maya Rodriguez', avatar: 'https://cdn.pixabay.com/photo/2016/11/18/23/38/child-1837375_1280.png' },
    { name: 'Ben Carter', avatar: 'https://images.unsplash.com/photo-1531427186611-ecfd6d951979?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
  ];

  const attendanceData = {
    'Alex Hartman': ['present', 'off-day', 'off-day', 'present', 'late', 'present', 'absent', 'off-day', 'off-day', 'present'],
    'Maya Rodriguez': ['present', 'off-day', 'off-day', 'present', 'present', 'late', 'present', 'off-day', 'off-day', 'present'],
    'Ben Carter': ['absent', 'off-day', 'off-day', 'present', 'present', 'present', 'present', 'off-day', 'off-day', 'present'],
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'bg-green-500';
      case 'late': return 'bg-yellow-500';
      case 'absent': return 'bg-red-500';
      case 'off-day': return 'bg-gray-700';
      default: return 'bg-gray-700';
    }
  };

  const days = [
    { date: '01', day: 'FRI' },
    { date: '02', day: 'SAT' },
    { date: '03', day: 'SUN' },
    { date: '04', day: 'MON' },
    { date: '05', day: 'TUE' },
    { date: '06', day: 'WED' },
    { date: '07', day: 'THU' },
    { date: '08', day: 'FRI' },
    { date: '09', day: 'SAT' },
    { date: '10', day: 'SUN' },
  ];

  const handlePreviousMonth = () => {
    // Logic to go to previous month
    console.log('Previous month');
  };

  const handleNextMonth = () => {
    // Logic to go to next month
    console.log('Next month');
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-4xl font-bold mb-2">Monthly Attendance Calendar</h1>
      <p className="text-gray-400 mb-8">View and manage team attendance for the selected month.</p>

      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button onClick={handlePreviousMonth} className="p-2 rounded-lg hover:bg-gray-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-xl font-semibold">{currentMonth}</span>
          <button onClick={handleNextMonth} className="p-2 rounded-lg hover:bg-gray-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button className="p-2 rounded-lg hover:bg-gray-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-4">
          <select className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white appearance-none">
            <option>All Teams</option>
            <option>Design</option>
            <option>Development</option>
          </select>
          <button className="px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-700 text-white">3D Animation</button>
          <button className="px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-700 text-white">Graphic Design</button>
          <button className="flex items-center px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v11a2 2 0 01-2 2z"
              ></path>
            </svg>
            Export
          </button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg shadow overflow-x-auto">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider sticky left-0 bg-gray-700 z-10">
                EMPLOYEE
              </th>
              {days.map((day, index) => (
                <th key={index} className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  {day.date} <br /> {day.day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.map((employee, empIndex) => (
              <tr key={empIndex} className="hover:bg-gray-700">
                <td className="px-5 py-5 border-b border-gray-700 text-sm sticky left-0 bg-gray-800 flex items-center">
                  <div className="flex-shrink-0 w-10 h-10">
                    <img
                      className="w-full h-full rounded-full"
                      src={employee.avatar}
                      alt=""
                    />
                  </div>
                  <div className="ml-3">
                    <p className="text-white whitespace-no-wrap">{employee.name}</p>
                  </div>
                </td>
                {attendanceData[employee.name].map((status, dayIndex) => (
                  <td key={dayIndex} className="px-5 py-5 border-b border-gray-700 text-sm text-center">
                    <div className={`w-8 h-8 mx-auto rounded-full ${getStatusColor(status)}`}></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center mt-6 space-x-4 text-sm font-medium">
        <div className="flex items-center">
          <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
          Present
        </div>
        <div className="flex items-center">
          <span className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
          Late
        </div>
        <div className="flex items-center">
          <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
          Absent
        </div>
        <div className="flex items-center">
          <span className="w-3 h-3 rounded-full bg-gray-700 mr-2"></span>
          Off-Day
        </div>
      </div>
    </div>
  );
};

export default MonthlyAttendanceCalendar;
