import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import LoginForm from './components/LoginForm';

function App() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('Attempting login with email:', email);
      console.log('Password length:', password.length);
      // TODO: Add actual API call here
      // For now, just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Login successful!');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <LoginForm onLogin={handleLogin} isLoading={isLoading} />
    </div>
  );
}

export default App;
