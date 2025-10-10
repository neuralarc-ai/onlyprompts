import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              About
              <span className="text-black">
                {' '}NanoB
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              We're building the world's largest community-driven platform for AI prompts, 
              where creativity meets artificial intelligence.
            </p>
          </div>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Mission Section */}
        <section className="mb-16">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Our Mission</h2>
            <p className="text-lg text-gray-600 leading-relaxed text-center max-w-3xl mx-auto">
              NanoB exists to democratize AI creativity by providing a platform where anyone can discover, 
              share, and learn from the best AI prompts. We believe that artificial intelligence should be 
              accessible to everyone, regardless of their technical background.
            </p>
          </div>
        </section>

        {/* What We Do */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">What We Do</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Discover</h3>
              <p className="text-gray-600">
                Explore thousands of curated AI prompts across various categories and use cases.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Share</h3>
              <p className="text-gray-600">
                Contribute your own prompts and help the community grow with quality content.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Innovate</h3>
              <p className="text-gray-600">
                Push the boundaries of AI creativity with cutting-edge prompt engineering.
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="mb-16">
          <div className="bg-black rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-8 text-center">Our Impact</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold mb-2">10K+</div>
                <div className="text-gray-300">AI Prompts</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">5K+</div>
                <div className="text-gray-300">Active Users</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">50+</div>
                <div className="text-gray-300">Categories</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">100K+</div>
                <div className="text-gray-300">Monthly Views</div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Built with ❤️</h2>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <p className="text-lg text-gray-600 leading-relaxed text-center max-w-3xl mx-auto mb-6">
              NanoB is built by a passionate team of developers, designers, and AI enthusiasts 
              who believe in the power of community-driven innovation.
            </p>
            <div className="text-center">
              <p className="text-gray-500 mb-4">
                Interested in joining our team or contributing to the project?
              </p>
              <a 
                href="/contact" 
                className="inline-flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-200 font-medium"
              >
                Get in Touch
              </a>
            </div>
          </div>
        </section>

        {/* Technology Stack */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Technology Stack</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Next.js', icon: '⚡' },
              { name: 'React', icon: '⚛️' },
              { name: 'TypeScript', icon: '🔷' },
              { name: 'Tailwind CSS', icon: '🎨' }
            ].map((tech, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                <div className="text-3xl mb-3">{tech.icon}</div>
                <div className="font-semibold text-gray-900">{tech.name}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact CTA */}
        <section className="text-center">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Get Involved</h2>
            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
              Have questions, suggestions, or want to contribute to NanoB? 
              We'd love to hear from you!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/contact" 
                className="inline-flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-200 font-medium"
              >
                Contact Us
              </a>
              <a 
                href="/submit" 
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                Submit a Prompt
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

