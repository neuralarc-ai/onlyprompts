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
              Please read these terms carefully before using OnlyPrompts.
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

            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Eligibility and Account Responsibility</h2>
            <p className="text-gray-600 mb-6">
              You must be at least 18 years of age and capable of entering into a legally binding contract to access or use the Services. You are responsible for maintaining the confidentiality of your account credentials and for all activities occurring under your account.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. License to Use Services</h2>
            <p className="text-gray-600 mb-6">
              Subject to your compliance with these Terms, OnlyPrompts grants you a limited, non-exclusive, non-transferable, revocable license to access and use the Services solely for your internal business purposes. You shall not use the Services to develop competing products or reverse engineer any aspect of the platform.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Prohibited Conduct</h2>
            <p className="text-gray-600 mb-6">
              You shall not:
            </p>
            <ul className="text-gray-600 mb-6 list-disc pl-6 space-y-2">
              <li>Use the Services in any manner that infringes any intellectual property or proprietary rights of any party;</li>
              <li>Use or access the Services to violate any applicable law or regulation;</li>
              <li>Introduce malware or harmful code, scrape data, or interfere with service functionality;</li>
              <li>Misrepresent your identity or affiliation.</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Ownership and Intellectual Property</h2>
            <p className="text-gray-600 mb-6">
              All content, trademarks, and software associated with the Services are the exclusive property of OnlyPrompts or its licensors. No rights are granted except as explicitly set forth herein.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Third-Party Integrations</h2>
            <p className="text-gray-600 mb-6">
              The Services may contain links or integrations with third-party platforms. OnlyPrompts is not responsible for the content, functionality, or privacy practices of such third parties.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Disclaimers</h2>
            <p className="text-gray-600 mb-6">
              The Services are provided &quot;as is&quot; and &quot;as available.&quot; OnlyPrompts makes no warranties or representations, express or implied, regarding the Services, including but not limited to merchantability, fitness for a particular purpose, accuracy, or non-infringement.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Limitation of Liability</h2>
            <p className="text-gray-600 mb-6">
              To the maximum extent permitted by applicable law, OnlyPrompts shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or for loss of profits or revenue, arising from or related to your use of the Services.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Indemnification</h2>
            <p className="text-gray-600 mb-6">
              You agree to indemnify, defend, and hold harmless OnlyPrompts, its officers, directors, employees, and affiliates from any claim, demand, liability, or expense arising out of your breach of these Terms or violation of applicable law.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Governing Law and Jurisdiction</h2>
            <p className="text-gray-600 mb-6">
              These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Pune, Maharashtra.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes</h2>
            <p className="text-gray-600 mb-6">
              We reserve the right to modify these Terms at any time. Continued use after changes constitutes acceptance of the updated Terms.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}





