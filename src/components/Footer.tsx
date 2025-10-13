import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col space-y-4">
          {/* Navigation Links - Left Side */}
          <div className="flex items-center space-x-4">
            <Link href="/terms" className="text-gray-500 hover:text-gray-700 transition-colors text-sm">
              Terms
            </Link>
            <Link href="/privacy" className="text-gray-500 hover:text-gray-700 transition-colors text-sm">
              Privacy
            </Link>
            <Link href="/help" className="text-gray-500 hover:text-gray-700 transition-colors text-sm">
              FAQ
            </Link>
            <Link href="/contact" className="text-gray-500 hover:text-gray-700 transition-colors text-sm">
              Contact
            </Link>
          </div>

          {/* Copyright - Centered */}
          <div className="text-center text-gray-500 text-sm">
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
        </div>
      </div>
    </footer>
  );
}

