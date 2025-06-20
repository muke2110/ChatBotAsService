import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import PricingPlans from '../components/shared/PricingPlans';

const features = [
  {
    name: 'Document-based Training',
    description: 'Upload your documents and train the chatbot with your specific knowledge base.',
    svg: (
      <svg width="64" height="64" fill="none" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#E0F2FE"/><path d="M20 24h24v16H20z" fill="#38BDF8"/><rect x="24" y="28" width="16" height="8" rx="2" fill="#fff"/><rect x="28" y="32" width="8" height="2" rx="1" fill="#38BDF8"/></svg>
    ),
  },
  {
    name: 'AI-Powered Responses',
    description: 'Advanced AI models ensure accurate and contextual responses to user queries.',
    svg: (
      <svg width="64" height="64" fill="none" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#F0FDF4"/><circle cx="32" cy="32" r="12" fill="#34D399"/><path d="M32 24v16M24 32h16" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
    ),
  },
  {
    name: 'Secure & Private',
    description: 'Your data is encrypted and securely stored. We never share your information.',
    svg: (
      <svg width="64" height="64" fill="none" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#F1F5F9"/><rect x="20" y="28" width="24" height="16" rx="4" fill="#64748B"/><circle cx="32" cy="36" r="3" fill="#fff"/></svg>
    ),
  },
  {
    name: 'Real-time Chat',
    description: 'Instant responses and seamless conversation flow for better user experience.',
    svg: (
      <svg width="64" height="64" fill="none" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#F3E8FF"/><rect x="18" y="24" width="28" height="12" rx="4" fill="#A78BFA"/><rect x="24" y="40" width="16" height="4" rx="2" fill="#A78BFA"/></svg>
    ),
  },
];

const testimonials = [
  {
    content: "Implementing this chatbot has reduced our customer support load by 50%. It's incredibly accurate and easy to set up.",
    author: "Sarah Johnson",
    role: "Customer Success Manager",
    company: "TechCorp Inc.",
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    content: "The document training feature is a game-changer. Our chatbot now handles complex product queries with ease.",
    author: "Michael Chen",
    role: "Product Manager",
    company: "InnovateLabs",
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    content: "Best investment we made this year. The ROI was clear within the first month of implementation.",
    author: "Emily Rodriguez",
    role: "Operations Director",
    company: "GlobalTech Solutions",
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
  },
];

