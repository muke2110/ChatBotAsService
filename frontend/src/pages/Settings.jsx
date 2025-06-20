import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import toast from 'react-hot-toast';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { widgetAPI } from '../services/api';

const Settings = () => {
  const { token, clientId, setClientId, widgets, selectedWidget, updateSelectedWidget } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
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

  useEffect(() => {
    const fetchSettings = async () => {
      if (!selectedWidget) return;
      try {
        const response = await widgetAPI.getWidgetSettings(selectedWidget.widgetId);
        if (response.data.widget && response.data.widget.settings) {
          setSettings(response.data.widget.settings);
        }
      } catch (error) {
        console.error('Error fetching widget settings:', error);
      }
    };
    fetchSettings();
  }, [selectedWidget]);

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
    if (!selectedWidget) return;
    setLoading(true);
    try {
      await widgetAPI.updateWidgetSettings(selectedWidget.widgetId, settings);
      toast.success('Settings saved for this widget!');
    } catch (error) {
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const regenerateClientId = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/client/regenerate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-client-id': clientId
        }
      });

      if (!response.ok) throw new Error('Failed to regenerate client ID');

      const data = await response.json();
      if (data.clientId) {
        setClientId(data.clientId);
        localStorage.setItem('clientId', data.clientId);
        toast.success('Client ID regenerated successfully! Please update your website script.');
        setShowWarning(false);
      } else {
        throw new Error('No client ID received from server');
      }
    } catch (error) {
      console.error('Error regenerating client ID:', error);
      toast.error('Failed to regenerate client ID. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Widget Selector */}
          {widgets.length > 1 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Widget</label>
              <select
                value={selectedWidget?.widgetId || ''}
                onChange={e => {
                  const widget = widgets.find(w => w.widgetId === e.target.value);
                  updateSelectedWidget(widget);
                }}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
              >
                {widgets.map(widget => (
                  <option key={widget.widgetId} value={widget.widgetId}>{widget.name}</option>
                ))}
              </select>
            </div>
          )}
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
                      onClick={() => setShowWarning(true)}
                      disabled={loading}
                      className="btn-secondary"
                    >
                      Regenerate
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Warning Modal */}
            {showWarning && (
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
                <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
                  <div className="flex items-center mb-4">
                    <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400 mr-2" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Warning: Regenerating Client ID
                    </h3>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      This action will invalidate your current Client ID. You will need to:
                    </p>
                    <ul className="mt-2 text-sm text-gray-500 dark:text-gray-400 list-disc list-inside">
                      <li>Update your website's integration script with the new Client ID</li>
                      <li>Update any existing API calls using the old Client ID</li>
                      <li>Reconfigure any third-party integrations using this Client ID</li>
                    </ul>
                    <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                      Are you sure you want to proceed?
                    </p>
                  </div>
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowWarning(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={regenerateClientId}
                      disabled={loading}
                      className="btn-primary"
                    >
                      {loading ? 'Regenerating...' : 'Yes, Regenerate'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Theme Settings */}
            <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
                  Theme Settings
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Primary Color
                    </label>
                    <input
                      type="color"
                      value={settings.theme.primaryColor}
                      onChange={(e) => handleSettingsChange('theme.primaryColor', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Text Color
                    </label>
                    <input
                      type="color"
                      value={settings.theme.textColor}
                      onChange={(e) => handleSettingsChange('theme.textColor', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Background Color
                    </label>
                    <input
                      type="color"
                      value={settings.theme.backgroundColor}
                      onChange={(e) => handleSettingsChange('theme.backgroundColor', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Position
                    </label>
                    <select
                      value={settings.position}
                      onChange={(e) => handleSettingsChange('position', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
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
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
                  Chat Settings
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Welcome Message
                    </label>
                    <input
                      type="text"
                      value={settings.welcomeMessage}
                      onChange={(e) => handleSettingsChange('welcomeMessage', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Bot Name
                    </label>
                    <input
                      type="text"
                      value={settings.botName}
                      onChange={(e) => handleSettingsChange('botName', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                    />
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