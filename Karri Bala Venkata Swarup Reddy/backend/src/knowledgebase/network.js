module.exports = [
  {
    id: 'net_001',
    name: 'No Internet Connection',
    category: 'Network',
    department: 'IT Infrastructure',
    priority: 'high',
    estimatedTime: '30-60 minutes',
    confidenceBase: 0.85,
    keywords: ['no internet', 'internet not working', 'cannot connect', 'no connectivity', 'offline', 'network down', 'no network', 'internet down', 'cant access internet'],
    possibleCauses: [
      'Network cable unplugged or damaged',
      'Router/modem power issue',
      'ISP outage in the area',
      'Network adapter driver problem',
      'IP address conflict'
    ],
    steps: [
      'Check if the network cable is properly plugged into both the computer and router/switch',
      'Restart the router and modem by unplugging power for 30 seconds',
      'Check if other devices can connect to the same network',
      'Run Windows Network Diagnostics (right-click network icon > Troubleshoot)',
      'Flush DNS cache: Open CMD as admin and run ipconfig /flushdns',
      'Reset TCP/IP stack: Run netsh int ip reset in admin CMD',
      'Check network adapter in Device Manager for any warnings',
      'Contact ISP if all above steps fail'
    ]
  },
  {
    id: 'net_002',
    name: 'Slow Network / High Latency',
    category: 'Network',
    department: 'IT Infrastructure',
    priority: 'medium',
    estimatedTime: '1-2 hours',
    confidenceBase: 0.8,
    keywords: ['slow network', 'high latency', 'buffering', 'slow internet', 'lagging', 'connection slow', 'ping high'],
    possibleCauses: [
      'Bandwidth congestion',
      'Background downloads',
      'Malware or viruses',
      'Router issue',
      'ISP throttling'
    ],
    steps: [
      'Close bandwidth-heavy applications',
      'Run a speed test to check actual speeds',
      'Restart router/modem',
      'Scan for malware',
      'Connect via Ethernet instead of WiFi'
    ]
  },
  {
    id: 'net_003',
    name: 'VPN Not Connecting',
    category: 'Network',
    department: 'IT Infrastructure',
    priority: 'high',
    estimatedTime: '15-45 minutes',
    confidenceBase: 0.9,
    keywords: ['vpn not connecting', 'vpn error', 'cannot connect to vpn', 'vpn dropping', 'vpn fails'],
    possibleCauses: [
      'Incorrect credentials',
      'Network blocking VPN ports',
      'VPN server down',
      'Outdated VPN client'
    ],
    steps: [
      'Verify username and password',
      'Check internet connection without VPN',
      'Restart VPN client',
      'Try a different VPN server location',
      'Update VPN client to the latest version'
    ]
  },
  {
    id: 'net_004',
    name: 'WiFi Keeps Dropping',
    category: 'Network',
    department: 'IT Infrastructure',
    priority: 'medium',
    estimatedTime: '30-90 minutes',
    confidenceBase: 0.8,
    keywords: ['wifi dropping', 'disconnects', 'wifi unstable', 'keeps disconnecting', 'lose connection'],
    possibleCauses: [
      'Interference from other devices',
      'Outdated drivers',
      'Router placement',
      'Router firmware issue'
    ],
    steps: [
      'Move closer to the router',
      'Change WiFi channel on router',
      'Update wireless adapter drivers',
      'Restart router',
      'Check for router firmware updates'
    ]
  },
  {
    id: 'net_005',
    name: 'DNS Resolution Failure',
    category: 'Network',
    department: 'IT Infrastructure',
    priority: 'high',
    estimatedTime: '15-30 minutes',
    confidenceBase: 0.85,
    keywords: ['dns error', 'cannot resolve', 'dns failure', 'dns probe', 'site cannot be reached'],
    possibleCauses: [
      'DNS server down',
      'Corrupt DNS cache',
      'Incorrect network settings'
    ],
    steps: [
      'Flush DNS (ipconfig /flushdns)',
      'Change DNS servers to Google (8.8.8.8) or Cloudflare (1.1.1.1)',
      'Restart browser and computer',
      'Check proxy settings'
    ]
  }
];
