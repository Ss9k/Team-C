module.exports = [
  {
    id: 'sw_001',
    name: 'Application Crashing',
    category: 'Software',
    department: 'IT Support',
    priority: 'high',
    estimatedTime: '30-60 minutes',
    confidenceBase: 0.8,
    keywords: ['crashing', 'closes unexpectedly', 'force close', 'keeps crashing', 'not responding'],
    possibleCauses: [
      'Software bug',
      'Insufficient RAM',
      'Corrupt installation',
      'Conflicting software'
    ],
    steps: [
      'Restart the application',
      'Check for software updates',
      'Restart the computer',
      'Reinstall the application'
    ]
  },
  {
    id: 'sw_002',
    name: 'Blue Screen of Death',
    category: 'Software',
    department: 'IT Support',
    priority: 'critical',
    estimatedTime: '1-4 hours',
    confidenceBase: 0.9,
    keywords: ['bsod', 'blue screen', 'fatal error', 'system crash'],
    possibleCauses: [
      'Driver conflict',
      'Hardware failure',
      'Corrupt system files',
      'Overheating'
    ],
    steps: [
      'Note the error code on the blue screen',
      'Boot in Safe Mode',
      'Update or rollback drivers',
      'Run system file checker (sfc /scannow)'
    ]
  },
  {
    id: 'sw_003',
    name: 'Slow Computer Performance',
    category: 'Software',
    department: 'IT Support',
    priority: 'medium',
    estimatedTime: '30-90 minutes',
    confidenceBase: 0.8,
    keywords: ['slow performance', 'freezing', 'laggy', 'running slow', 'sluggish'],
    possibleCauses: [
      'Too many background apps',
      'Malware',
      'Low disk space',
      'Fragmentation'
    ],
    steps: [
      'Check Task Manager for resource hogs',
      'Run antivirus scan',
      'Clear temporary files',
      'Check free disk space on C: drive'
    ]
  },
  {
    id: 'sw_004',
    name: 'Software Installation Failed',
    category: 'Software',
    department: 'IT Support',
    priority: 'medium',
    estimatedTime: '20-45 minutes',
    confidenceBase: 0.85,
    keywords: ['installation failed', 'cannot install', 'install error', 'setup failed'],
    possibleCauses: [
      'Lack of admin rights',
      'Insufficient disk space',
      'Corrupt installer',
      'Antivirus blocking installation'
    ],
    steps: [
      'Run installer as administrator',
      'Check available disk space',
      'Temporarily disable antivirus',
      'Re-download the installer'
    ]
  },
  {
    id: 'sw_005',
    name: 'Windows Update Issues',
    category: 'Software',
    department: 'IT Support',
    priority: 'medium',
    estimatedTime: '45-120 minutes',
    confidenceBase: 0.8,
    keywords: ['update failed', 'windows update error', 'cannot update', 'stuck update'],
    possibleCauses: [
      'Corrupt update cache',
      'Network interruption',
      'Insufficient space'
    ],
    steps: [
      'Run Windows Update Troubleshooter',
      'Clear SoftwareDistribution folder',
      'Check internet connection',
      'Ensure enough free disk space'
    ]
  }
];
