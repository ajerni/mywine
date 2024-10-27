import Image from 'next/image';
import LoginForm from '../auth/LoginForm';
import Link from 'next/link';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black text-green-500 flex flex-col items-center justify-start pt-12 px-4 sm:px-6 lg:px-8">
      <ToastContainer />
      <Image
        src="/mywinelogo.png"
        alt="MyWine Logo"
        width={225}
        height={225}
        className="mb-4"
      />
      <div className="w-full max-w-md space-y-2">
        <h2 className="text-center text-4xl font-extrabold mb-4">Log in to your account</h2>
        <div className="bg-black py-6 px-4 shadow sm:rounded-lg sm:px-10 border border-red-500">
          <LoginForm />
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-red-500"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-black text-red-500 text-lg">
                  Don't have an account?
                </span>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/register" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-black bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                Register
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
