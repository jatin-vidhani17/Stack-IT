import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();
  const userSession = JSON.parse(sessionStorage.getItem('userSession'));

  if (!userSession) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Please log in to view your profile.</p>
          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={() => navigate('/login')}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 shadow-xl">
          <h2 className="text-3xl font-bold text-white mb-4">User Profile</h2>
          <div className="space-y-4">
            <p><strong>Username:</strong> {userSession.username}</p>
            <p><strong>Email:</strong> {userSession.email}</p>
            <p><strong>Phone:</strong> {userSession.phoneNumber}</p>
            <p><strong>Role:</strong> {userSession.role}</p>
            <p><strong>Joined:</strong> {new Date(userSession.createdAt).toLocaleDateString()}</p>
          </div>
          <button
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={() => navigate('/')}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}