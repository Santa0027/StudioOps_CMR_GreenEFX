import React, { useState } from 'react';

const AssignTaskForm = () => {
  const [selectedTask, setSelectedTask] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [dueDate, setDueDate] = useState('');

  // Dummy data for tasks and users
  const tasks = [
    { id: 1, title: 'Character Rigging for "Project Nebula"' },
    { id: 2, title: 'Animate Walk Cycle - Main Character' },
    { id: 3, title: 'Concept Art for Alien Flora' },
    { id: 4, title: 'Render Scene 24 Final Shots' },
  ];

  const users = [
    { id: 101, name: 'Alice Smith' },
    { id: 102, name: 'Bob Johnson' },
    { id: 103, name: 'Charlie Brown' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedTask || !selectedUser || !dueDate) {
      alert('Please fill in all fields.');
      return;
    }
    // Here you would typically send this data to your backend API
    console.log({ selectedTask, selectedUser, dueDate });
    alert(`Task "${selectedTask}" assigned to "${selectedUser}" with due date ${dueDate}!`);
    // Reset form
    setSelectedTask('');
    setSelectedUser('');
    setDueDate('');
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md mx-auto text-white">
      <h2 className="text-2xl font-semibold mb-4">Assign Task to User</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="taskSelect" className="block text-white text-sm font-bold mb-2">Select Task:</label>
          <select
            id="taskSelect"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 text-white"
            value={selectedTask}
            onChange={(e) => setSelectedTask(e.target.value)}
            required
          >
            <option value="">-- Select a Task --</option>
            {tasks.map((task) => (
              <option key={task.id} value={task.title}>
                {task.title}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="userSelect" className="block text-white text-sm font-bold mb-2">Select User:</label>
          <select
            id="userSelect"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 text-white"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            required
          >
            <option value="">-- Select a User --</option>
            {users.map((user) => (
              <option key={user.id} value={user.name}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="dueDate" className="block text-white text-sm font-bold mb-2">Due Date:</label>
          <input
            type="date"
            id="dueDate"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 text-white"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Assign Task
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssignTaskForm;
