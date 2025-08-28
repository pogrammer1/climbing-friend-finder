import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';

const Auth: React.FC = () => {
  const { isAuthenticated, isLoading, login, register, error, success, clearMessages } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Show loading while checking authentication
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="w-full max-w-md px-4">
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
};

export default Auth; 