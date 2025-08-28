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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu when navigating
  const handleNavClick = () => setMobileMenuOpen(false);

  // Close mobile menu when clicking outside, but allow toggle by clicking the menu icon
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleClick = (e: MouseEvent) => {
      const nav = document.getElementById('mobile-nav-menu');
      const menuBtn = document.getElementById('mobile-menu-btn');
      if (
        nav && !nav.contains(e.target as Node) &&
        (!menuBtn || !menuBtn.contains(e.target as Node))
      ) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [mobileMenuOpen]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (showNotifications) {
        setNotifLoading(true);
        setNotifError('');
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/notifications`, {
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
      await fetch(`${process.env.REACT_APP_API_URL}/api/notifications/${notifId}/read`, {
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
          <div className="flex items-center flex-shrink-0">
            <Link to="/dashboard" className="text-lg md:text-xl font-bold text-blue-600 truncate">
              Climbing Friend Finder
            </Link>
          </div>

          {/* Navigation Links (Desktop) */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/dashboard" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive('/dashboard') ? 'bg-blue-500 text-white' : 'text-gray-700 hover:text-blue-600'}`}>Dashboard</Link>
            <Link to="/profile" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive('/profile') ? 'bg-blue-500 text-white' : 'text-gray-700 hover:text-blue-600'}`}>Profile</Link>
            <Link to="/search" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive('/search') ? 'bg-blue-500 text-white' : 'text-gray-700 hover:text-blue-600'}`}>Find Partners</Link>
            <Link to="/messages" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive('/messages') ? 'bg-blue-500 text-white' : 'text-gray-700 hover:text-blue-600'}`}>Messages</Link>
            <Link to="/climbing-history" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive('/climbing-history') ? 'bg-blue-500 text-white' : 'text-gray-700 hover:text-blue-600'}`}>History</Link>
          </div>

          {/* User Menu (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
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
                <div
                  className="absolute mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-2 sm:p-4 w-[95vw] max-w-xs right-2 left-auto md:w-80 md:max-w-none md:left-auto md:right-0 md:translate-x-0"
                  style={{ minWidth: '200px' }}
                >
                  {/* Top arrow/caret */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white border-t-0"></div>
                  <div className="text-gray-700 font-semibold mb-2 text-sm sm:text-base">Notifications</div>
                  {notifLoading ? (
                    <div className="text-gray-500 text-xs sm:text-sm">Loading...</div>
                  ) : notifError ? (
                    <div className="text-red-500 text-xs sm:text-sm">{notifError}</div>
                  ) : notifications.length === 0 ? (
                    <div className="text-gray-500 text-xs sm:text-sm">No notifications yet</div>
                  ) : (
                    <ul className="divide-y divide-gray-200 max-h-48 sm:max-h-64 overflow-y-auto">
                      {notifications.map((notif) => (
                        <li
                          key={notif._id}
                          className={`py-2 text-xs sm:text-sm cursor-pointer ${notif.read ? 'text-gray-400 bg-gray-50' : 'hover:bg-blue-50'}`}
                          onClick={() => !notif.read && handleMarkAsRead(notif._id)}
                        >
                          {notif.type === 'new_follower' ? (
                            <span>
                              <span className="font-semibold text-blue-600">@{notif.data?.followerUsername}</span> followed you
                            </span>
                          ) : (
                            <span>{notif.type}</span>
                          )}
                          <span className="block text-gray-400 text-[10px] sm:text-xs mt-1">{new Date(notif.createdAt).toLocaleString()}</span>
                          {notif.read && <span className="ml-2 text-[10px] sm:text-xs">(Read)</span>}
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

          {/* Mobile Menu Button and Bell (Right Side) */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Notifications Bell for Mobile */}
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
                <div
                  className="absolute mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 w-screen max-w-xs left-1/2 -translate-x-1/2 md:w-80 md:max-w-none md:left-auto md:right-0 md:translate-x-0"
                >
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
            {/* Mobile Menu Button */}
            <button
              id="mobile-menu-btn"
              className="p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={(e) => {
                e.stopPropagation();
                setMobileMenuOpen((open) => !open);
              }}
              aria-label="Open navigation menu"
            >
              <svg className="w-7 h-7 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div id="mobile-nav-menu" className="md:hidden absolute left-0 right-0 top-16 bg-white border-b border-gray-200 z-40 shadow-lg">
            <nav className="flex flex-col items-start p-4 space-y-2">
              <div className="w-full px-3 py-2 text-sm text-gray-600 border-b border-gray-200 mb-2">
                Welcome, {user?.firstName}!
              </div>
              <Link to="/dashboard" onClick={handleNavClick} className="w-full px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-blue-100">Dashboard</Link>
              <Link to="/profile" onClick={handleNavClick} className="w-full px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-blue-100">Profile</Link>
              <Link to="/search" onClick={handleNavClick} className="w-full px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-blue-100">Find Partners</Link>
              <Link to="/messages" onClick={handleNavClick} className="w-full px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-blue-100">Messages</Link>
              <Link to="/climbing-history" onClick={handleNavClick} className="w-full px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-blue-100">History</Link>
              <div className="w-full border-t border-gray-200 mt-2 pt-2">
                <button
                  onClick={() => { logout(); handleNavClick(); }}
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation; 