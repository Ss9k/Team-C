module.exports = [
  {
    id: 'hw_001',
    name: 'Monitor Not Working',
    category: 'Hardware',
    department: 'IT Support',
    priority: 'medium',
    estimatedTime: '15-30 minutes',
    confidenceBase: 0.85,
    keywords: ['monitor not working', 'black screen', 'no display', 'screen off', 'monitor blank'],
    possibleCauses: [
      'Loose cables',
      'Power issue',
      'Defective monitor',
      'Graphics driver issue'
    ],
    steps: [
      'Check power cable and ensure monitor is turned on',
      'Check display cable connections on both ends',
      'Try a different display port or cable',
      'Test monitor on another computer'
    ]
  },
  {
    id: 'hw_002',
    name: 'Computer Won\'t Turn On',
    category: 'Hardware',
    department: 'IT Support',
    priority: 'critical',
    estimatedTime: '1-3 hours',
    confidenceBase: 0.9,
    keywords: ['won\'t turn on', 'wont turn on', 'dead', 'no power', 'computer off', 'wont boot'],
    possibleCauses: [
      'Power supply failure',
      'Motherboard issue',
      'Dead battery (laptop)',
      'Loose power cable'
    ],
    steps: [
      'Verify power outlet is working',
      'Ensure power cable is securely connected',
      'For laptops, remove battery if possible and hold power for 30s, then plug in AC',
      'Listen for beep codes or check diagnostic LEDs'
    ]
  },
  {
    id: 'hw_003',
    name: 'Keyboard/Mouse Not Working',
    category: 'Hardware',
    department: 'IT Support',
    priority: 'medium',
    estimatedTime: '10-20 minutes',
    confidenceBase: 0.8,
    keywords: ['keyboard not working', 'mouse not working', 'typing issue', 'cursor frozen', 'unresponsive'],
    possibleCauses: [
      'Dead batteries (wireless)',
      'Loose USB connection',
      'Driver issue',
      'Defective hardware'
    ],
    steps: [
      'Reconnect USB cable or wireless receiver',
      'Try a different USB port',
      'Replace batteries if wireless',
      'Restart computer'
    ]
  },
  {
    id: 'hw_004',
    name: 'Printer Issues',
    category: 'Hardware',
    department: 'IT Support',
    priority: 'medium',
    estimatedTime: '30-60 minutes',
    confidenceBase: 0.8,
    keywords: ['printer not working', 'cannot print', 'paper jam', 'offline printer', 'printer error'],
    possibleCauses: [
      'Paper jam',
      'Low ink/toner',
      'Network connectivity issue',
      'Print spooler error'
    ],
    steps: [
      'Check for paper jams and clear them',
      'Ensure printer has paper and ink/toner',
      'Restart printer and computer',
      'Restart Print Spooler service'
    ]
  },
  {
    id: 'hw_005',
    name: 'Overheating/Fan Noise',
    category: 'Hardware',
    department: 'IT Support',
    priority: 'high',
    estimatedTime: '1-2 hours',
    confidenceBase: 0.85,
    keywords: ['overheating', 'loud fan', 'laptop hot', 'fan noise', 'shutting down from heat'],
    possibleCauses: [
      'Dust buildup',
      'Failing fan',
      'Dried thermal paste',
      'Poor ventilation'
    ],
    steps: [
      'Ensure computer vents are not blocked',
      'Clean dust from vents using compressed air',
      'Close resource-intensive applications',
      'If problem persists, request hardware inspection'
    ]
  }
];
