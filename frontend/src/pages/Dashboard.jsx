import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import { DocumentTextIcon, ChatBubbleLeftIcon, ClockIcon, CodeBracketIcon } from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { user, clientId } = useAuth();
  const [stats, setStats] = useState({
    documentsUploaded: 0,
    totalChats: 0,
    averageResponseTime: '< 1s',
    totalQueries: 0
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/v1/analytics', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-client-id': clientId
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setStats({
            documentsUploaded: data.documentsUploaded || 0,
            totalChats: data.totalChats || 0,
            averageResponseTime: data.averageResponseTime || '< 1s',
            totalQueries: data.totalQueries || 0
          });
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      }
    };

    fetchAnalytics();
  }, [clientId]);

  const analyticsCards = [
    { name: 'Documents Uploaded', value: stats.documentsUploaded, icon: DocumentTextIcon },
    { name: 'Total Chats', value: stats.totalChats, icon: ChatBubbleLeftIcon },
    { name: 'Average Response Time', value: stats.averageResponseTime, icon: ClockIcon },
    { name: 'Total Queries', value: stats.totalQueries, icon: ChatBubbleLeftIcon },
  ];

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
          <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg mb-8">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Welcome back, {user?.fullName}!
              </h2>
              <div className="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400">
                <p>Your Client ID: <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{clientId}</span></p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {analyticsCards.map((item) => (
                <div
                  key={item.name}
                  className="relative overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 py-5 shadow sm:px-6"
                >
                  <dt>
                    <div className="absolute rounded-md bg-primary-500 p-3">
                      <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    <p className="ml-16 truncate text-sm font-medium text-gray-500 dark:text-gray-400">
                      {item.name}
                    </p>
                  </dt>
                  <dd className="ml-16 flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {item.value}
                    </p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DocumentTextIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Quick Start
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900 dark:text-white">
                          Upload your first document
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
                <div className="text-sm">
                  <a
                    href="/upload"
                    className="font-medium text-primary-600 hover:text-primary-500"
                  >
                    Get started
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CodeBracketIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Integration
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900 dark:text-white">
                          Add chatbot to your website
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
                <div className="text-sm">
                  <a
                    href="/script"
                    className="font-medium text-primary-600 hover:text-primary-500"
                  >
                    View integration guide
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard; 