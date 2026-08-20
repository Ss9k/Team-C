import React from 'react';
import AdminLayout from '../components/AdminLayout';
import { Layers, Construction } from 'lucide-react';

const AdminPlaceholder = ({ title, activeTab }) => {
  return (
    <AdminLayout activeTab={activeTab}>
      <div className="admin-dashboard-container animate-fade-in">
        <div className="admin-header-title-bar">
          <div>
            <h1>{title}</h1>
            <p>Enterprise administration module for SupportPilot AI helpdesk management.</p>
          </div>
        </div>

        <div className="admin-table-card animate-slide-up" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <Construction size={48} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
          <h2>{title} Management Module</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0.5rem auto 1.5rem' }}>
            This section is active and integrated into your SupportPilot AI Enterprise Portal.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPlaceholder;
