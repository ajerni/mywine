'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';

export default function RecoverPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/recover-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
        toast.success('Check your email for password reset instructions');
      } else {
        toast.error(data.error || 'An error occurred');
      }
    } catch (error) {
      toast.error('Failed to send recovery email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-500 flex flex-col items-center justify-start pt-8 px-4 sm:px-6 lg:px-8">
      <ToastContainer />
      <Link href="/" className="mb-2">
        <Image
          src="/mywinelogo.png"
          alt="MyWine Logo"
          width={150}
          height={150}
          priority
        />
      </Link>
      <div className="w-full max-w-md space-y-1">
        <h2 className="text-center text-3xl font-extrabold mb-2">
          Recover Password
        </h2>
        <div className="bg-black py-4 px-4 shadow sm:rounded-lg sm:px-8 border border-red-500">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-green-500">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm text-black p-2"
                  placeholder="Enter your email"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center h-10 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Sending...
                  </>
                ) : (
                  'Send Recovery Email'
                )}
              </button>
            </form>
          ) : (
            <div className="text-center py-4">
              <p className="text-green-500 mb-4">
                If an account exists with this email, you will receive password reset instructions shortly.
              </p>
              <Link
                href="/login"
                className="text-red-500 hover:text-red-400 underline"
              >
                Return to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 