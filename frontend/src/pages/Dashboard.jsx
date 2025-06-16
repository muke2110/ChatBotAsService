import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import { DocumentTextIcon, ChatBubbleLeftIcon, ClockIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import NoPlanWarning from '../components/NoPlanWarning';

const Dashboard = () => {
  const { user, clientId } = useAuth();
  const [stats, setStats] = useState({
    documentsUploaded: 0,
    totalChats: 0,
    averageResponseTime: '< 1s',
    totalQueries: 0
  });
  const [planInfo, setPlanInfo] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch analytics
        const analyticsResponse = await fetch('/api/v1/analytics', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-client-id': clientId
          }
        });
        
        if (analyticsResponse.ok) {
          const data = await analyticsResponse.json();
          setStats({
            documentsUploaded: data.documentsUploaded || 0,
            totalChats: data.totalChats || 0,
            averageResponseTime: data.averageResponseTime || '< 1s',
            totalQueries: data.totalQueries || 0
          });
        }

        // Fetch plan info
        const planResponse = await fetch('/api/v1/plans/current', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-client-id': clientId
          }
        });

        if (planResponse.ok) {
          const planData = await planResponse.json();
          setPlanInfo(planData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [clientId]);

  const analyticsCards = [
    { name: 'Documents Uploaded', value: stats.documentsUploaded, icon: DocumentTextIcon },
    { name: 'Total Chats', value: stats.totalChats, icon: ChatBubbleLeftIcon },
    { name: 'Average Response Time', value: stats.averageResponseTime, icon: ClockIcon },
    { name: 'Total Queries', value: stats.totalQueries, icon: ChatBubbleLeftIcon },
  ];

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
    return planInfo.name || planInfo.plan?.name || 'No Plan';
  };

  const getPlanDates = () => {
    if (!planInfo) return { startDate: 'N/A', endDate: 'N/A' };
    return {
      startDate: formatDate(planInfo.startDate || planInfo.plan?.startDate),
      endDate: formatDate(planInfo.endDate || planInfo.plan?.endDate)
    };
  };

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
          {/* {console.log("planInfo:::::: ", planInfo)}
          {console.log("user:::::: ", user)} */}
          {/* No Plan Warning */}
          {(!planInfo || !planInfo.status === 'active') && <NoPlanWarning />}

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
                  <p className="text-lg font-medium text-gray-900 dark:text-white">{getPlanDates().startDate}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Expiry Date</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">{getPlanDates().endDate}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Cards */}
          <div className="mt-8">
            <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {analyticsCards.map((item) => (
                <div
                  key={item.name}
                  className="relative overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pt-5 pb-12 shadow sm:px-6 sm:pt-6"
                >
                  <dt>
                    <div className="absolute rounded-md bg-primary-500 p-3">
                      <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    <p className="ml-16 truncate text-sm font-medium text-gray-500 dark:text-gray-400">{item.name}</p>
                  </dt>
                  <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{item.value}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard; 