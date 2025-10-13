'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "What is OnlyPrompts?",
    answer: "OnlyPrompts is a community-driven platform for discovering, sharing, and learning from AI prompts. We provide a curated collection of high-quality prompts across various categories to help users get the most out of AI tools."
  },
  {
    question: "How do I submit a prompt?",
    answer: "Click on the 'Submit' button in the navigation menu, fill out the form with your prompt details, including title, description, full prompt text, category, and an example image. Once submitted, our team will review it before publishing."
  },
  {
    question: "What makes a good AI prompt?",
    answer: "A good AI prompt is clear, specific, and detailed. It should include relevant context, style preferences, technical specifications, and desired output format. The more specific you are, the better the results will be."
  },
  {
    question: "How do I copy a prompt?",
    answer: "Simply click the 'Copy' button on any prompt card or in the detailed modal view. The full prompt text will be copied to your clipboard and ready to use in your AI tool of choice."
  },
  {
    question: "Can I use these prompts commercially?",
    answer: "Yes, all prompts on OnlyPrompts are shared with the community and can be used for personal or commercial projects. However, we encourage giving credit to the original author when possible."
  },
  {
    question: "How are prompts categorized?",
    answer: "Prompts are organized into categories like Art & Design, Writing, Marketing, Code, Photography, and more. You can browse by category or use the search function to find specific types of prompts."
  },
  {
    question: "What AI tools work with these prompts?",
    answer: "Our prompts are designed to work with popular AI tools like ChatGPT, Midjourney, DALL-E, Stable Diffusion, Claude, and many others. Most prompts are versatile and can be adapted to different AI platforms."
  },
  {
    question: "How do I report inappropriate content?",
    answer: "If you encounter any inappropriate or offensive content, please contact us through our contact page. We take content moderation seriously and will review all reports promptly."
  },
  {
    question: "Is OnlyPrompts free to use?",
    answer: "Yes, OnlyPrompts is completely free to use. You can browse, search, and copy prompts without any cost. We believe in making AI creativity accessible to everyone."
  },
  {
    question: "How can I contribute to the community?",
    answer: "You can contribute by submitting high-quality prompts, sharing feedback, reporting issues, or suggesting new features. We welcome all forms of community participation!"
  }
];

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFAQs = faqData.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 via-white to-red-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Help &
              <span className="text-black">
                {' '}FAQ
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Find answers to common questions and learn how to make the most of OnlyPrompts.
            </p>
          </div>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for help topics..."
              className="w-full px-6 py-4 pl-14 pr-4 text-lg border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm"
            />
            <svg
              className="absolute left-5 top-4 h-6 w-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* FAQ Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          
          {filteredFAQs.length > 0 ? (
            <div className="space-y-4">
              {filteredFAQs.map((faq, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                    <svg
                      className={`h-5 w-5 text-gray-500 transition-transform ${
                        openIndex === index ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {openIndex === index && (
                    <div className="px-6 pb-4">
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No results found
              </h3>
              <p className="text-gray-600">
                Try searching with different keywords or browse all FAQs below.
              </p>
            </div>
          )}
        </section>

        {/* Quick Links */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Quick Help Topics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Getting Started</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• How to browse prompts</li>
                <li>• Understanding prompt categories</li>
                <li>• Using the search function</li>
                <li>• Copying prompts to clipboard</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Submitting Prompts</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Writing effective prompts</li>
                <li>• Choosing the right category</li>
                <li>• Adding example images</li>
                <li>• Review process</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI Tools</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• ChatGPT prompts</li>
                <li>• Image generation prompts</li>
                <li>• Code generation prompts</li>
                <li>• Adapting prompts for different tools</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Community</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Giving feedback</li>
                <li>• Reporting issues</li>
                <li>• Contributing to discussions</li>
                <li>• Following best practices</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Contact Support */}
        <section className="text-center">
          <div className="bg-black rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">Still Need Help?</h2>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Can&apos;t find what you&apos;re looking for? Our support team is here to help you get the most out of OnlyPrompts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/contact" 
                className="inline-flex items-center px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-100 transition-all duration-200 font-medium"
              >
                Contact Support
              </a>
              <a 
                href="/submit" 
                className="inline-flex items-center px-6 py-3 border border-white/30 text-white rounded-lg hover:bg-white/10 transition-all duration-200 font-medium"
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

