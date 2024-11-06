'use client';

import { useState } from 'react';
import { loginUser, getCurrentUser } from './authHandlers';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await loginUser(username, password);
      if (result.success) {
        const userData = await getCurrentUser();
        if (userData) {
          localStorage.setItem('user', JSON.stringify(userData));
        }
        router.push('/wine-cellar');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500">{error}</p>}
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-green-500">Username</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm text-black p-2"
        />
      </div>
      <div className="relative">
        <label htmlFor="password" className="block text-sm font-medium text-green-500">Password</label>
        <div className="relative mt-1">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="block w-full border border-gray-300 rounded-md shadow-sm text-black p-2 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute top-1/2 -translate-y-1/2 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
      <button 
        type="submit" 
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" 
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : 'Log in'}
      </button>
    </form>
  );
}
