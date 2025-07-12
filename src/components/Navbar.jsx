import React, { useState, useEffect } from 'react';
import { ChevronDown, Search, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../config/Firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function Navbar({ searchQuery, setSearchQuery, sortBy, setSortBy }) {
  const navigate = useNavigate();
  const [userSession, setUserSession] = useState(JSON.parse(sessionStorage.getItem('userSession')));
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Function to handle "Ask New Question" button click
  const handleAskQuestion = () => {
    const userSessionData = sessionStorage.getItem('userSession');
    if (userSessionData) {
      try {
        const userData = JSON.parse(userSessionData);
        if (userData.username && userData.email) {
          navigate('/create-question');
        } else {
          alert('First Sign-In');
          navigate('/register');
        }
      } catch (error) {
        console.error('Error parsing userSession:', error);
        alert('First Sign-In');
        navigate('/register');
      }
    } else {
      alert('First Sign-In');
      navigate('/register');
    }
  };

  // Sync sessionStorage with Firebase auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // User is logged in, fetch data if sessionStorage is empty
        if (!sessionStorage.getItem('userSession')) {
          try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
              const userData = {
                username: userDoc.data().username,
                email: userDoc.data().email,
                phoneNumber: userDoc.data().phoneNumber,
                role: userDoc.data().role,
                createdAt: userDoc.data().createdAt.toDate().toISOString(),
              };
              sessionStorage.setItem('userSession', JSON.stringify(userData));
              setUserSession(userData);
            }
          } catch (err) {
            console.error('Error fetching user data:', err);
          }
        } else {
          setUserSession(JSON.parse(sessionStorage.getItem('userSession')));
        }
      } else {
        // User is logged out, clear session
        sessionStorage.removeItem('userSession');
        setUserSession(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Logout function
  const handleLogout = () => {
    auth.signOut()
      .then(() => {
        sessionStorage.removeItem('userSession');
        setUserSession(null);
        navigate('/login');
      })
      .catch((err) => {
        console.error('Logout error:', err.code, err.message);
      });
  };

  return (
    <header className="border-b border-gray-700 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-white">StackIt</h1>
          <div className="flex items-center space-x-2">
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              onClick={handleAskQuestion}
            >
              Ask New Question
            </button>
            <button 
              onClick={() => setSortBy(sortBy === 'newest' ? 'unanswered' : 'newest')}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-800 border border-gray-600 rounded-md hover:bg-gray-700 transition-colors"
            >
              <span>{sortBy === 'newest' ? 'Newest' : 'Unanswered'}</span>
              <ChevronDown size={16} />
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-800 border border-gray-600 rounded-md hover:bg-gray-700 transition-colors">
              <span>more</span>
              <ChevronDown size={16} />
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 px-4 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />
          </div>
          {userSession ? (
            <div className="relative">
              <button
                className="flex items-center space-x-2 px-4 py-2 bg-gray-800 border border-gray-600 rounded-md hover:bg-gray-700 transition-colors"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <User size={18} />
                <span>{userSession.username}</span>
                <ChevronDown size={16} />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-600 rounded-md shadow-lg z-10">
                  <div className="px-4 py-2 text-sm text-gray-300">
                    <p><strong>Email:</strong> {userSession.email}</p>
                    <p><strong>Role:</strong> {userSession.role}</p>
                    <p><strong>Joined:</strong> {new Date(userSession.createdAt).toLocaleDateString()}</p>
                  </div>
                  <button
                    className="w-full text-left px-4 py-2 text-blue-400 hover:bg-gray-700 transition-colors flex items-center space-x-2"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} />
                    <span>Log out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              className="px-4 py-2 border border-gray-600 rounded-md hover:bg-gray-800 transition-colors"
              onClick={() => navigate('/login')}
            >
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
}