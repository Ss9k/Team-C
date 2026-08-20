module.exports = [
  {
    id: 'acc_001',
    name: 'Password Reset',
    category: 'Accounts',
    department: 'IT Security',
    priority: 'high',
    estimatedTime: '5-15 minutes',
    confidenceBase: 0.9,
    keywords: ['password reset', 'forgot password', 'reset password', 'change password'],
    possibleCauses: [
      'Forgot password',
      'Password expired'
    ],
    steps: [
      'Use self-service password reset portal',
      'Ensure new password meets complexity requirements',
      'Contact helpdesk if self-service fails'
    ]
  },
  {
    id: 'acc_002',
    name: 'Account Locked',
    category: 'Accounts',
    department: 'IT Security',
    priority: 'critical',
    estimatedTime: '10-30 minutes',
    confidenceBase: 0.9,
    keywords: ['account locked', 'cannot login', 'locked out of account', 'ad locked'],
    possibleCauses: [
      'Multiple failed login attempts',
      'Security policy violation'
    ],
    steps: [
      'Wait for temporary lockout period to end',
      'Verify credentials',
      'Contact IT support to unlock Active Directory account'
    ]
  },
  {
    id: 'acc_003',
    name: 'New Account Request',
    category: 'Accounts',
    department: 'IT Admin',
    priority: 'low',
    estimatedTime: '1-2 days',
    confidenceBase: 0.8,
    keywords: ['new account', 'create account', 'new user', 'onboarding'],
    possibleCauses: [
      'New employee joining',
      'Contractor starting'
    ],
    steps: [
      'Submit new user request form',
      'Obtain manager approval',
      'IT will provision account and notify manager'
    ]
  },
  {
    id: 'acc_004',
    name: 'Permission Access Denied',
    category: 'Accounts',
    department: 'IT Security',
    priority: 'medium',
    estimatedTime: '1-4 hours',
    confidenceBase: 0.85,
    keywords: ['access denied', 'no permission', 'unauthorized', 'folder access', 'system access'],
    possibleCauses: [
      'Not added to correct security group',
      'Role change',
      'Policy update'
    ],
    steps: [
      'Identify the specific resource/folder denying access',
      'Request access from resource owner or manager',
      'IT will grant access upon approval'
    ]
  }
];
