import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    const fetchNotifications = async () => {
      if (showNotifications) {
        setNotifLoading(true);
        setNotifError('');
        try {
          const response = await fetch('/api/notifications', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await response.json();
          if (response.ok) {
            setNotifications(data);
          } else {
            setNotifError(data.message || 'Failed to load notifications');
          }
        } catch {
          setNotifError('Failed to load notifications');
        } finally {
          setNotifLoading(false);
        }
      }
    };
    fetchNotifications();
  }, [showNotifications, token]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = async (notifId: string) => {
    try {
      await fetch(`/api/notifications/${notifId}/read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications((prev) => prev.map((n) => n._id === notifId ? { ...n, read: true } : n));
    } catch {}
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link to="/dashboard" className="text-xl font-bold text-blue-600">
              Climbing Friend Finder
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/dashboard"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                isActive('/dashboard')
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/profile"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                isActive('/profile')
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Profile
            </Link>
            <Link
              to="/search"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                isActive('/search')
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Find Partners
            </Link>
            <Link
              to="/messages"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                isActive('/messages')
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Messages
            </Link>
            <Link
              to="/climbing-history"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                isActive('/climbing-history')
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              History
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications((prev) => !prev)}
                className="focus:outline-none"
                aria-label="Notifications"
              >
                <svg className="w-6 h-6 text-gray-700 hover:text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
                  <div className="text-gray-700 font-semibold mb-2">Notifications</div>
                  {notifLoading ? (
                    <div className="text-gray-500 text-sm">Loading...</div>
                  ) : notifError ? (
                    <div className="text-red-500 text-sm">{notifError}</div>
                  ) : notifications.length === 0 ? (
                    <div className="text-gray-500 text-sm">No notifications yet</div>
                  ) : (
                    <ul className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
                      {notifications.map((notif) => (
                        <li
                          key={notif._id}
                          className={`py-2 text-sm cursor-pointer ${notif.read ? 'text-gray-400 bg-gray-50' : 'hover:bg-blue-50'}`}
                          onClick={() => !notif.read && handleMarkAsRead(notif._id)}
                        >
                          {notif.type === 'new_follower' ? (
                            <span>
                              <span className="font-semibold text-blue-600">@{notif.data?.followerUsername}</span> followed you
                            </span>
                          ) : (
                            <span>{notif.type}</span>
                          )}
                          <span className="block text-gray-400 text-xs mt-1">{new Date(notif.createdAt).toLocaleString()}</span>
                          {notif.read && <span className="ml-2 text-xs">(Read)</span>}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
            <span className="text-sm text-gray-700">
              Welcome, {user?.firstName}!
            </span>
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 