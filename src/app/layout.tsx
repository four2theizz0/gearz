import Link from 'next/link';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white min-h-screen">
        <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Link href="/" className="text-xl font-bold text-red-500 hover:text-red-400 transition-colors">
                  MMA Gear
                </Link>
              </div>
              <nav className="flex space-x-8">
                <Link href="/" className="text-gray-300 hover:text-red-400 transition-colors">
                  Home
                </Link>
                <Link href="/contact" className="text-gray-300 hover:text-red-400 transition-colors">
                  Contact
                </Link>
                <Link href="/admin" className="text-gray-300 hover:text-red-400 transition-colors">
                  Admin
                </Link>
              </nav>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="bg-gray-800 border-t border-gray-700 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center text-gray-400">
              <small>&copy; 2024 MMA Gear E-commerce Site</small>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
