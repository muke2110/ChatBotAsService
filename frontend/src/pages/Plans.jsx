import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import PricingPlans from '../components/shared/PricingPlans';

const Plans = () => {
  return (
    <DashboardLayout>
      <PricingPlans isAuthenticated={true} />
    </DashboardLayout>
  );
};

export default Plans; 