import React from 'react';

const PriorityBadge = ({ priority }) => {
  const p = (priority || 'low').toLowerCase();
  
  return (
    <span className={`badge badge-priority-${p}`}>
      <span style={{ 
        width: '6px', 
        height: '6px', 
        borderRadius: '50%', 
        background: 'currentColor',
        display: 'inline-block' 
      }}></span>
      {p.charAt(0).toUpperCase() + p.slice(1)}
    </span>
  );
};

export default PriorityBadge;
