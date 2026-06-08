import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

interface FormData {
  email: string;
  password: string;
}

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<FormData>();

  async function onSubmit(data: FormData) {
    setError('');
    try {
      await signIn(data.email, data.password);
      navigate('/game');
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex items-center justify-center p-8">
      <div className="w-full max-w-sm bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border-2 border-amber-300 p-8">
        <h1 className="text-2xl text-center text-amber-900 mb-6">🏴‍☠️ Treasure Hunt</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email" className="text-amber-800">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register('email', { required: true })}
              className="border-amber-300 focus-visible:ring-amber-400"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="password" className="text-amber-800">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register('password', { required: true })}
              className="border-amber-300 focus-visible:ring-amber-400"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
          >
            {isSubmitting ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-4 space-y-2 text-center text-sm">
          <p className="text-amber-700">
            No account?{' '}
            <Link to="/signup" className="underline font-medium text-amber-900">Sign up</Link>
          </p>
          <Button
            variant="ghost"
            className="w-full text-amber-600 hover:text-amber-800"
            onClick={() => navigate('/game', { state: { guest: true } })}
          >
            Play as Guest
          </Button>
        </div>
      </div>
    </div>
  );
}
