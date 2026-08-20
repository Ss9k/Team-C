import React from 'react';
import AppLayout from './AppLayout';

const UserLayout = ({ children, activeTab = 'dashboard' }) => {
  return (
    <AppLayout portalType="user" activeTab={activeTab}>
      {children}
    </AppLayout>
  );
};

export default UserLayout;
