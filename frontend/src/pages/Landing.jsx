import React from 'react';
import { Link } from 'react-router-dom';
import { ChatBubbleLeftRightIcon, DocumentTextIcon, CpuChipIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import PricingPlans from '../components/shared/PricingPlans';

const features = [
  {
    name: 'Document-based Training',
    description: 'Upload your documents and train the chatbot with your specific knowledge base.',
    icon: DocumentTextIcon,
  },
  {
    name: 'AI-Powered Responses',
    description: 'Advanced AI models ensure accurate and contextual responses to user queries.',
    icon: CpuChipIcon,
  },
  {
    name: 'Secure & Private',
    description: 'Your data is encrypted and securely stored. We never share your information.',
    icon: ShieldCheckIcon,
  },
  {
    name: 'Real-time Chat',
    description: 'Instant responses and seamless conversation flow for better user experience.',
    icon: ChatBubbleLeftRightIcon,
  },
];

const testimonials = [
  {
    content: "Implementing this chatbot has reduced our customer support load by 50%. It's incredibly accurate and easy to set up.",
    author: "Sarah Johnson",
    role: "Customer Success Manager",
    company: "TechCorp Inc."
  },
  {
    content: "The document training feature is a game-changer. Our chatbot now handles complex product queries with ease.",
    author: "Michael Chen",
    role: "Product Manager",
    company: "InnovateLabs"
  },
  {
    content: "Best investment we made this year. The ROI was clear within the first month of implementation.",
    author: "Emily Rodriguez",
    role: "Operations Director",
    company: "GlobalTech Solutions"
  },
];

const Landing = () => {
  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Navigation */}
      <nav className="fixed w-full bg-white dark:bg-gray-900 z-50 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <img
                  className="h-8 w-auto"
                  src="/logo.svg"
                  alt="Logo"
                />
              </div>
            </div>
            <div className="flex items-center">
              <Link
                to="/login"
                className="btn-secondary mr-4"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="btn-primary"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-16 sm:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
              <span className="block">Add AI Chatbot to Your Website</span>
              <span className="block text-primary-600">in Minutes</span>
            </h1>
            <p className="mx-auto mt-3 max-w-md text-base text-gray-500 dark:text-gray-400 sm:text-lg md:mt-5 md:max-w-3xl md:text-xl">
              Train your AI chatbot with your own documents and provide instant support to your customers. No coding required.
            </p>
            <div className="mx-auto mt-5 max-w-md sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <Link
                  to="/register"
                  className="btn-primary w-full px-8 py-3 text-base font-medium sm:w-auto"
                >
                  Get Started Free
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Everything you need to support your customers
            </h2>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
              Powerful features to make your chatbot smarter and more effective.
            </p>
          </div>

          <div className="mt-20">
            <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <div key={feature.name} className="text-center">
                  <div className="flex justify-center">
                    <feature.icon className="h-12 w-12 text-primary-600" />
                  </div>
                  <h3 className="mt-6 text-lg font-medium text-gray-900 dark:text-white">
                    {feature.name}
                  </h3>
                  <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-24">
        <PricingPlans isAuthenticated={false} />
      </div>

      {/* Testimonials Section */}
      <div className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Trusted by companies worldwide
            </h2>
          </div>

          <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8"
              >
                <p className="text-gray-600 dark:text-gray-300">
                  "{testimonial.content}"
                </p>
                <div className="mt-6">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {testimonial.author}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8 md:flex md:items-center md:justify-between">
            <div className="flex space-x-6 md:order-2">
              <Link to="/terms" className="text-gray-400 hover:text-gray-500">
                Terms
              </Link>
              <Link to="/privacy" className="text-gray-400 hover:text-gray-500">
                Privacy
              </Link>
              <Link to="/contact" className="text-gray-400 hover:text-gray-500">
                Contact
              </Link>
            </div>
            <p className="mt-8 text-base text-gray-400 md:mt-0 md:order-1">
              &copy; 2024 ChatBot-as-a-Service. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing; 