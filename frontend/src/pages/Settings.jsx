import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import toast from 'react-hot-toast';

const Settings = () => {
  const { token, clientId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    theme: {
      primaryColor: '#0ea5e9',
      textColor: '#ffffff',
      backgroundColor: '#1f2937'
    },
    position: 'bottom-right',
    welcomeMessage: 'Hello! How can I help you today?',
    botName: 'AI Assistant'
  });

  const handleSettingsChange = (key, value) => {
    if (key.includes('.')) {
      const [parent, child] = key.split('.');
      setSettings(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [key]: value
      }));
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      if (!response.ok) throw new Error('Failed to save settings');

      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const regenerateClientId = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/client/regenerate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to regenerate client ID');

      toast.success('Client ID regenerated successfully! Please update your website script.');
    } catch (error) {
      toast.error('Failed to regenerate client ID. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {/* Client ID Section */}
            <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                  Client ID
                </h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400">
                  <p>Your unique client identifier for the chatbot integration.</p>
                </div>
                <div className="mt-5">
                  <div className="flex items-center space-x-4">
                    <code className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded font-mono text-sm">
                      {clientId}
                    </code>
                    <button
                      type="button"
                      onClick={regenerateClientId}
                      disabled={loading}
                      className="btn-secondary"
                    >
                      Regenerate
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Appearance Settings */}
            <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                  Appearance
                </h3>
                <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Primary Color
                    </label>
                    <div className="mt-1">
                      <input
                        type="color"
                        value={settings.theme.primaryColor}
                        onChange={(e) => handleSettingsChange('theme.primaryColor', e.target.value)}
                        className="w-full h-10 rounded-md"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Text Color
                    </label>
                    <div className="mt-1">
                      <input
                        type="color"
                        value={settings.theme.textColor}
                        onChange={(e) => handleSettingsChange('theme.textColor', e.target.value)}
                        className="w-full h-10 rounded-md"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Background Color
                    </label>
                    <div className="mt-1">
                      <input
                        type="color"
                        value={settings.theme.backgroundColor}
                        onChange={(e) => handleSettingsChange('theme.backgroundColor', e.target.value)}
                        className="w-full h-10 rounded-md"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Position
                    </label>
                    <select
                      value={settings.position}
                      onChange={(e) => handleSettingsChange('position', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    >
                      <option value="bottom-right">Bottom Right</option>
                      <option value="bottom-left">Bottom Left</option>
                      <option value="top-right">Top Right</option>
                      <option value="top-left">Top Left</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Settings */}
            <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                  Chat Settings
                </h3>
                <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Welcome Message
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        value={settings.welcomeMessage}
                        onChange={(e) => handleSettingsChange('welcomeMessage', e.target.value)}
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Bot Name
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        value={settings.botName}
                        onChange={(e) => handleSettingsChange('botName', e.target.value)}
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={saveSettings}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings; 