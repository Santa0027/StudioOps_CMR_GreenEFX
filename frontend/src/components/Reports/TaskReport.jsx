import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Week 1', completed: 10, pending: 5 },
  { name: 'Week 2', completed: 15, pending: 3 },
  { name: 'Week 3', completed: 12, pending: 6 },
  { name: 'Week 4', completed: 18, pending: 2 },
  { name: 'Week 5', completed: 14, pending: 4 },
  { name: 'Week 6', completed: 20, pending: 1 },
];

const TaskReport = () => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold text-white mb-4">Task Completion Trends</h2>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={data}
          margin={{
            top: 10, right: 30, left: 0, bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="name" stroke="#999" />
          <YAxis stroke="#999" />
          <Tooltip contentStyle={{ backgroundColor: '#333', borderColor: '#555', color: '#fff' }} />
          <Area type="monotone" dataKey="completed" stackId="1" stroke="#8884d8" fill="#8884d8" name="Completed Tasks" />
          <Area type="monotone" dataKey="pending" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Pending Tasks" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TaskReport;
