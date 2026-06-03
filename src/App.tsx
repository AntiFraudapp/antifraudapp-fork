import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import Dashboard from './pages/Dashboard';
import AuthPage from './pages/AuthPage';

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription?.unsubscribe();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  return session ? <Dashboard /> : <AuthPage />;
}
