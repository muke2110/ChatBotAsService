import React from 'react';
import { Link } from 'react-router-dom';

const Terms = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
    <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary-600">Terms of Service</h1>
        <Link to="/" className="btn-secondary">Back to Home</Link>
      </div>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
        <p>Welcome to ChatBot as a Service. By using our platform, you agree to these Terms of Service. Please read them carefully.</p>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">2. User Responsibilities</h2>
        <p>You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account.</p>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">3. Acceptable Use</h2>
        <p>Do not use our service for unlawful, harmful, or abusive purposes. We reserve the right to suspend accounts that violate these rules.</p>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">4. Payment & Subscription</h2>
        <p>All payments are processed securely. Subscriptions renew automatically unless cancelled. See our pricing page for details.</p>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">5. Intellectual Property</h2>
        <p>All content, trademarks, and data on this site are the property of ChatBot as a Service or its licensors.</p>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">6. Termination</h2>
        <p>We may terminate or suspend your access to the service at our discretion, without notice, for conduct that we believe violates these Terms.</p>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">7. Changes to Terms</h2>
        <p>We may update these Terms from time to time. Continued use of the service means you accept the new Terms.</p>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-2">8. Contact Us</h2>
        <p>If you have any questions about these Terms, please <Link to="/contact" className="text-primary-600 underline">contact us</Link>.</p>
      </section>
    </div>
  </div>
);

export default Terms; 