const Landing = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, [location]);
  return (
    <div className="bg-gradient-to-b from-blue-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 min-h-screen">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/80 dark:bg-gray-900/80 z-50 shadow backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <img className="h-9 w-auto mr-3" src="/logo.svg" alt="Logo" />
              <span className="font-bold text-xl text-primary-600 tracking-tight">ChatBot SaaS</span>
            </div>
            <div className="flex items-center space-x-2">
              <Link to="/login" className="btn-secondary">Sign in</Link>
              <Link to="/register" className="btn-primary animate-bounce">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center pt-40 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary-100/60 via-white/60 to-primary-200/40 dark:from-gray-900/80 dark:via-gray-900/60 dark:to-gray-800/80 pointer-events-none" />
        <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 drop-shadow-lg animate-fade-in">
          <span className="block">Add AI Chatbot to Your Website</span>
          <span className="block text-primary-600 bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent animate-gradient">in Minutes</span>
        </h1>
        <p className="mx-auto max-w-2xl text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 animate-fade-in delay-100">
          Train your AI chatbot with your own documents and provide instant support to your customers. No coding required.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in delay-200">
          <Link to="/register" className="btn-primary px-8 py-3 text-lg font-semibold shadow-lg hover:scale-105 transition-transform">Get Started Free</Link>
          <Link to="#pricing" className="btn-secondary px-8 py-3 text-lg font-semibold shadow hover:scale-105 transition-transform">See Pricing</Link>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">Powered by Advanced AI & Cloud Technologies</h2>
            <p className="text-lg text-gray-500 dark:text-gray-400">Our chatbot platform leverages state-of-the-art infrastructure and models for the best results.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            <div className="flex flex-col items-center bg-white dark:bg-gray-900 rounded-xl shadow p-6">
              {/* RAG SVG */}
              <svg width="56" height="56" fill="none" viewBox="0 0 56 56" className="mb-4"><rect width="56" height="56" rx="14" fill="#E0E7FF"/><path d="M18 28h20M28 18v20" stroke="#6366F1" strokeWidth="2" strokeLinecap="round"/><circle cx="28" cy="28" r="6" fill="#6366F1"/></svg>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">RAG Implementation</h3>
              <p className="text-base text-gray-500 dark:text-gray-400">Retrieval Augmented Generation combines search and generation for highly accurate, context-aware answers.</p>
            </div>
            <div className="flex flex-col items-center bg-white dark:bg-gray-900 rounded-xl shadow p-6">
              {/* FAISS SVG */}
              <svg width="56" height="56" fill="none" viewBox="0 0 56 56" className="mb-4"><rect width="56" height="56" rx="14" fill="#D1FAE5"/><rect x="16" y="16" width="24" height="24" rx="6" fill="#10B981"/><path d="M24 32l8-8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">FAISS Vector Search</h3>
              <p className="text-base text-gray-500 dark:text-gray-400">Lightning-fast semantic search using Facebook's FAISS for instant, relevant document retrieval.</p>
            </div>
            <div className="flex flex-col items-center bg-white dark:bg-gray-900 rounded-xl shadow p-6">
              {/* AWS Embedding SVG */}
              <svg width="56" height="56" fill="none" viewBox="0 0 56 56" className="mb-4"><rect width="56" height="56" rx="14" fill="#FEF9C3"/><path d="M28 18v20M18 28h20" stroke="#F59E42" strokeWidth="2" strokeLinecap="round"/><circle cx="28" cy="28" r="6" fill="#F59E42"/></svg>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">AWS-Powered Embeddings</h3>
              <p className="text-base text-gray-500 dark:text-gray-400">Enterprise-grade embeddings and text models hosted on AWS for security, scalability, and performance.</p>
            </div>
            <div className="flex flex-col items-center bg-white dark:bg-gray-900 rounded-xl shadow p-6">
              {/* Text Enhancement SVG */}
              <svg width="56" height="56" fill="none" viewBox="0 0 56 56" className="mb-4"><rect width="56" height="56" rx="14" fill="#FCE7F3"/><path d="M20 36l8-16 8 16" stroke="#EC4899" strokeWidth="2" strokeLinecap="round"/><circle cx="28" cy="36" r="3" fill="#EC4899"/></svg>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Text Enhancement Models</h3>
              <p className="text-base text-gray-500 dark:text-gray-400">Advanced NLP models enhance, summarize, and clarify responses for a superior user experience.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">Everything you need to support your customers</h2>
            <p className="text-lg text-gray-500 dark:text-gray-400">Powerful features to make your chatbot smarter and more effective.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col items-center bg-gradient-to-br from-primary-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl shadow p-6 hover:shadow-xl transition-shadow">
                <div className="mb-4">{feature.svg}</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{feature.name}</h3>
                <p className="text-base text-gray-500 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24">
        <PricingPlans isAuthenticated={false} />
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">Trusted by companies worldwide</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 flex flex-col items-center text-center hover:shadow-2xl transition-shadow">
                <img src={testimonial.avatar} alt={testimonial.author} className="w-16 h-16 rounded-full mb-4 border-2 border-primary-500" />
                <p className="text-gray-600 dark:text-gray-300 mb-4">“{testimonial.content}”</p>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{testimonial.author}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{testimonial.role}, {testimonial.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <img className="h-8 w-auto mr-2" src="/logo.svg" alt="Logo" />
            <span className="font-bold text-lg text-primary-600">ChatBot SaaS</span>
          </div>
          <div className="flex space-x-6">
            <Link to="/terms" className="text-gray-400 hover:text-primary-600 transition-colors">Terms</Link>
            <Link to="/privacy" className="text-gray-400 hover:text-primary-600 transition-colors">Privacy</Link>
            <Link to="/contact" className="text-gray-400 hover:text-primary-600 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing; 