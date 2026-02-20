import React from 'react';

const Attendance = () => {
  const attendanceData = [
    {
      employee: 'Alex Ray',
      role: '3D Animator',
      checkIn: '09:02 AM',
      checkOut: '06:05 PM',
      totalHours: '9h 3m',
      status: 'Present',
      avatar: 'https://cdn.pixabay.com/photo/2016/11/18/23/38/child-1837375_1280.png',
    },
    {
      employee: 'Maria Garcia',
      role: 'Graphic Designer',
      checkIn: '09:18 AM',
      checkOut: '06:01 PM',
      totalHours: '8h 43m',
      status: 'Late',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29329?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    {
      employee: 'Ben Carter',
      role: 'Video Editor',
      checkIn: '--',
      checkOut: '--',
      totalHours: '--',
      status: 'Absent',
      avatar: 'https://images.unsplash.com/photo-1531427186611-ecfd6d951979?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    {
      employee: 'Olivia Chen',
      role: 'Motion Graphics',
      checkIn: '08:55 AM',
      checkOut: '05:58 PM',
      totalHours: '9h 3m',
      status: 'Present',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    {
      employee: 'Sam Rodriguez',
      role: '3D Animator',
      checkIn: '--',
      checkOut: '--',
      totalHours: '--',
      status: 'Leave',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present':
        return 'bg-green-500';
      case 'Late':
        return 'bg-yellow-500';
      case 'Absent':
        return 'bg-red-500';
      case 'Leave':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-4xl font-bold mb-8">Attendance</h1>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Jan 20, 2024"
            className="pl-10 pr-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            ></path>
          </svg>
        </div>

        <div className="relative">
          <select className="pl-10 pr-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white appearance-none">
            <option>All Department</option>
            <option>3D Animator</option>
            <option>Graphic Designer</option>
            <option>Video Editor</option>
            <option>Motion Graphics</option>
          </select>
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H2v-2a4 4 0 014-4h2.129a4 4 0 013.845 2.502M12 10a5 5 0 01-5-5V2a1 1 0 011-1h6a1 1 0 011 1v3a5 5 0 01-5 5z"
            ></path>
          </svg>
          <svg
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>

        <div className="relative">
          <select className="pl-10 pr-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white appearance-none">
            <option>All Status</option>
            <option>Present</option>
            <option>Late</option>
            <option>Absent</option>
            <option>Leave</option>
          </select>
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 4H21V6H3V4ZM3 8H15V10H3V8ZM3 12H9V14H3V12Z"
            ></path>
          </svg>
          <svg
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>

        <button className="flex items-center px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white ml-auto">
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
          Export to CSV
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Employee
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Role / Department
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Check-In
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Check-Out
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Total Hours
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {attendanceData.map((data, index) => (
              <tr key={index} className="hover:bg-gray-700">
                <td className="px-5 py-5 border-b border-gray-700 text-sm">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-10 h-10">
                      <img
                        className="w-full h-full rounded-full"
                        src={data.avatar}
                        alt=""
                      />
                    </div>
                    <div className="ml-3">
                      <p className="text-white whitespace-no-wrap">{data.employee}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-5 border-b border-gray-700 text-sm">
                  <p className="text-white whitespace-no-wrap">{data.role}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-700 text-sm">
                  <p className="text-white whitespace-no-wrap">{data.checkIn}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-700 text-sm">
                  <p className="text-white whitespace-no-wrap">{data.checkOut}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-700 text-sm">
                  <p className="text-white whitespace-no-wrap">{data.totalHours}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-700 text-sm">
                  <span
                    className={`relative inline-block px-3 py-1 font-semibold leading-tight text-white`}
                  >
                    <span
                      aria-hidden
                      className={`absolute inset-0 ${getStatusColor(
                        data.status
                      )} opacity-50 rounded-full`}
                    ></span>
                    <span className="relative">{data.status}</span>
                  </span>
                </td>
                <td className="px-5 py-5 border-b border-gray-700 text-sm">
                  <div className="flex items-center">
                    <button className="text-gray-400 hover:text-blue-500 mr-3">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        ></path>
                      </svg>
                    </button>
                    <button className="text-gray-400 hover:text-blue-500">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        ></path>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        ></path>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Attendance;
