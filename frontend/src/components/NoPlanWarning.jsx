import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const NoPlanWarning = () => {
  return (
    <div className="bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-400 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700 dark:text-yellow-200">
            You haven't purchased any plan yet. To start using the chatbot service, please select a plan.
            <Link
              to="/plans"
              className="ml-2 font-medium underline hover:text-yellow-600 dark:hover:text-yellow-300"
            >
              View Plans
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NoPlanWarning; 