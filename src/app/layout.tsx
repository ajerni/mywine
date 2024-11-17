import type { Metadata } from "next";
import localFont from "next/font/local";
import './globals.css'
import ClientSideWrapper from './ClientSideWrapper';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { Footer } from "@/components/layout/Footer"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Wine Cellar - Your Digital Wine Collection Manager",
  description: "Track and manage your wine collection effortlessly with Wine Cellar",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <meta 
          name="viewport" 
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0, viewport-fit=cover"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <script dangerouslySetInnerHTML={{
          __html: `
            function updateIOSViewportHeight() {
              const vh = window.innerHeight * 0.01;
              document.documentElement.style.setProperty('--vh', \`\${vh}px\`);
            }
            
            window.addEventListener('resize', updateIOSViewportHeight);
            window.addEventListener('orientationchange', updateIOSViewportHeight);
            updateIOSViewportHeight();
          `
        }} />
      </head>
      <body suppressHydrationWarning={true}>
        <ClientSideWrapper>
          <div className="flex flex-col min-h-screen">
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
        </ClientSideWrapper>
        <ToastContainer 
          position="top-center"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          className="toast-container"
        />
      </body>
    </html>
  );
}