import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../..//context/AuthContext';

function LoginBox() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    // Hardcoded credentials for demonstration
    const credentials = {
      'admin@studioops.com': { password: 'adminpassword', role: 'admin' },
      'manager@studioops.com': { password: 'managerpassword', role: 'manager' },
      'staff@studioops.com': { password: 'staffpassword', role: 'staff' },
    };

    const userCredential = credentials[email];

    if (userCredential && userCredential.password === password) {
      login({ email: email, role: userCredential.role });
      navigate('/dashboard'); // Navigate to dashboard on successful login
    } else {
      setError('Invalid email or password.');
    }
  };

  return (
    <div className="bg-[#1C1C1E] p-10 rounded-xl shadow-2xl w-[450px] text-center mx-auto my-auto border border-[#333333]">
      <h1 className="text-3xl font-bold mb-2 text-white">StudioOps</h1>
      <h2 className="text-2xl font-semibold mb-2 text-white">Welcome Back</h2>
      <p className="mb-8 text-gray-400 text-sm">Log in to your StudioOps account to continue.</p>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleLogin}>
        <div className="text-left mb-6 relative">
          <label htmlFor="email" className="block mb-2 text-gray-300 text-sm font-medium">Email Address</label>
          <div className="flex items-center bg-[#2C2C2E] rounded-lg p-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              className="flex-1 bg-transparent border-none focus:outline-none text-white text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="text-left mb-6 relative">
          <label htmlFor="password" className="block mb-2 text-gray-300 text-sm font-medium">Password</label>
          <Link to="/forgot-password" className="absolute right-0 top-0 text-blue-400 no-underline text-xs mt-0 mr-0 hover:text-blue-300 transition-colors duration-200">Forgot Password?</Link>
          <div className="flex items-center bg-[#2C2C2E] rounded-lg p-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2h2a2 2 0 012 2v5a2 2 0 01-2 2H3a2 2 0 01-2-2v-5a2 2 0 012-2h2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              className="flex-1 bg-transparent border-none focus:outline-none text-white text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-3 text-gray-400 cursor-pointer hover:text-gray-300" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 border-none rounded-lg text-white text-lg font-bold cursor-pointer mt-6 mb-6 transition-all duration-300 shadow-lg shadow-blue-500/30 glow-on-hover">Log In</button>
      </form>

      <div className="flex items-center text-center text-gray-500 mb-6">
        <span className="flex-1 border-b border-[#333333]"></span>
        <span className="px-3 text-sm">Or continue with</span>
        <span className="flex-1 border-b border-[#333333]"></span>
      </div>

      <div className="flex justify-center gap-4 mb-8">
        <div className="w-12 h-12 bg-[#2C2C2E] rounded-full flex items-center justify-center cursor-pointer border border-[#333333] text-white hover:bg-[#3A3A3C] transition-colors duration-200">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.24 10.28v3.29h5.18c-.22 1.48-.86 2.44-1.92 3.23l-3.23 2.52v-3.79h-.02z" fill="#4285F4"/>
            <path d="M7.78 12.01c-.24-.71-.38-1.46-.38-2.26s.14-1.55.38-2.26l-3.23-2.52V9.59L7.78 12.01z" fill="#FBBC04"/>
            <path d="M10 16.79c1.78 0 3.28-.58 4.37-1.58l3.23 2.52c-2.18 1.94-4.96 3.06-7.6 3.06-4.67 0-8.62-2.5-10.74-5.96l3.23-2.52c1.2 3.51 4.7 6 7.6 6h.01z" fill="#34A853"/>
            <path d="M12 5.01c1.29 0 2.45.42 3.36 1.29l2.87-2.87C16.89 2.07 14.61 1 12 1 7.33 1 3.38 3.5 1.26 6.96l3.23 2.52c.67-2.16 2.76-3.8 7.51-3.8z" fill="#EA4335"/>
          </svg>
        </div>
        <div className="w-12 h-12 bg-[#2C2C2E] rounded-full flex items-center justify-center cursor-pointer border border-[#333333] text-white hover:bg-[#3A3A3C] transition-colors duration-200">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-3.003 16.472c-.105.02-.21.03-.315.03-.66 0-1.218-.328-1.565-.89-.347-.563-.448-1.32-.27-1.983l.89-3.41c.178-.663.593-1.127 1.155-1.41.562-.284 1.25-.264 1.79-.064l1.69.61c.45.16.81.488 1.05.89l.06.1c.105.17.225.27.315.27.15 0 .27-.08.3-.23.15-.65.23-1.16.23-1.53 0-1.04-.37-1.89-.96-2.55-.59-.66-1.4-.99-2.45-.99-1.26 0-2.39.46-3.39 1.38-.99 0-1.99-.02-2.99-.02-1.33 0-2.46.46-3.39 1.38-.93.92-1.4 2.15-1.4 3.69 0 1.28.37 2.29.89 3.03.52.74 1.25 1.17 2.19 1.31.25.04.48-.02.69-.15.21-.13.3-.34.3-.6v-.32c0-.46-.35-.8-.78-.8l-1.61-.08c-.28-.02-.53-.13-.7-.34-.17-.21-.26-.49-.26-.83 0-.71.26-1.29.77-1.74.51-.45 1.25-.68 2.21-.68.85 0 1.54.2 2.07.6.53.4.79 1 .79 1.8 0 1.28-.35 2.18-.89 2.7-.54.52-1.22.78-2.03.78z" fill="#fff"/>
          </svg>
        </div>
        <div className="w-12 h-12 bg-[#2C2C2E] rounded-full flex items-center justify-center cursor-pointer border border-[#333333] text-white hover:bg-[#3A3A3C] transition-colors duration-200">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C5.372 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174.553.102.753-.24.753-.532v-1.893c-3.14-.683-3.802-1.517-3.802-1.517-.512-1.302-1.248-1.65-1.248-1.65-.992-.676.074-.662.074-.662 1.09.074 1.66 1.118 1.66 1.118.968 1.65 2.536 1.173 3.152.898.098-.696.378-1.173.687-1.442-2.41-.274-4.942-1.205-4.942-5.36s.82-3.892 2.15-4.417c-.216-.484-.932-2.09.204-4.342 0 0 1.75-.442 5.72 1.69a19.463 19.463 0 015-.67c1.7.001 3.398.225 5 .67 3.97-2.132 5.72-1.69 5.72-1.69 1.136 2.252.42 3.858.204 4.342 1.33.525 2.15 2.057 2.15 4.417 0 4.166-2.536 5.086-4.948 5.366.39.336.746.994.746 2.004v2.964c0 .296.2.63.753.532C20.837 21.426 24 17.084 24 12 24 5.372 18.628 0 12 0z" fill="#fff"/>
          </svg>
        </div>
      </div>

      <p className="text-sm text-gray-400">
        Don't have an account? <Link to="/signup" className="text-blue-400 no-underline font-bold hover:text-blue-300 transition-colors duration-200">Sign Up</Link>
      </p>
    </div>
  );
}

export default LoginBox;
