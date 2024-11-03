import Image from 'next/image';
import RegisterForm from '../auth/RegisterForm';
import Link from 'next/link';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-black text-green-500 flex flex-col items-center justify-start pt-8 px-4 sm:px-6 lg:px-8">
      <ToastContainer />
      <Link href="/" className="mb-2">
        <Image
          src="/mywinelogo.png"
          alt="MyWine Logo"
          width={150}
          height={150}
        />
      </Link>
      <div className="w-full max-w-md space-y-1">
        <h2 className="text-center text-3xl font-extrabold mb-2">Create your account</h2>
        <div className="bg-black py-4 px-4 shadow sm:rounded-lg sm:px-8 border border-red-500">
          <RegisterForm />
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-red-500"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-black text-red-500 text-base">
                  Already have an account?
                </span>
              </div>
            </div>
            <div className="mt-3">
              <Link href="/login" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-black bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                Log in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
