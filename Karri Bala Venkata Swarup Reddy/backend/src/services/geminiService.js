const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

/**
 * Improved Service to analyze IT issues using Google Gemini 2.5 Flash API.
 */
async function analyzeIssueWithGemini({ title, department, description }) {
  const apiKey = process.env.GEMINI_API_KEY;
  const enableFallback = process.env.ENABLE_LOCAL_FALLBACK === 'true';

  const systemPrompt = `You are an experienced Senior Enterprise IT Support Engineer with expertise in:
Windows, Linux, macOS, Networking, VPN, Email, Active Directory, Office 365, Printers, Databases, Servers, Hardware, Software, Security, Cloud Platforms, Enterprise Applications.

You must understand problems naturally instead of depending on keyword matching.

For every issue you must:
1. Understand the user's problem.
2. Explain the issue in simple language.
3. Identify the most probable root causes.
4. Estimate a confidence score (integer 0-100).
5. Generate troubleshooting steps from easiest to most advanced.
6. Suggest preventive measures.
7. Determine whether the issue is likely to be resolved after following the troubleshooting steps ("likely_resolved": true/false).
8. Recommend raising a support ticket ("needs_escalation": true/false) only if the problem is likely to remain unresolved or requires administrator intervention.
9. Never hallucinate. Never ask unnecessary follow-up questions. Assume a standard enterprise IT environment.
10. Return ONLY valid JSON matching the schema below. Do not include markdown formatting or \`\`\`json tags.

JSON SCHEMA:
{
  "summary": "Simple plain language explanation of the problem",
  "category": "Network | Hardware | Software | Security | Email | Accounts | General",
  "priority": "Low | Medium | High | Critical",
  "severity": "Low | Medium | High | Critical",
  "confidence": 85,
  "possible_causes": [
    "Root cause 1",
    "Root cause 2"
  ],
  "resolution_steps": [
    "Step 1: Easiest fix...",
    "Step 2: Next check...",
    "Step 3: Advanced fix..."
  ],
  "estimated_resolution_time": "15-30 minutes",
  "likely_resolved": true,
  "needs_escalation": false,
  "escalation_reason": "",
  "prevention": [
    "Preventive tip 1",
    "Preventive tip 2"
  ]
}`;

  const userMessage = `Department: ${department || 'General'}
Issue Title: ${title || 'IT Support Issue'}
Issue Description: ${description}`;

  // Required console logging before sending request
  console.log("Using Gemini 2.5 Flash...");
  console.log("Sending request to Gemini...");

  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY' || apiKey.trim() === '') {
    const errorMsg = "GEMINI_API_KEY is not configured in process.env";
    console.error("Gemini Error:", errorMsg);

    if (enableFallback) {
      console.log("ENABLE_LOCAL_FALLBACK=true -> Using local fallback analyzer");
      return getFallbackAnalysis({ title, department, description });
    }

    return {
      error: true,
      message: "Gemini API failed"
    };
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\nUSER ISSUE:\n${userMessage}` }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Gemini API Error (Status ${response.status}):`, errText);

      if (enableFallback) {
        console.log("ENABLE_LOCAL_FALLBACK=true -> Using local fallback analyzer after API error");
        return getFallbackAnalysis({ title, department, description });
      }

      return {
        error: true,
        message: "Gemini API failed"
      };
    }

    const data = await response.json();
    
    // Required console logging after receiving response
    console.log("Gemini Response:");
    console.log(JSON.stringify(data, null, 2));

    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      console.error("Gemini Error: Empty response candidate text");
      if (enableFallback) return getFallbackAnalysis({ title, department, description });
      return { error: true, message: "Gemini API failed" };
    }

    // Clean markdown code fence if present
    const cleanedJson = candidateText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    const parsed = JSON.parse(cleanedJson);

    return normalizeAiResult(parsed, { title, department, description });
  } catch (err) {
    console.error("Gemini Error:", err);
    
    if (enableFallback) {
      console.log("ENABLE_LOCAL_FALLBACK=true -> Using local fallback analyzer after exception");
      return getFallbackAnalysis({ title, department, description });
    }

    return {
      error: true,
      message: "Gemini API failed"
    };
  }
}

