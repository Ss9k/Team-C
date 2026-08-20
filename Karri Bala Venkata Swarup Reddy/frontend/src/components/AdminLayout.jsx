import React from 'react';
import AppLayout from './AppLayout';

const AdminLayout = ({ children, activeTab = 'dashboard' }) => {
  return (
    <AppLayout portalType="admin" activeTab={activeTab}>
      {children}
    </AppLayout>
  );
};

export default AdminLayout;
