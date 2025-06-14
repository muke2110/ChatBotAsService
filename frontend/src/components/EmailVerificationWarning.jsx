import React, { useState, useEffect } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const EmailVerificationWarning = () => {
  const { user } = useAuth();
  const [resendingVerification, setResendingVerification] = useState(false);
  const [isVerified, setIsVerified] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkVerificationStatus = async () => {
      if (!user) {
        setIsVerified(true);
        setIsLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/v1/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setIsVerified(data.user.emailVerified);
        } else {
          console.error('Failed to fetch verification status');
        }
      } catch (error) {
        console.error('Error checking verification status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkVerificationStatus();
  }, [user]);

  const handleResendVerification = async () => {
    setResendingVerification(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/v1/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Verification email sent successfully!');
      } else {
        toast.error(data.message || 'Failed to send verification email');
      }
    } catch (error) {
      toast.error('An error occurred while sending verification email');
      console.error('Resend verification error:', error);
    } finally {
      setResendingVerification(false);
    }
  };

  if (isLoading || !user || isVerified) {
    return null;
  }

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-400 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700 dark:text-yellow-200">
            Your email is not verified. Please check your inbox for the verification email.
            <button
              onClick={handleResendVerification}
              disabled={resendingVerification}
              className="ml-2 font-medium underline hover:text-yellow-600 dark:hover:text-yellow-300"
            >
              {resendingVerification ? 'Sending...' : 'Resend verification email'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationWarning; 