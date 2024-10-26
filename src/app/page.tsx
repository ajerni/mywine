import Image from "next/image";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 pt-16 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-black text-red-500">
      <header className="flex justify-center w-full mt-20">
        <Image
          src="/mywinelogo.png"
          alt="Wine Cellar logo"
          width={180}
          height={38}
          priority
          className="m-5"
        />
      </header>
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold mt-20">Welcome to Your Wine Cellar</h1>
        <h2 className="text-xl">Track and manage your wine collection effortlessly</h2>
        <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2">
            Start by adding your first wine to the collection.
          </li>
          <li>Explore features to categorize and rate your wines.</li>
        </ol>

        <div className="flex justify-center w-full">
          <div className="flex gap-4 items-center flex-col sm:flex-row">
            <a
              className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-red-500 text-black gap-2 hover:bg-red-700 dark:hover:bg-red-300 text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
              href="/wine-cellar"
            >
              Get Started
            </a>
            <a
              className="rounded-full border border-solid border-red-500 transition-colors flex items-center justify-center text-red-500 gap-2 hover:bg-red-700 hover:text-white dark:hover:bg-red-300 text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
              href="/learn-more"
            >
              Learn More
            </a>
          </div>
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="/about"
        >
          About Us
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="/contact"
        >
          Contact
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="/faq"
        >
          FAQ
        </a>
      </footer>
    </div>
  );
}