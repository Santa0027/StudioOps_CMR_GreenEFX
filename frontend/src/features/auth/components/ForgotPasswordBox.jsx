import React from 'react';
import { Link } from 'react-router-dom';

function ForgotPasswordBox() {
  return (
    <div className="bg-[#1C1C1E] p-10 rounded-xl shadow-2xl w-[450px] text-center mx-auto my-auto border border-[#333333]">
      <h1 className="text-3xl font-bold mb-2 text-white">StudioOps</h1>
      <h2 className="text-2xl font-semibold mb-2 text-white">Forgot Your Password?</h2>
      <p className="mb-8 text-gray-400 text-sm">No problem. Enter your email below and we'll send you a verification code to reset it.</p>

      <div className="text-left mb-6 relative">
        <label htmlFor="emailAddress" className="block mb-2 text-gray-300 text-sm font-medium">Email Address</label>
        <div className="flex items-center bg-[#2C2C2E] rounded-lg p-3">
          <input type="email" id="emailAddress" placeholder="Enter your email address" className="flex-1 bg-transparent border-none focus:outline-none text-white text-sm" />
        </div>
      </div>

      <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 border-none rounded-lg text-white text-lg font-bold cursor-pointer mt-6 mb-6 transition-all duration-300 shadow-lg shadow-blue-500/30">Send Verification Code</button>

      <p className="text-sm text-gray-400">
        <Link to="/login" className="text-blue-400 no-underline font-bold hover:text-blue-300 transition-colors duration-200">Back to Sign In</Link>
      </p>
    </div>
  );
}

export default ForgotPasswordBox;
