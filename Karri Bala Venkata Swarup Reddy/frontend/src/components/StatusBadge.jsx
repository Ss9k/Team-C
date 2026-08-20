import React from 'react';

const StatusBadge = ({ status }) => {
  const normalized = (status || 'Open').toLowerCase();
  const isResolved = normalized === 'resolved';

  return (
    <span className={`badge ${isResolved ? 'badge-status-resolved' : 'badge-status-pending'}`}>
      {isResolved ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
      )}
      {normalized === 'open' || normalized === 'pending' ? 'Open' : 'Resolved'}
    </span>
  );
};

export default StatusBadge;
