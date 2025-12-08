import React, { useState } from 'react';

function AddUserForm({ onClose }) {
  // Account Details
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('Staff'); // Default role
  const [status, setStatus] = useState('Active'); // Default status
  const [department, setDepartment] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Personal Details
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');

  // Qualifications
  const [highestQualification, setHighestQualification] = useState('');
  const [certifications, setCertifications] = useState('');

  // Contact Details
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic validation for passwords
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // In a real application, you would send this data to a backend API
    console.log({
      // Account Details
      username,
      role,
      status,
      department,
      avatarUrl,
      // Personal Details
      firstName,
      lastName,
      dateOfBirth,
      gender,
      // Qualifications
      highestQualification,
      certifications,
      // Contact Details
      email,
      phoneNumber,
      address,
    });

    // Clear form or close modal
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setRole('Staff');
    setStatus('Active');
    setDepartment('');
    setAvatarUrl('');
    setFirstName('');
    setLastName('');
    setDateOfBirth('');
    setGender('');
    setHighestQualification('');
    setCertifications('');
    setEmail('');
    setPhoneNumber('');
    setAddress('');
    
    if (onClose) onClose();
  };

  return (
    <div className="bg-[#2a2a2a] p-8 rounded-lg shadow-md max-w-2xl mx-auto my-8 overflow-y-auto max-h-[90vh]">
      <h2 className="text-2xl font-bold mb-6 text-white">Add New User</h2>
      <form onSubmit={handleSubmit}>
        {/* Account Details */}
        <fieldset className="mb-6 border border-gray-700 p-4 rounded-md">
          <legend className="text-lg font-semibold text-white px-2">Account Details</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label htmlFor="username" className="block text-gray-400 text-sm font-bold mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                className="shadow appearance-none border border-gray-700 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#1a1a1a]"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="block text-gray-400 text-sm font-bold mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="shadow appearance-none border border-gray-700 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#1a1a1a]"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="confirmPassword" className="block text-gray-400 text-sm font-bold mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                className="shadow appearance-none border border-gray-700 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#1a1a1a]"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="role" className="block text-gray-400 text-sm font-bold mb-2">
                Role
              </label>
              <select
                id="role"
                className="shadow border border-gray-700 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#1a1a1a] appearance-none"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Staff">Staff</option>
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor="department" className="block text-gray-400 text-sm font-bold mb-2">
                Department
              </label>
              <input
                type="text"
                id="department"
                className="shadow appearance-none border border-gray-700 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#1a1a1a]"
                placeholder="e.g., Animation"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="status" className="block text-gray-400 text-sm font-bold mb-2">
                Status
              </label>
              <select
                id="status"
                className="shadow border border-gray-700 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#1a1a1a] appearance-none"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="mb-4 col-span-full">
              <label htmlFor="avatarUrl" className="block text-gray-400 text-sm font-bold mb-2">
                Avatar URL
              </label>
              <input
                type="url"
                id="avatarUrl"
                className="shadow appearance-none border border-gray-700 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#1a1a1a]"
                placeholder="e.g., https://via.placeholder.com/30/808080/FFFFFF?text=OM"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
              />
            </div>
          </div>
        </fieldset>

        {/* Personal Details */}
        <fieldset className="mb-6 border border-gray-700 p-4 rounded-md">
          <legend className="text-lg font-semibold text-white px-2">Personal Details</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label htmlFor="firstName" className="block text-gray-400 text-sm font-bold mb-2">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                className="shadow appearance-none border border-gray-700 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#1a1a1a]"
                placeholder="e.g., Olivia"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="lastName" className="block text-gray-400 text-sm font-bold mb-2">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                className="shadow appearance-none border border-gray-700 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#1a1a1a]"
                placeholder="e.g., Martinez"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="dateOfBirth" className="block text-gray-400 text-sm font-bold mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                id="dateOfBirth"
                className="shadow appearance-none border border-gray-700 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#1a1a1a]"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="gender" className="block text-gray-400 text-sm font-bold mb-2">
                Gender
              </label>
              <select
                id="gender"
                className="shadow border border-gray-700 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#1a1a1a] appearance-none"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </fieldset>

        {/* Qualifications */}
        <fieldset className="mb-6 border border-gray-700 p-4 rounded-md">
          <legend className="text-lg font-semibold text-white px-2">Qualifications</legend>
          <div className="mb-4">
            <label htmlFor="highestQualification" className="block text-gray-400 text-sm font-bold mb-2">
              Highest Qualification
            </label>
            <input
              type="text"
              id="highestQualification"
              className="shadow appearance-none border border-gray-700 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#1a1a1a]"
              placeholder="e.g., Bachelor's in Animation"
              value={highestQualification}
              onChange={(e) => setHighestQualification(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="certifications" className="block text-gray-400 text-sm font-bold mb-2">
              Certifications
            </label>
            <textarea
              id="certifications"
              rows="3"
              className="shadow appearance-none border border-gray-700 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#1a1a1a]"
              placeholder="List any relevant certifications, separated by commas"
              value={certifications}
              onChange={(e) => setCertifications(e.target.value)}
            ></textarea>
          </div>
        </fieldset>

        {/* Contact Details */}
        <fieldset className="mb-6 border border-gray-700 p-4 rounded-md">
          <legend className="text-lg font-semibold text-white px-2">Contact Details</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-400 text-sm font-bold mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="shadow appearance-none border border-gray-700 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#1a1a1a]"
                placeholder="e.g., olivia.martinez@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="phoneNumber" className="block text-gray-400 text-sm font-bold mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                className="shadow appearance-none border border-gray-700 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#1a1a1a]"
                placeholder="e.g., +1 (555) 123-4567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            <div className="mb-4 col-span-full">
              <label htmlFor="address" className="block text-gray-400 text-sm font-bold mb-2">
                Address
              </label>
              <textarea
                id="address"
                rows="3"
                className="shadow appearance-none border border-gray-700 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#1a1a1a]"
                placeholder="Enter full address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              ></textarea>
            </div>
          </div>
        </fieldset>

        <div className="flex items-center justify-between mt-6">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Add User
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default AddUserForm;
