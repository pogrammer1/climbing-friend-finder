import React from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        <header className="text-center">
          <img src={logo} className="h-24 w-24 mx-auto mb-6 animate-spin" alt="logo" />
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Climbing Friend Finder
          </h1>
          <p className="text-gray-600 mb-6">
            Find climbing partners and make new friends!
          </p>
          <a
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Get Started
          </a>
        </header>
      </div>
    </div>
  );
}

export default App;
