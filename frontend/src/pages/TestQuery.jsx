import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const TestQuery = () => {
  const { token, clientId } = useAuth();
  const [hasDocuments, setHasDocuments] = useState(true);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkDocuments = async () => {
      try {
        const response = await fetch('/api/v1/documents', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-client-id': clientId
          }
        });

        if (response.ok) {
          const data = await response.json();
          setHasDocuments(!!data.document);
        }
      } catch (error) {
        console.error('Error checking documents:', error);
      }
    };

    checkDocuments();
  }, [token, clientId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/v1/embed/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-client-id': clientId
        },
        body: JSON.stringify({ query: query.trim() })
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      console.log("data:::::: ", data.answer);
      setResponse(data.answer);
    } catch (error) {
      toast.error('Failed to get response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {!hasDocuments && (
            <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700 dark:text-yellow-200">
                    You haven't uploaded any documents yet. The chatbot won't be able to answer questions without training data.{' '}
                    <a href="/upload" className="font-medium underline text-yellow-700 dark:text-yellow-200 hover:text-yellow-600 dark:hover:text-yellow-100">
                      Upload documents now
                    </a>
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Test Your Chatbot
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="query" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Enter your query
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="query"
                      name="query"
                      rows={3}
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Ask a question about your uploaded documents..."
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading || !hasDocuments}
                    className="btn-primary"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      'Send Query'
                    )}
                  </button>
                </div>
              </form>

              {response && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Response
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                      {response}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TestQuery; 