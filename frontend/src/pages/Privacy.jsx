import React from 'react';
import { Link } from 'react-router-dom';

const Privacy = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
    <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary-600">Privacy Policy</h1>
        <Link to="/" className="btn-secondary">Back to Home</Link>
      </div>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
        <p>Your privacy is important to us. This policy explains how we collect, use, and protect your information.</p>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">2. Data Collection</h2>
        <p>We collect information you provide when registering, using our chatbot, or contacting support.</p>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">3. Data Usage</h2>
        <p>Your data is used to provide and improve our services, personalize your experience, and communicate with you.</p>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">4. Cookies</h2>
        <p>We use cookies to enhance your experience and analyze site usage. You can control cookies through your browser settings.</p>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">5. Data Security</h2>
        <p>We implement industry-standard security measures to protect your data from unauthorized access or disclosure.</p>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">6. Third-Party Services</h2>
        <p>We may use third-party services for analytics, payments, or other features. These providers have their own privacy policies.</p>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">7. User Rights</h2>
        <p>You have the right to access, update, or delete your personal information. Contact us for assistance.</p>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">8. Changes to Policy</h2>
        <p>We may update this Privacy Policy from time to time. Continued use of the service means you accept the new policy.</p>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-2">9. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please <Link to="/contact" className="text-primary-600 underline">contact us</Link>.</p>
      </section>
    </div>
  </div>
);

export default Privacy; 