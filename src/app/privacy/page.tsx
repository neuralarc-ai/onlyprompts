import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-600">
              Your privacy is important to us. Learn how we collect, use, and protect your information.
            </p>
          </div>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-8">
              <strong>Last updated:</strong> October 2025
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
            <p className="text-gray-600 mb-4">
              <strong>Personal Data:</strong> Name, email, company, contact details.
            </p>
            <p className="text-gray-600 mb-4">
              <strong>Technical Data:</strong> IP address, browser type, device identifiers, usage logs.
            </p>
            <p className="text-gray-600 mb-6">
              <strong>Cookies:</strong> We use cookies for analytics and personalization.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Use of Information</h2>
            <p className="text-gray-600 mb-4">
              We use the information to:
            </p>
            <ul className="text-gray-600 mb-6 list-disc pl-6 space-y-2">
              <li>Provide, maintain, and improve our Services;</li>
              <li>Process transactions and communicate with you;</li>
              <li>Monitor usage trends and enhance security;</li>
              <li>Comply with legal obligations.</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Legal Basis for Processing</h2>
            <p className="text-gray-600 mb-6">
              Where applicable, we process your data on the basis of your consent, our contractual obligations, compliance with legal obligations, or legitimate interests.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Sharing</h2>
            <p className="text-gray-600 mb-4">
              We do not sell or rent your data. We may share it with:
            </p>
            <ul className="text-gray-600 mb-6 list-disc pl-6 space-y-2">
              <li>Authorized service providers (under strict confidentiality);</li>
              <li>Legal or regulatory authorities, when required;</li>
              <li>Affiliates and successors in interest, in the event of a business transfer.</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Retention</h2>
            <p className="text-gray-600 mb-6">
              We retain your data only as long as necessary to fulfill the purposes outlined in this Policy, unless a longer retention period is required by law.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Security</h2>
            <p className="text-gray-600 mb-6">
              We implement appropriate administrative, technical, and physical safeguards to protect your information against unauthorized access or disclosure.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Your Rights</h2>
            <p className="text-gray-600 mb-6">
              Depending on your jurisdiction, you may have rights to access, correct, delete, or restrict the processing of your data. Please contact us at 
              <a href="mailto:support@onlyprompts.com" className="text-blue-600 hover:underline"> support@onlyprompts.com</a>.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. International Transfers</h2>
            <p className="text-gray-600 mb-6">
              If your data is transferred outside of India, we ensure appropriate safeguards are in place, including data processing agreements and, where applicable, standard contractual clauses.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Changes</h2>
            <p className="text-gray-600 mb-6">
              We may update this Privacy Policy periodically. We encourage you to review this page regularly.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}







