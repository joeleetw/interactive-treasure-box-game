import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

interface Score {
  score: number;
  created_at: string;
}

export default function Scores() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('scores')
      .select('score, created_at')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setScores(data ?? []); setLoading(false); });
  }, []);

  function handleSignOut() {
    signOut();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex flex-col items-center justify-center p-8">
      <div className="absolute top-4 right-4 flex items-center gap-3">
        <span className="text-sm text-amber-700">{user?.email}</span>
        <Button variant="outline" size="sm" className="border-amber-400 text-amber-800 hover:bg-amber-100" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>

      <div className="w-full max-w-md">
        <h1 className="text-3xl text-center text-amber-900 mb-2">🏆 My Scores</h1>
        <p className="text-center text-amber-700 mb-6 text-sm">Your game history</p>

        {loading ? (
          <p className="text-center text-amber-700">Loading…</p>
        ) : scores.length === 0 ? (
          <p className="text-center text-amber-700">No games played yet. Go hunt some treasure!</p>
        ) : (
          <div className="space-y-2">
            {scores.map((s, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white/80 rounded-lg border-2 border-amber-200 shadow-sm">
                <span className={`text-xl font-semibold ${s.score >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${s.score}
                </span>
                <span className="text-sm text-amber-600">
                  {new Date(s.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex gap-3 justify-center">
          <Button onClick={() => navigate('/game')} className="bg-amber-600 hover:bg-amber-700 text-white">
            Play Again
          </Button>
        </div>
      </div>
    </div>
  );
}
