module.exports = [
  {
    id: 'hr_001',
    name: 'Leave Request Issue',
    category: 'HR',
    department: 'Human Resources',
    priority: 'low',
    estimatedTime: '1-2 days',
    confidenceBase: 0.8,
    keywords: ['leave request', 'pto', 'vacation request', 'sick leave', 'cannot apply leave'],
    possibleCauses: [
      'System glitch',
      'Insufficient leave balance',
      'Manager approval pending'
    ],
    steps: [
      'Check leave balance in HR portal',
      'Ensure dates selected are valid',
      'Contact HR representative for manual adjustment'
    ]
  },
  {
    id: 'hr_002',
    name: 'Payroll Discrepancy',
    category: 'HR',
    department: 'Finance/HR',
    priority: 'critical',
    estimatedTime: '1-3 days',
    confidenceBase: 0.9,
    keywords: ['payroll', 'salary issue', 'paycheck wrong', 'missing pay', 'bonus not received'],
    possibleCauses: [
      'Timesheet error',
      'Tax calculation issue',
      'Bank details incorrect'
    ],
    steps: [
      'Review latest payslip for details',
      'Verify timesheet submissions',
      'Contact Payroll department immediately'
    ]
  },
  {
    id: 'hr_003',
    name: 'Onboarding Access',
    category: 'HR',
    department: 'Human Resources',
    priority: 'high',
    estimatedTime: '1 day',
    confidenceBase: 0.85,
    keywords: ['onboarding', 'new hire', 'welcome portal', 'induction access'],
    possibleCauses: [
      'Profile not fully setup',
      'Missing documentation'
    ],
    steps: [
      'Check if all onboarding documents are submitted',
      'Try logging in again after 24 hours',
      'Contact HR onboarding specialist'
    ]
  },
  {
    id: 'hr_004',
    name: 'Employee ID Issue',
    category: 'HR',
    department: 'Facilities/HR',
    priority: 'medium',
    estimatedTime: '1-2 hours',
    confidenceBase: 0.8,
    keywords: ['employee id', 'badge not working', 'lost id', 'id card'],
    possibleCauses: [
      'Card deactivated',
      'Magnetic strip damaged',
      'Lost card'
    ],
    steps: [
      'Report lost card to security immediately',
      'Request new badge from HR/Facilities',
      'Wait for card activation'
    ]
  }
];
