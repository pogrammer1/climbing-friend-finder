import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import LoginForm from './components/LoginForm';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <LoginForm 
        onLogin={handleLogin} 
        isLoading={isLoading} 
        error={error}
        success={success}
      />
    </div>
  );
}

export default App;
