module.exports = [
  {
    id: 'gen_001',
    name: 'General IT Request',
    category: 'General',
    department: 'IT Support',
    priority: 'low',
    estimatedTime: '1-3 days',
    confidenceBase: 0.5,
    keywords: ['help', 'support', 'question', 'assist', 'inquiry', 'general'],
    possibleCauses: [
      'General inquiry',
      'Miscellaneous request'
    ],
    steps: [
      'Provide detailed description of the issue or request',
      'A technician will review and categorize your request'
    ]
  },
  {
    id: 'gen_002',
    name: 'Software License Request',
    category: 'General',
    department: 'IT Asset Management',
    priority: 'medium',
    estimatedTime: '2-5 days',
    confidenceBase: 0.7,
    keywords: ['license', 'new software', 'buy software', 'software request', 'need license'],
    possibleCauses: [
      'Need new tools',
      'License expired'
    ],
    steps: [
      'Submit justification for software need',
      'Obtain manager approval for cost',
      'IT will procure and assign license'
    ]
  },
  {
    id: 'gen_003',
    name: 'Equipment Request',
    category: 'General',
    department: 'IT Asset Management',
    priority: 'medium',
    estimatedTime: '3-7 days',
    confidenceBase: 0.75,
    keywords: ['new mouse', 'new keyboard', 'need monitor', 'equipment', 'hardware request'],
    possibleCauses: [
      'Broken equipment',
      'New requirements'
    ],
    steps: [
      'Specify equipment needed',
      'Provide shipping address if remote',
      'Obtain manager approval',
      'IT will process and ship equipment'
    ]
  }
];
