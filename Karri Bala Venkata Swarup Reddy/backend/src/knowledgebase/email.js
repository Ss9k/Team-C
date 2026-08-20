module.exports = [
  {
    id: 'email_001',
    name: 'Cannot Send Email',
    category: 'Email',
    department: 'IT Support',
    priority: 'high',
    estimatedTime: '15-45 minutes',
    confidenceBase: 0.85,
    keywords: ['cannot send email', 'emails stuck in outbox', 'sending fails', 'unable to send', 'smtp error'],
    possibleCauses: [
      'SMTP server issues',
      'Attachment too large',
      'Incorrect outgoing server settings',
      'Account suspended'
    ],
    steps: [
      'Check internet connection',
      'Verify attachment size limits',
      'Check SMTP server settings',
      'Look for error messages in outbox'
    ]
  },
  {
    id: 'email_002',
    name: 'Cannot Receive Email',
    category: 'Email',
    department: 'IT Support',
    priority: 'high',
    estimatedTime: '15-45 minutes',
    confidenceBase: 0.85,
    keywords: ['cannot receive', 'no new emails', 'inbox not updating', 'pop3 error', 'imap error'],
    possibleCauses: [
      'Mailbox full',
      'Incoming server issues',
      'Incorrect settings',
      'Rules moving emails'
    ],
    steps: [
      'Check mailbox quota/storage limit',
      'Verify POP3/IMAP settings',
      'Check Junk/Spam folder',
      'Review email rules and filters'
    ]
  },
  {
    id: 'email_003',
    name: 'Email Account Locked',
    category: 'Email',
    department: 'IT Security',
    priority: 'critical',
    estimatedTime: '15-30 minutes',
    confidenceBase: 0.9,
    keywords: ['account locked', 'locked out', 'login disabled', 'too many attempts'],
    possibleCauses: [
      'Too many failed login attempts',
      'Suspicious activity',
      'Password expired'
    ],
    steps: [
      'Wait 15-30 minutes for auto-unlock',
      'Reset password via self-service portal',
      'Contact IT Helpdesk for manual unlock'
    ]
  },
  {
    id: 'email_004',
    name: 'Outlook Not Opening',
    category: 'Email',
    department: 'IT Support',
    priority: 'medium',
    estimatedTime: '20-60 minutes',
    confidenceBase: 0.8,
    keywords: ['outlook crashes', 'outlook wont open', 'stuck on loading profile', 'ost error'],
    possibleCauses: [
      'Corrupt profile',
      'Problematic add-ins',
      'Large OST/PST file'
    ],
    steps: [
      'Start Outlook in safe mode (outlook.exe /safe)',
      'Disable unnecessary add-ins',
      'Repair Office installation',
      'Create a new Outlook profile'
    ]
  }
];
