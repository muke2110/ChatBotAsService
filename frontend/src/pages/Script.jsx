import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import { ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Script = () => {
  const { clientId } = useAuth();
  const [theme, setTheme] = useState({
    position: 'bottom-left',
    primaryColor: '#0ea5e9',
    textColor: '#ffffff',
    backgroundColor: '#1f2937'
  });

  const scriptCode = `<!-- Add the chatbot script -->
<script src="http://localhost:3000/chatbot.min.js" defer></script>

<!-- Initialize the chatbot -->
<script defer>
    window.addEventListener('load', function() {
        console.log("${clientId}");
        
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
                  Customize Appearance
                </h3>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Position
                    </label>
                    <select
                      value={theme.position}
                      onChange={(e) => setTheme({ ...theme, position: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-primary-500 focus:ring-primary-500"
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
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="color"
                        value={theme.primaryColor}
                        onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Text Color
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="color"
                        value={theme.textColor}
                        onChange={(e) => setTheme({ ...theme, textColor: e.target.value })}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Background Color
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="color"
                        value={theme.backgroundColor}
                        onChange={(e) => setTheme({ ...theme, backgroundColor: e.target.value })}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Preview
                </h3>
                <div
                  className="border dark:border-gray-700 rounded-lg p-4"
                  style={{
                    backgroundColor: theme.backgroundColor,
                    color: theme.textColor
                  }}
                >
                  <div
                    className="w-full h-12 rounded-t-lg mb-4"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    <div className="flex items-center h-full px-4">
                      <span className="font-medium">Chat with us</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: theme.primaryColor }}
                    >
                      <span className="text-sm">AI</span>
                    </div>
                    <div className="flex-1">
                      <div className="bg-white bg-opacity-10 rounded-lg p-3">
                        <p className="text-sm">
                          Hello! How can I help you today?
                        </p>
                      </div>
                    </div>
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