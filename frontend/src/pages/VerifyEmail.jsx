import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get('token');
        if (!token) {
          setError('No verification token found');
          setVerifying(false);
          return;
        }

        const response = await fetch(`http://localhost:3000/api/v1/auth/verify-email?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          toast.success('Email verified successfully!');
          // Redirect to login after 2 seconds
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        } else {
          setError(data.message || 'Verification failed');
        }
      } catch (err) {
        setError('An error occurred during verification');
        console.error('Verification error:', err);
      } finally {
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Email Verification
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {verifying ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Verifying your email...</p>
            </div>
          ) : error ? (
            <div className="text-center">
              <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
              <button
                onClick={() => navigate('/login')}
                className="btn-primary"
              >
                Return to Login
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-green-600 dark:text-green-400 mb-4">
                Email verified successfully!
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Redirecting to login page...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail; 