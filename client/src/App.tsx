import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLogin, setIsLogin] = useState(true);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      console.log('Attempting login with email:', email);
      
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      console.log('Login successful! Token received:', data.token ? 'Yes' : 'No');
      setSuccess('Login successful! Welcome back!');
      // TODO: Store token and redirect user
      
    } catch (error: any) {
      console.error('Login failed:', error);
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (userData: any) => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      console.log('Attempting registration with:', userData.username);
      
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      console.log('Registration successful! Token received:', data.token ? 'Yes' : 'No');
      setSuccess('Account created successfully! Welcome to Climbing Friend Finder!');
      // TODO: Store token and redirect user
      
    } catch (error: any) {
      console.error('Registration failed:', error);
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Toggle Buttons */}
        <div className="flex mb-4 bg-white rounded-lg p-1 shadow-lg">
          <button
            onClick={() => {
              setIsLogin(true);
              setError('');
              setSuccess('');
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
              setError('');
              setSuccess('');
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

export default App;
