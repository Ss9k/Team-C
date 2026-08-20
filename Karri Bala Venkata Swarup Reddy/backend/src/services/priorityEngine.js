function calculatePriority(basePriority, description) {
  const urgentKeywords = [
    'urgent', 'critical', 'blocked', 'cannot work', 'production', 
    'server down', 'asap', 'down', 'system failure', 'emergency', 
    'immediately', 'stop working'
  ];
  
  const desc = (description || '').toLowerCase();
  
  const hasUrgentKeyword = urgentKeywords.some(keyword => desc.includes(keyword));
  
  if (hasUrgentKeyword) {
    if (basePriority === 'low') return 'medium';
    if (basePriority === 'medium') return 'high';
    if (basePriority === 'high') return 'critical';
    return 'critical';
  }
  
  return basePriority;
}

module.exports = { calculatePriority };
