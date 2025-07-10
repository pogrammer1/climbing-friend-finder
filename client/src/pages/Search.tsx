import React from 'react';

const Search: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Find Climbing Partners</h1>
            
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-blue-800 mb-2">Partner Search</h2>
                <p className="text-blue-700">
                  The climbing partner search and matching system is coming soon! You'll be able to find climbers 
                  based on location, experience level, climbing types, and availability.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">Search Features</h3>
                  <ul className="text-green-700 space-y-1">
                    <li>• Filter by location</li>
                    <li>• Match by experience level</li>
                    <li>• Find similar climbing types</li>
                    <li>• Check availability schedules</li>
                    <li>• View climbing grades</li>
                  </ul>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-purple-800 mb-2">Matching System</h3>
                  <ul className="text-purple-700 space-y-1">
                    <li>• Smart compatibility scoring</li>
                    <li>• Mutual interest notifications</li>
                    <li>• Direct messaging</li>
                    <li>• Climbing history</li>
                    <li>• Safety ratings</li>
                  </ul>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">Coming Soon</h3>
                <p className="text-yellow-700">
                  We're building an advanced matching algorithm that will help you find the perfect climbing partner. 
                  The system will consider your climbing preferences, experience level, availability, and location 
                  to suggest compatible partners.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search; 