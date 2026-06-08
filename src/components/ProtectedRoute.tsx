import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ReactNode } from 'react';

export default function ProtectedRoute({ children, allowGuest = false }: { children: ReactNode; allowGuest?: boolean }) {
  const { user } = useAuth();
  const location = useLocation();
  const isGuest = location.state?.guest === true;

  if (!user && !(allowGuest && isGuest)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
