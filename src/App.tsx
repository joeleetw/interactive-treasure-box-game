import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Game from '@/pages/Game';
import Scores from '@/pages/Scores';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/game" element={<ProtectedRoute allowGuest><Game /></ProtectedRoute>} />
      <Route path="/scores" element={<ProtectedRoute><Scores /></ProtectedRoute>} />
    </Routes>
  );
}
