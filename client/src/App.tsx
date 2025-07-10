import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import { AuthProvider, useAuth } from './context/AuthContext';

function AppContent() {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    login, 
    register, 
    logout, 
    error, 
    success, 
    clearMessages 
  } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
    } catch (error) {
      // Error is already handled in the context
    }
  };

  const handleRegister = async (userData: any) => {
    try {
      await register(userData);
    } catch (error) {
      // Error is already handled in the context
    }
  };

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show user dashboard if authenticated
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800">
                Welcome, {user.firstName}!
              </h1>
              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
              >
                Logout
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-xl font-semibold mb-2">Your Profile</h2>
                <p><strong>Username:</strong> {user.username}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Experience:</strong> {user.experience}</p>
                <p><strong>Climbing Types:</strong> {user.climbingType.join(', ')}</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
                <p className="text-gray-600">Profile editing, climbing partner matching, and more features are on the way!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Toggle Buttons */}
        <div className="flex mb-4 bg-white rounded-lg p-1 shadow-lg">
          <button
            onClick={() => {
              setIsLogin(true);
              clearMessages();
            }}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors duration-200 ${
              isLogin 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => {
              setIsLogin(false);
              clearMessages();
            }}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors duration-200 ${
              !isLogin 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Register
          </button>
        </div>

        {/* Form */}
        {isLogin ? (
          <LoginForm 
            onLogin={handleLogin} 
            isLoading={isLoading} 
            error={error}
            success={success}
          />
        ) : (
          <RegisterForm 
            onRegister={handleRegister} 
            isLoading={isLoading} 
            error={error}
            success={success}
          />
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
