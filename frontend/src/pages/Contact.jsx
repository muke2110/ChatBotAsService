import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-primary-600">Contact Us</h1>
          <Link to="/" className="btn-secondary">Back to Home</Link>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} required className="input-field mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required className="input-field mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Message</label>
            <textarea name="message" value={form.message} onChange={handleChange} required rows={4} className="input-field mt-1" />
          </div>
          <button type="submit" className="btn-primary w-full">Send Message</button>
        </form>
        {submitted && (
          <div className="mt-6 text-green-600 text-center font-semibold">Thank you for reaching out! We'll get back to you soon.</div>
        )}
        <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6 text-gray-500 dark:text-gray-400 text-sm">
          <p>Email: support@chatbotservice.com</p>
          <p>Address: 1234 Tech Lane, Bangalore, India</p>
        </div>
      </div>
    </div>
  );
};

export default Contact; 