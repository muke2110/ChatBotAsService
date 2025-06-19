import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ChatBubbleLeftIcon, ClockIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { analyticsAPI } from '../services/api';
import DashboardLayout from '../components/layout/DashboardLayout';

const Dashboard = () => {
  const { user, clientId, selectedWidget } = useAuth();
  const [stats, setStats] = useState({
    documentsUploaded: 0,
    totalChats: 0,
    averageResponseTime: '< 1s',
    totalQueries: 0,
    successRate: 0,
    errorQueries: 0,
    noDocumentsQueries: 0
  });
  const [planInfo, setPlanInfo] = useState(null);
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [history, setHistory] = useState([]);
  const [historyLimitDays, setHistoryLimitDays] = useState(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedWidget) return;
      setLoading(true);
      try {
        // Fetch widget analytics
        const analyticsRes = await analyticsAPI.getWidgetAnalytics(selectedWidget.widgetId);
        const analytics = analyticsRes.data;
        setStats({
          documentsUploaded: analytics.summary?.documentsUploaded || 0,
          totalChats: analytics.summary?.totalQueries || 0,
          averageResponseTime: analytics.summary?.avgResponseTime ? `${analytics.summary.avgResponseTime} ms` : '< 1s',
          totalQueries: analytics.summary?.totalQueries || 0,
          successRate: analytics.summary?.successRate || 0,
          errorQueries: analytics.summary?.errorQueries || 0,
          noDocumentsQueries: analytics.summary?.noDocumentsQueries || 0
        });
        // Fetch widget query history
        const historyRes = await analyticsAPI.getWidgetHistory(selectedWidget.widgetId, { page: historyPage, limit: 10 });
        setHistory(historyRes.data.history || []);
        setHistoryLimitDays(historyRes.data.limitDays);
        setHistoryTotalPages(historyRes.data.totalPages || 1);
        setPlanInfo(historyRes.data.plan);
        setStartDate(historyRes.data.startDate);
        setEndDate(historyRes.data.endDate);
      } catch (error) {
        setStats({ documentsUploaded: 0, totalChats: 0, averageResponseTime: '< 1s', totalQueries: 0, successRate: 0, errorQueries: 0, noDocumentsQueries: 0 });
        setHistory([]);
        setHistoryLimitDays(null);
        setHistoryTotalPages(1);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedWidget, historyPage]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPlanName = () => {
    if (!planInfo) return 'No Plan';
    return planInfo || planInfo.name || planInfo.plan?.name || 'No Plan';
  };

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
          {/* Welcome and Profile Section */}
          <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg mb-8">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                    Welcome back, {user?.fullName}!
                  </h2>
                  <div className="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400">
                    <p>Your Client ID: <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{clientId}</span></p>
                  </div>
                </div>
                <Link
                  to="/profile"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 dark:bg-primary-900 dark:text-primary-300 dark:hover:bg-primary-800"
                >
                  <UserCircleIcon className="h-5 w-5 mr-2" />
                  View Profile
                </Link>
              </div>
            </div>
          </div>

          {/* Plan Information */}
          <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg mb-8">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Current Plan
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Plan Type</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">{getPlanName()}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Start Date</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">{formatDate(startDate)}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Expiry Date</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">{formatDate(endDate)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Widget selector note */}
          {!selectedWidget && (
            <div className="mb-4 text-yellow-700 bg-yellow-100 p-2 rounded">Please select a widget to view analytics and history.</div>
          )}
          {/* Analytics Cards */}
          {selectedWidget && (
            <div className="mt-8">
              <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <div className="relative overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pt-5 pb-12 shadow sm:px-6 sm:pt-6">
                  <dt>
                    <div className="absolute rounded-md bg-primary-500 p-3">
                      <ChatBubbleLeftIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    <p className="ml-16 truncate text-sm font-medium text-gray-500 dark:text-gray-400">Total Chats</p>
                  </dt>
                  <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalChats}</p>
                  </dd>
                </div>
                <div className="relative overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pt-5 pb-12 shadow sm:px-6 sm:pt-6">
                  <dt>
                    <div className="absolute rounded-md bg-primary-500 p-3">
                      <ClockIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    <p className="ml-16 truncate text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Response Time</p>
                  </dt>
                  <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.averageResponseTime}</p>
                  </dd>
                </div>
                <div className="relative overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pt-5 pb-12 shadow sm:px-6 sm:pt-6">
                  <dt>
                    <div className="absolute rounded-md bg-primary-500 p-3">
                      <ChatBubbleLeftIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    <p className="ml-16 truncate text-sm font-medium text-gray-500 dark:text-gray-400">Success Rate</p>
                  </dt>
                  <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.successRate}%</p>
                  </dd>
                </div>
              </dl>
            </div>
          )}
          {/* Query History Table */}
          {selectedWidget && (
            <div className="mt-10">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Query History</h3>
              {historyLimitDays && (
                <div className="mb-2 text-sm text-yellow-700 bg-yellow-100 p-2 rounded">Only the last {historyLimitDays} days of history are shown on your current plan.</div>
              )}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Query</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Response</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Time</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {history.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-2 max-w-xs truncate" title={item.query}>{item.query}</td>
                        <td className="px-4 py-2 max-w-xs truncate" title={item.response}>{item.response}</td>
                        <td className="px-4 py-2">{item.status}</td>
                        <td className="px-4 py-2">{item.responseTime} ms</td>
                        <td className="px-4 py-2">{new Date(item.timestamp).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                  disabled={historyPage === 1 || loading}
                  className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="px-2">Page {historyPage} of {historyTotalPages}</span>
                <button
                  onClick={() => setHistoryPage((p) => Math.min(historyTotalPages, p + 1))}
                  disabled={historyPage === historyTotalPages || loading}
                  className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;