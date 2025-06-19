import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import { ClipboardDocumentIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Script = () => {
  const { token, clientId, selectedWidget } = useAuth();
  const [hasDocuments, setHasDocuments] = useState(true);
  const [scriptConfig, setScriptConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScriptConfig = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (selectedWidget) {
          params.append('widgetId', selectedWidget.widgetId);
        }

        const response = await fetch(`/api/v1/script/config?${params}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-client-id': clientId
          }
        });

        if (response.ok) {
          const data = await response.json();
          setScriptConfig(data);
        }
      } catch (error) {
        console.error('Error fetching script config:', error);
        toast.error('Failed to load script configuration');
      } finally {
        setLoading(false);
      }
    };

    fetchScriptConfig();
  }, [token, clientId, selectedWidget]);

  useEffect(() => {
    const checkDocuments = async () => {
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
    };

    checkDocuments();
  }, [token, clientId, selectedWidget]);

  const generateScriptCode = () => {
    if (!scriptConfig) return '';

    const config = scriptConfig.config;
    return `<!-- Add the chatbot script -->
<script src="${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/chatbot.js" defer></script>

<!-- Initialize the chatbot -->
<script defer>
    window.addEventListener('load', function() {
        // Initialize the chatbot with your configuration
        const chatbot = new ChatbotService({
            clientId: '${config.clientId}',
            widgetId: '${config.widgetId || ''}',
            apiUrl: '${config.apiEndpoint}',
            position: "${config.position}",
            theme: {
              primaryColor: "${config.theme.primaryColor}",
              textColor: "${config.theme.textColor}",
              backgroundColor: "${config.theme.backgroundColor}"
            },
            botName: "${config.botName}",
            welcomeMessage: "${config.welcomeMessage}"
        });
    });
</script>`;
  };

  const copyToClipboard = () => {
    const scriptCode = generateScriptCode();
    navigator.clipboard.writeText(scriptCode).then(() => {
      toast.success('Script copied to clipboard!');
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!selectedWidget) {
    return (
      <DashboardLayout>
        <div className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="bg-yellow-50 dark:bg-yellow-900/50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-yellow-700 dark:text-yellow-200">
                    Please select a widget from the dropdown above to generate the script.
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
              Script Configuration
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Widget: <strong>{selectedWidget.name}</strong>
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
                    You haven't uploaded any documents for this widget yet. The chatbot won't be able to answer questions without training data.{' '}
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
                  <code>{generateScriptCode()}</code>
                </pre>
                <button
                  onClick={copyToClipboard}
                  className="absolute top-2 right-2 p-2 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300"
                >
                  <ClipboardDocumentIcon className="h-5 w-5" />
                </button>
              </div>

              {scriptConfig && (
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Current Configuration
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Widget ID
                      </label>
                      <div className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 px-3 py-2 text-sm">
                        {scriptConfig.config.widgetId || 'Not specified'}
                      </div>
                    </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Position
                    </label>
                      <div className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 px-3 py-2 text-sm">
                        {scriptConfig.config.position}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Primary Color
                    </label>
                    <div className="mt-1 flex items-center space-x-2">
                      <div 
                        className="w-8 h-8 rounded border border-gray-300"
                          style={{ backgroundColor: scriptConfig.config.theme.primaryColor }}
                      />
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                          {scriptConfig.config.theme.primaryColor}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Text Color
                    </label>
                    <div className="mt-1 flex items-center space-x-2">
                      <div 
                        className="w-8 h-8 rounded border border-gray-300"
                          style={{ backgroundColor: scriptConfig.config.theme.textColor }}
                      />
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                          {scriptConfig.config.theme.textColor}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Background Color
                    </label>
                    <div className="mt-1 flex items-center space-x-2">
                      <div 
                        className="w-8 h-8 rounded border border-gray-300"
                          style={{ backgroundColor: scriptConfig.config.theme.backgroundColor }}
                      />
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                          {scriptConfig.config.theme.backgroundColor}
                      </span>
                    </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Bot Name
                      </label>
                      <div className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 px-3 py-2 text-sm">
                        {scriptConfig.config.botName}
                      </div>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    To modify these settings, please visit the{' '}
                      <a href="/widgets" className="text-primary-600 hover:text-primary-500">
                        Widgets page
                    </a>
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

export default Script; 