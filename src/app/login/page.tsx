import Image from 'next/image';
import LoginForm from '../auth/LoginForm';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black text-green-500 flex flex-col items-center justify-start pt-8 px-4 sm:px-6 lg:px-8">
      <Link href="/" className="mb-2 touch-action-manipulation">
        <Image
          src="/mywinelogo.png"
          alt="MyWine Logo"
          width={150}
          height={150}
          className="touch-action-manipulation"
        />
      </Link>
      <div className="w-full max-w-md space-y-1">
        <h2 className="text-center text-3xl font-extrabold mb-2">Log in to your account</h2>
        <div className="bg-black py-4 px-4 shadow sm:rounded-lg sm:px-8 border border-red-500">
          <LoginForm />
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-red-500"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-black text-red-500 text-base">
                  Don't have an account?
                </span>
              </div>
            </div>
            <div className="mt-3">
              <Link 
                href="/register" 
                className="w-full inline-flex items-center justify-center h-10 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-black bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 touch-action-manipulation"
              >
                <span className="flex items-center justify-center">Register</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
