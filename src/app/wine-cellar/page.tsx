import Link from 'next/link';

// Sample data for the wine table
const wines = [
  { name: 'Château Margaux', grapes: 'Cabernet Sauvignon, Merlot', country: 'France', year: 2015, price: 1200, quantiy: 3 },
  { name: 'Opus One', grapes: 'Cabernet Sauvignon, Merlot', country: 'USA', year: 2018, price: 350, quantiy: 2 },
  { name: 'Sassicaia', grapes: 'Cabernet Sauvignon, Cabernet Franc', country: 'Italy', year: 2017, price: 250, quantiy: 1 },
];

export default function WineCellar() {
  return (
    <div className="min-h-screen bg-black text-red-500 p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Your Wine Cellar</h1>
      </header>
      <main>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-red-500">
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Grapes</th>
              <th className="p-2 text-left">Country</th>
              <th className="p-2 text-left">Year</th>
              <th className="p-2 text-left">Price ($)</th>
              <th className="p-2 text-left">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {wines.map((wine, index) => (
              <tr key={index} className="border-b border-red-500 hover:bg-red-900">
                <td className="p-2">{wine.name}</td>
                <td className="p-2">{wine.grapes}</td>
                <td className="p-2">{wine.country}</td>
                <td className="p-2">{wine.year}</td>
                <td className="p-2">{wine.price}</td>
                <td className="p-2">{wine.quantiy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
      <footer className="mt-8">
        <Link href="/" className="text-red-500 hover:underline">
          Back to Home
        </Link>
      </footer>
    </div>
  );
}
