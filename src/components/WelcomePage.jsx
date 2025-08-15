import React, { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

const WelcomePage = () => {
  const [activeForm, setActiveForm] = useState('login'); // 'login' or 'signup'

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 to-yellow-600">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Chess Game</h1>
          <p className="text-gray-600">Welcome! Please sign in to play.</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveForm('login')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeForm === 'login'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setActiveForm('signup')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeForm === 'signup'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form Content */}
        <div className="transition-all duration-300">
          {activeForm === 'login' ? (
            <LoginForm onSwitchToSignup={() => setActiveForm('signup')} />
          ) : (
            <SignupForm onSwitchToLogin={() => setActiveForm('login')} />
          )}
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;