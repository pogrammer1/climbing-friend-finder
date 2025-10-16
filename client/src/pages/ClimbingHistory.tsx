import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ClimbingSessionForm from '../components/ClimbingSessionForm';
import GymsMap from '../components/GymsMap';

interface ClimbingSession {
  _id: string;
  date: string;
  location: string;
  climbingType: string;
  routes: {
    name?: string;
    grade: string;
    type: 'bouldering' | 'sport' | 'trad';
    status: 'sent' | 'project' | 'attempted' | 'onsight' | 'flash';
    attempts?: number;
    notes?: string;
  }[];
  duration: number;
  notes?: string;
  partners?: string[];
  weather?: string;
  conditions?: string;
}

interface Achievement {
  _id: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
  metadata?: any;
}

interface Statistics {
  totalSessions: number;
  totalTime: number;
  sessionsByType: { _id: string; count: number }[];
  topLocations: { _id: string; count: number }[];
  gradeProgression: { _id: string; highestGrade: string }[];
  recentSessions: number;
}

const ClimbingHistory: React.FC = () => {
  const { token } = useAuth();
  const [sessions, setSessions] = useState<ClimbingSession[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'sessions' | 'statistics' | 'achievements'>('sessions');
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [editingSession, setEditingSession] = useState<ClimbingSession | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sessionsRes, achievementsRes, statisticsRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL}/api/climbing/sessions`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${process.env.REACT_APP_API_URL}/api/climbing/achievements`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${process.env.REACT_APP_API_URL}/api/climbing/statistics`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (sessionsRes.ok) {
        const sessionsData = await sessionsRes.json();
        setSessions(sessionsData.sessions);
      }

      if (achievementsRes.ok) {
        const achievementsData = await achievementsRes.json();
        setAchievements(achievementsData);
      }

      if (statisticsRes.ok) {
        const statisticsData = await statisticsRes.json();
        setStatistics(statisticsData);
      }
      // prefetch gyms for selection/map features
      try {
        const gymsRes = await fetch(`${process.env.REACT_APP_API_URL}/api/gyms`);
        if (gymsRes.ok) {
          // might store them in state later; for now just warm the cache
          await gymsRes.json();
        }
      } catch (e) {
        console.warn('Failed to prefetch gyms', e);
      }
    } catch (error) {
      console.error('Error fetching climbing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateString: string) => {
    // Create date from string and ensure we're using the date as intended
    // regardless of timezone by treating it as a local date
    const date = new Date(dateString);
    
    // If the date looks like it might have timezone issues (ends with Z or has time),
    // parse it more carefully
    if (dateString.includes('T') || dateString.includes('Z')) {
      // Extract just the date part and create a new date in local timezone
      const datePart = dateString.split('T')[0];
      const [year, month, day] = datePart.split('-').map(Number);
      const localDate = new Date(year, month - 1, day); // month is 0-indexed
      return localDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'project': return 'bg-purple-100 text-purple-800';
      case 'attempted': return 'bg-yellow-100 text-yellow-800';
      case 'onsight': return 'bg-blue-100 text-blue-800';
      case 'flash': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSaveSession = async (sessionData: any) => {
    setSaving(true);
    setError('');
    
    try {
      // Ensure the date is sent in the correct format to avoid timezone issues
      const processedSessionData = {
        ...sessionData,
        // Convert date to ISO string at midnight in local timezone to avoid timezone shifts
        date: new Date(sessionData.date + 'T00:00:00').toISOString()
      };
      
      const url = editingSession 
        ? `${process.env.REACT_APP_API_URL}/api/climbing/sessions/${editingSession._id}`
        : `${process.env.REACT_APP_API_URL}/api/climbing/sessions`;
      
      const method = editingSession ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(processedSessionData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save session');
      }

      // Refresh data
      await fetchData();
      
      // Close form
      setShowSessionForm(false);
      setEditingSession(null);
      
    } catch (error: any) {
      setError(error.message || 'Failed to save session');
    } finally {
      setSaving(false);
    }
  };

  const handleEditSession = (session: ClimbingSession) => {
    setEditingSession(session);
    setShowSessionForm(true);
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!window.confirm('Are you sure you want to delete this session?')) {
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/climbing/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete session');
      }

      // Refresh data
      await fetchData();
      
    } catch (error: any) {
      console.error('Error deleting session:', error);
      alert('Failed to delete session');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Climbing History</h1>
          
          {showSessionForm && (
            <div className="mb-6">
              <ClimbingSessionForm
                session={editingSession || undefined}
                onSave={handleSaveSession}
                onCancel={() => {
                  setShowSessionForm(false);
                  setEditingSession(null);
                }}
                isLoading={saving}
                error={error}
              />
            </div>
          )}
          
          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-1 sm:space-x-4 px-0 sm:px-6 w-full justify-between">
                <button
                  onClick={() => setActiveTab('sessions')}
                  className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex-1 text-center ${
                    activeTab === 'sessions'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Sessions ({sessions.length})
                </button>
                <button
                  onClick={() => setActiveTab('statistics')}
                  className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex-1 text-center ${
                    activeTab === 'statistics'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Statistics
                </button>
                <button
                  onClick={() => setActiveTab('achievements')}
                  className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex-1 text-center ${
                    activeTab === 'achievements'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Achievements ({achievements.length})
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow-md">
            {activeTab === 'sessions' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">Climbing Sessions</h2>
                  <button 
                    onClick={() => setShowSessionForm(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
                  >
                    Add Session
                  </button>
                </div>
                <div className="mb-6">
                  <GymsMap onSelectGym={(gymId: string) => {
                    // find gym name from prefetched gyms list
                    // we'll fetch gyms here to resolve name
                    (async () => {
                      try {
                        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/gyms`);
                        if (res.ok) {
                          const all = await res.json();
                          const gym = all.find((g: any) => g._id === gymId);
                          if (gym) {
                            // open the form and prefill
                            setShowSessionForm(true);
                            setEditingSession(null);
                            // communicate to the form by storing selectedGymId in local storage temporarily
                            localStorage.setItem('selectedGymId', gym._id);
                            localStorage.setItem('selectedGymName', gym.name);
                          }
                        }
                      } catch (e) { console.warn('Failed to fetch gyms for selection', e); }
                    })();
                  }} />
                </div>
                
                {sessions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🧗‍♀️</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No climbing sessions yet</h3>
                    <p className="text-gray-500 mb-4">Start tracking your climbing progress by adding your first session!</p>
                    <button 
                      onClick={() => setShowSessionForm(true)}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
                    >
                      Log Your First Session
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sessions.map((session) => (
                      <div key={session._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800">
                              {session.location}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {formatDate(session.date)} • {session.climbingType} • {formatDuration(session.duration)}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleEditSession(session)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteSession(session._id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        
                        {session.routes.length > 0 && (
                          <div className="mb-3">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Routes:</h4>
                            <div className="flex flex-wrap gap-2">
                              {session.routes.map((route, index) => (
                                <span
                                  key={index}
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(route.status)}`}
                                >
                                  {route.grade} {route.status}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {session.notes && (
                          <p className="text-sm text-gray-600">{session.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'statistics' && statistics && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Climbing Statistics</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600">{statistics.totalSessions}</div>
                    <div className="text-sm text-blue-600">Total Sessions</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-600">{formatDuration(statistics.totalTime)}</div>
                    <div className="text-sm text-green-600">Total Time</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-purple-600">{statistics.recentSessions}</div>
                    <div className="text-sm text-purple-600">Sessions (30 days)</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-orange-600">{achievements.length}</div>
                    <div className="text-sm text-orange-600">Achievements</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Sessions by Type</h3>
                    {statistics.sessionsByType.map((type) => (
                      <div key={type._id} className="flex justify-between items-center py-2">
                        <span className="capitalize">{type._id}</span>
                        <span className="font-semibold">{type.count}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Locations</h3>
                    {statistics.topLocations.map((location) => (
                      <div key={location._id} className="flex justify-between items-center py-2">
                        <span>{location._id}</span>
                        <span className="font-semibold">{location.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'achievements' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Achievements</h2>
                
                {achievements.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🏆</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No achievements yet</h3>
                    <p className="text-gray-500">Start climbing to unlock achievements and track your progress!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {achievements.map((achievement) => (
                      <div key={achievement._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="text-2xl">{achievement.icon}</div>
                          <div>
                            <h3 className="font-semibold text-gray-800">{achievement.title}</h3>
                            <p className="text-sm text-gray-600">{achievement.description}</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">
                          Unlocked {formatDate(achievement.unlockedAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClimbingHistory; 