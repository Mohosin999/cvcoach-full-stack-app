import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from './hooks/redux';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Analyze from './pages/Analyze';
import History from './pages/History';
import Settings from './pages/Settings';
import Builder from './pages/Builder';
import SavedResumes from './pages/SavedResumes';
import Plans from './pages/Plans';
import LoadingSpinner from './components/LoadingSpinner';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAppSelector((state) => ({
    user: state.auth.user,
    loading: state.auth.loading,
  }));

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAppSelector((state) => ({
    user: state.auth.user,
    loading: state.auth.loading,
  }));

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return user ? <Navigate to="/dashboard" /> : <>{children}</>;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/analyze"
        element={
          <PrivateRoute>
            <Analyze />
          </PrivateRoute>
        }
      />
      <Route
        path="/history"
        element={
          <PrivateRoute>
            <History />
          </PrivateRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <PrivateRoute>
            <Settings />
          </PrivateRoute>
        }
      />
      <Route
        path="/builder"
        element={
          <PrivateRoute>
            <Builder />
          </PrivateRoute>
        }
      />
      <Route
        path="/my-resumes"
        element={
          <PrivateRoute>
            <SavedResumes />
          </PrivateRoute>
        }
      />
      <Route
        path="/saved-resumes"
        element={
          <PrivateRoute>
            <SavedResumes />
          </PrivateRoute>
        }
      />
      <Route
        path="/plans"
        element={
          <PrivateRoute>
            <Plans />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
