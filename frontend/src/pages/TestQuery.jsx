import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import { toast } from 'react-hot-toast';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const TestQuery = () => {
  const { token, selectedWidget } = useAuth();
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasDocuments, setHasDocuments] = useState(true);
  const clientId = localStorage.getItem('clientId');

  const checkDocuments = useCallback(async () => {
    if (!selectedWidget) return;

    try {
      const params = new URLSearchParams();
      params.append('widgetId', selectedWidget.widgetId);

      const response = await fetch(`/api/v1/documents?${params}`, {
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
  }, [selectedWidget, token, clientId]);

  useEffect(() => {
    checkDocuments();
  }, [checkDocuments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      toast.error('Please enter a query');
      return;
    }

    if (!selectedWidget) {
      toast.error('Please select a widget first');
      return;
    }

    setLoading(true);
    setResponse('');

    try {
      const response = await fetch('/api/v1/query/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-client-id': clientId
        },
        body: JSON.stringify({
          query: query.trim(),
          widgetId: selectedWidget.widgetId
        })
      });

      if (response.ok) {
        const data = await response.json();
        setResponse(data.answer || 'No response received');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Query failed');
      }
    } catch (error) {
      console.error('Error sending query:', error);
      toast.error('Failed to send query');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedWidget) {
    return (
      <DashboardLayout>
        <div className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="bg-yellow-50 dark:bg-yellow-900/50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-yellow-700 dark:text-yellow-200">
                    Please select a widget from the dropdown above to test queries.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Test Your Chatbot
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Test queries for widget: <strong>{selectedWidget.name}</strong>
            </p>
          </div>

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
                Ask a Question
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="query" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Question
                  </label>
                  <textarea
                    id="query"
                    rows={4}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask a question about your uploaded documents..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    disabled={loading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Ask Question'}
                </button>
              </form>
            </div>
          </div>

          {response && (
            <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Response
                </h2>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {response}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TestQuery; 