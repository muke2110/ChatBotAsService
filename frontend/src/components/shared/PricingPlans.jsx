import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { plansAPI, paymentsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const PricingPlans = ({ isAuthenticated = false }) => {
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const navigate = useNavigate();
  const { refreshPlanStatus } = useAuth();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await plansAPI.getPlans();
        setPlans(response.data);
        
        // Get current plan if authenticated
        if (isAuthenticated) {
          const currentPlanResponse = await plansAPI.getCurrentPlan();
          setCurrentPlan(currentPlanResponse.data);
        }
      } catch (error) {
        console.error('Error fetching plans:', error);
        toast.error('Failed to load plans');
      }
    };

    fetchPlans();
  }, [isAuthenticated]);

  const handlePlanAction = async (planId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      // Create Razorpay order with billing cycle
      const orderResponse = await paymentsAPI.createOrder(planId, billingCycle);
      const { orderId, amount, currency, key_id } = orderResponse.data;

      const options = {
        key: key_id,
        amount: amount * 100, // Amount in paise
        currency: currency,
        name: 'ChatBot Service',
        description: `Plan Subscription (${billingCycle})`,
        order_id: orderId,
        handler: async function (response) {
          try {
            const verificationResponse = await paymentsAPI.verifyPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verificationResponse.data.success) {
              // Update local state
              setCurrentPlan(verificationResponse.data.subscription);
              
              // Refresh plan status in auth context
              await refreshPlanStatus();
              
              toast.success('Payment successful! Plan updated.');
              // Force reload user data if needed
              window.location.href = '/dashboard';
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification failed:', error);
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        },
        prefill: {
          name: localStorage.getItem('userName'),
          email: localStorage.getItem('userEmail')
        },
        theme: {
          color: '#6366F1'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Error initiating payment:', error);
      toast.error('Failed to initiate payment. Please try again.');
      setLoading(false);
    }
  };

  const calculatePrice = (basePrice) => {
    if (billingCycle === 'yearly') {
      // 10% discount for yearly billing
      const yearlyPrice = basePrice * 12;
      const discount = yearlyPrice * 0.1;
      return Math.round(yearlyPrice - discount);
    }
    return basePrice;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const renderFeatureValue = (value) => {
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (typeof value === 'number') {
      if (value >= 1000000) {
        return `${value / 1000000}M`;
      }
      if (value >= 1000) {
        return `${value / 1000}K`;
      }
      return value;
    }
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (typeof value === 'object' && value !== null) {
      return Object.entries(value)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');
    }
    return value;
  };

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            Choose your plan
          </h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
            Select the perfect plan for your needs
          </p>
          
          {/* Billing cycle toggle */}
          <div className="mt-8 flex justify-center items-center space-x-4">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-md ${
                billingCycle === 'monthly'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-md ${
                billingCycle === 'yearly'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Save 10%
              </span>
            </button>
          </div>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-lg shadow-sm divide-y divide-gray-200 bg-white dark:bg-gray-800 ${
                plan.name === 'Pro' ? 'border-2 border-primary-500' : ''
              }`}
            >
              <div className="p-6">
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {plan.name}
                </h3>
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  {plan.description}
                </p>
                <p className="mt-8">
                  <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                    {formatPrice(calculatePrice(plan.price))}
                  </span>
                  <span className="text-base font-medium text-gray-500 dark:text-gray-400">
                    /{billingCycle === 'yearly' ? 'year' : 'month'}
                  </span>
                </p>
                {billingCycle === 'yearly' && (
                  <p className="mt-2 text-sm text-green-600">
                    10% discount applied
                  </p>
                )}

                <ul className="mt-6 space-y-4">
                  {Object.entries(plan.features || {}).map(([key, value]) => (
                    <li key={key} className="flex items-start">
                      <svg
                        className="flex-shrink-0 w-6 h-6 text-green-500 mt-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="ml-3 text-base text-gray-500 dark:text-gray-400">
                        {key.split(/(?=[A-Z])/).join(' ')}: {renderFeatureValue(value)}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePlanAction(plan.id)}
                  disabled={loading || (currentPlan && currentPlan.id === plan.id)}
                  className={`mt-8 block w-full py-3 px-6 border border-transparent rounded-md text-center font-medium ${
                    currentPlan && currentPlan.id === plan.id
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  {currentPlan && currentPlan.id === plan.id
                    ? 'Current Plan'
                    : loading
                    ? 'Processing...'
                    : isAuthenticated
                    ? 'Select Plan'
                    : 'Get Started'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingPlans; 