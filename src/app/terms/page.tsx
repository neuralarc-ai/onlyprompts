import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Terms of Service
            </h1>
            <p className="text-xl text-gray-600">
              Please read these terms carefully before using NanoB.
            </p>
          </div>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-8">
              <strong>Last updated:</strong> January 2024
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceptance of Terms</h2>
            <p className="text-gray-600 mb-6">
              By accessing and using NanoB, you accept and agree to be bound by the terms and 
              provision of this agreement.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Use License</h2>
            <p className="text-gray-600 mb-6">
              Permission is granted to temporarily use NanoB for personal, non-commercial transitory 
              viewing only. This is the grant of a license, not a transfer of title.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Content Guidelines</h2>
            <p className="text-gray-600 mb-6">
              You agree to submit only appropriate, lawful content. Content that is harmful, 
              offensive, or violates any laws is prohibited.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Disclaimer</h2>
            <p className="text-gray-600 mb-6">
              The materials on NanoB are provided on an &apos;as is&apos; basis. NanoB makes no warranties, 
              expressed or implied, and hereby disclaims and negates all other warranties.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Limitations</h2>
            <p className="text-gray-600 mb-6">
              In no event shall NanoB or its suppliers be liable for any damages arising out of 
              the use or inability to use the materials on NanoB.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
            <p className="text-gray-600 mb-6">
              If you have any questions about these Terms of Service, please contact us at 
              <a href="mailto:legal@nanob.com" className="text-blue-600 hover:underline"> legal@nanob.com</a>.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}





