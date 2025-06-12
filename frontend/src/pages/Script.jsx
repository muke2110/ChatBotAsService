import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import { ClipboardDocumentIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Script = () => {
  const { clientId } = useAuth();
  const [hasDocuments, setHasDocuments] = useState(true);
  const [theme, setTheme] = useState({
    position: 'bottom-left',
    primaryColor: '#0ea5e9',
    textColor: '#ffffff',
    backgroundColor: '#1f2937'
  });

  useEffect(() => {
    const checkDocuments = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/v1/documents', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-client-id': clientId
          }
        });

        if (response.ok) {
          const data = await response.json();
          setHasDocuments(data.documents && data.documents.length > 0);
        }
      } catch (error) {
        console.error('Error checking documents:', error);
      }
    };

    checkDocuments();
  }, [clientId]);

  const scriptCode = `<!-- Add the chatbot script -->
<script src="http://localhost:3000/chatbot.min.js" defer></script>

<!-- Initialize the chatbot -->
<script defer>
    window.addEventListener('load', function() {
        // Initialize the chatbot with your client ID
        const chatbot = new ChatbotService({
            clientId: '${clientId}',
            // Optional configurations
            apiUrl: 'http://localhost:3000/api/v1', // Note: Changed to http since we're in development
            position: "${theme.position}",
            theme: {
              primaryColor: "${theme.primaryColor}",
              textColor: "${theme.textColor}",
              backgroundColor: "${theme.backgroundColor}"
            }
        });
    });
</script>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(scriptCode).then(() => {
      toast.success('Script copied to clipboard!');
    });
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
                Add Chatbot to Your Website
              </h2>
              
              <div className="mb-8">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Copy and paste this script into your website's HTML, just before the closing &lt;/body&gt; tag.
                </p>
              </div>

              <div className="relative">
                <pre className="bg-gray-900 rounded-lg p-4 text-sm text-white overflow-x-auto">
                  <code>{scriptCode}</code>
                </pre>
                <button
                  onClick={copyToClipboard}
                  className="absolute top-2 right-2 p-2 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300"
                >
                  <ClipboardDocumentIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Configuration Options
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Position
                    </label>
                    <select
                      value={theme.position}
                      onChange={(e) => setTheme(prev => ({ ...prev, position: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                    >
                      <option value="bottom-right">Bottom Right</option>
                      <option value="bottom-left">Bottom Left</option>
                      <option value="top-right">Top Right</option>
                      <option value="top-left">Top Left</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Primary Color
                    </label>
                    <input
                      type="color"
                      value={theme.primaryColor}
                      onChange={(e) => setTheme(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Text Color
                    </label>
                    <input
                      type="color"
                      value={theme.textColor}
                      onChange={(e) => setTheme(prev => ({ ...prev, textColor: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Background Color
                    </label>
                    <input
                      type="color"
                      value={theme.backgroundColor}
                      onChange={(e) => setTheme(prev => ({ ...prev, backgroundColor: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Script; 