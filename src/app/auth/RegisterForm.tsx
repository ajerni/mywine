'use client';

import { useState } from 'react';
import { registerUser } from './authHandlers';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

export default function RegisterForm() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await registerUser(username, email, password);
      if (result.success) {
        router.push('/login');
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
    <form onSubmit={handleSubmit} className="space-y-4 pb-safe">
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
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-green-500">Email</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
      <div className="relative">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-green-500">Confirm Password</label>
        <div className="relative mt-1">
          <input
            type={showConfirmPassword ? "text" : "password"}
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="block w-full border border-gray-300 rounded-md shadow-sm text-black p-2 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute top-1/2 -translate-y-1/2 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
      <button 
        type="submit" 
        className="w-full inline-flex items-center justify-center h-10 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" 
        disabled={isLoading}
      >
        <span className="flex items-center justify-center">
          {isLoading ? 'Loading...' : 'Register'}
        </span>
      </button>
    </form>
  );
}