function normalizeAiResult(parsed, { title, department, description }) {
  return {
    summary: parsed.summary || `Analysis for ${title}`,
    category: parsed.category || department || 'General IT',
    priority: parsed.priority || 'Medium',
    severity: parsed.severity || parsed.priority || 'Medium',
    confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 85,
    possible_causes: Array.isArray(parsed.possible_causes) ? parsed.possible_causes : ['System configuration or network communication issue'],
    resolution_steps: Array.isArray(parsed.resolution_steps) ? parsed.resolution_steps : ['Restart the affected application or device', 'Verify network connectivity', 'Contact helpdesk if problem persists'],
    estimated_resolution_time: parsed.estimated_resolution_time || '15-30 minutes',
    likely_resolved: typeof parsed.likely_resolved === 'boolean' ? parsed.likely_resolved : true,
    needs_escalation: Boolean(parsed.needs_escalation),
    escalation_reason: parsed.escalation_reason || '',
    prevention: Array.isArray(parsed.prevention) ? parsed.prevention : ['Keep software updated', 'Save work regularly'],
  };
}

function getFallbackAnalysis({ title, department, description }) {
  const text = (title + ' ' + description).toLowerCase();
  
  let category = department || 'General';
  let summary = 'Standard IT troubleshooting steps identified for your request.';
  let priority = 'Medium';
  let causes = ['Temporary system malfunction or service disruption', 'Incorrect system configuration or credentials'];
  let steps = [
    'Save your current work and close the affected application completely.',
    'Restart your computer or network connection.',
    'Verify login credentials and permissions.',
    'Clear application cache or browser history if applicable.',
    'Attempt to reconnect to the internal network / VPN.'
  ];
  let prevention = [
    'Maintain updated software versions and operating system patches.',
    'Ensure strong network connectivity before initiating critical tasks.'
  ];

  if (text.includes('vpn') || text.includes('internet') || text.includes('network') || text.includes('wifi')) {
    category = 'Network';
    summary = 'Network or VPN connection disruption preventing server communication.';
    causes = ['Wi-Fi adapter or Ethernet driver glitch', 'DNS resolution failure or VPN gateway timeout', 'Expired VPN security certificate'];
    steps = [
      'Toggle Wi-Fi off and on, or verify Ethernet cable connection.',
      'Flush DNS cache: Open Command Prompt as Administrator and run "ipconfig /flushdns".',
      'Disconnect and restart your VPN client application.',
      'Re-authenticate with your corporate domain credentials.'
    ];
  } else if (text.includes('password') || text.includes('login') || text.includes('account') || text.includes('access')) {
    category = 'Accounts / Security';
    summary = 'User authentication or domain account permission denial.';
    causes = ['Expired Active Directory password', 'Account locked out after multiple incorrect login attempts'];
    steps = [
      'Wait 15 minutes for temporary lockout policies to auto-reset.',
      'Access the corporate Self-Service Password Reset (SSPR) portal.',
      'Verify Caps Lock is turned off and credentials are typed accurately.',
      'Ensure account is assigned required security group permissions.'
    ];
  } else if (text.includes('printer') || text.includes('print') || text.includes('paper')) {
    category = 'Hardware';
    summary = 'Printer queue error or local print spooler hang.';
    causes = ['Stuck print spooler service on workstation', 'Printer IP change or offline network status'];
    steps = [
      'Open Services (services.msc), locate "Print Spooler", and click Restart.',
      'Clear pending documents from the printer queue.',
      'Verify printer power and cable/network connection.'
    ];
  }

  return {
    summary,
    category,
    priority,
    severity: priority,
    confidence: 85,
    possible_causes: causes,
    resolution_steps: steps,
    estimated_resolution_time: '15-30 minutes',
    likely_resolved: true,
    needs_escalation: false,
    escalation_reason: '',
    prevention,
  };
}

module.exports = {
  analyzeIssueWithGemini,
};
