import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', tasksCompleted: 30, avgRating: 4.2 },
  { name: 'Feb', tasksCompleted: 45, avgRating: 4.5 },
  { name: 'Mar', tasksCompleted: 38, avgRating: 4.1 },
  { name: 'Apr', tasksCompleted: 50, avgRating: 4.7 },
  { name: 'May', tasksCompleted: 42, avgRating: 4.3 },
  { name: 'Jun', tasksCompleted: 55, avgRating: 4.8 },
];

const UserPerformanceReport = () => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold text-white mb-4">User Performance Overview</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{
            top: 20, right: 30, left: 20, bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="name" stroke="#999" />
          <YAxis yId="left" orientation="left" stroke="#999" />
          <YAxis yId="right" orientation="right" stroke="#999" />
          <Tooltip contentStyle={{ backgroundColor: '#333', borderColor: '#555', color: '#fff' }} />
          <Legend />
          <Bar yId="left" dataKey="tasksCompleted" fill="#8884d8" name="Tasks Completed" />
          <Bar yId="right" dataKey="avgRating" fill="#82ca9d" name="Average Rating" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UserPerformanceReport;
