import Link from 'next/link';
import './globals.css';
import { ToastProvider } from '@/components/ui/ToastContainer';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white min-h-screen">
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:bg-red-600 focus:text-white focus:px-4 focus:py-2 focus:rounded focus:z-50 focus:outline-none focus:ring-2 focus:ring-white"
        >
          Skip to main content
        </a>
        <ToastProvider>
          <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <Link 
                    href="/" 
                    className="text-xl font-bold text-red-500 hover:text-red-400 focus:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800 rounded-sm px-1 py-1 transition-colors"
                    aria-label="MMA Gear - Home"
                  >
                    MMA Gear
                  </Link>
                </div>
                <nav role="navigation" aria-label="Main navigation">
                  <ul className="flex space-x-8">
                    <li>
                      <Link 
                        href="/" 
                        className="text-gray-300 hover:text-red-400 focus:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800 rounded-sm px-2 py-1 transition-colors"
                        aria-current="page"
                      >
                        Home
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href="/contact" 
                        className="text-gray-300 hover:text-red-400 focus:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800 rounded-sm px-2 py-1 transition-colors"
                      >
                        Contact
                      </Link>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </header>
          <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" role="main">
            {children}
          </main>
          <footer className="bg-gray-800 border-t border-gray-700 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="text-center text-gray-400">
                <small>&copy; 2024 MMA Gear E-commerce Site</small>
              </div>
            </div>
          </footer>
        </ToastProvider>
      </body>
    </html>
  );
}
