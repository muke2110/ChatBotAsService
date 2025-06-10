import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

const Buy = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/plans');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                  No active plan found
                </h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400">
                  <p>
                    You need an active plan to access this feature. Redirecting you to our plans page...
                  </p>
                </div>
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={() => navigate('/plans')}
                    className="btn-primary inline-flex items-center"
                  >
                    View Plans
                    <ArrowRightIcon className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Buy; 