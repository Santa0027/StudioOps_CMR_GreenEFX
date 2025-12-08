import React from 'react';
import SignupBox from './SignupBox';

function SignupPage() {
  return (
    <div className="flex h-screen w-screen bg-[#1a1a1a] text-white">
      <SignupBox />
      <div className="flex-1 relative overflow-hidden rounded-r-lg">
        <img src="https://assets.website-files.com/63a144e557b7f14b3017161e/63a144e557b7f1e737171694_abstract-background.jpg" alt="Abstract Background" className="absolute inset-0 w-full h-full object-cover" />
      </div>
    </div>
  );
}

export default SignupPage;
