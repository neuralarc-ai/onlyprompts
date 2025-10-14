import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row items-center justify-between space-y-2 lg:space-y-0">
          {/* Copyright - Left Side */}
          <div className="text-gray-500 text-sm text-center lg:text-left whitespace-nowrap">
            © 2025 OnlyPrompts. Created and Powered by{' '}
            <a 
              href="https://he2.ai/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-bold text-gray-700 hover:text-gray-900 transition-colors"
            >
              Helium AI
            </a>
            .
          </div>

          {/* Navigation Links - Right Side */}
          <div className="flex items-center space-x-4 flex-wrap justify-center lg:justify-end">
            <Link href="/terms" className="text-gray-500 hover:text-gray-700 transition-colors text-sm whitespace-nowrap">
              Terms
            </Link>
            <Link href="/privacy" className="text-gray-500 hover:text-gray-700 transition-colors text-sm whitespace-nowrap">
              Privacy
            </Link>
            <Link href="/help" className="text-gray-500 hover:text-gray-700 transition-colors text-sm whitespace-nowrap">
              FAQ
            </Link>
            <Link href="/contact" className="text-gray-500 hover:text-gray-700 transition-colors text-sm whitespace-nowrap">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

