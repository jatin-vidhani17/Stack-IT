import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { auth, FirebaseProvider } from './config/Firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
// import CreateQuestion from './components/Home/CreateQuestion';
import ResetPassword from './components/auth/ResetPassword';
import Home from './pages/Home';
import QuestionDetail from './pages/QuestionDetail';
import ErrorBoundary from './components/ErrorBoundary';
import CreateQuestion from './pages/CreateQuestion';
import Profile from './components/Profile';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-gray-900 text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <FirebaseProvider>
      <ErrorBoundary>
        <Routes>
          <Route path="/create-question" element={<CreateQuestion />} />
          <Route path="/" element={<Home user={user} />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to={location.state?.from || '/'} />} />
          <Route path="/reset-password" element={!user ? <ResetPassword /> : <Navigate to="/" />} />
          <Route path="/question/:id" element={<QuestionDetail />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
        </Routes>
      </ErrorBoundary>
      </FirebaseProvider>
    </div>
  );
}

export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}