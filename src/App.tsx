import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';
import { ErrorBoundary } from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CreatePage from './pages/CreatePage';
import Dashboard from './pages/Dashboard';
import ViewPage from './pages/ViewPage';
import Chatbot from './components/Chatbot';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Navbar user={user} />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home user={user} />} />
              <Route path="/create" element={<CreatePage user={user} />} />
              <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/" />} />
              <Route path="/p/:id" element={<ViewPage />} />
            </Routes>
          </main>
          <Chatbot />
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
