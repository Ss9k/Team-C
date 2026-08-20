const express = require('express');
const router = express.Router();
const { analyzeIssueWithGemini } = require('../services/geminiService');
const auth = require('../middleware/auth');

router.post('/analyze', auth, async (req, res) => {
  const { title, department, description } = req.body;
  if (!description) {
    return res.status(400).json({ message: 'Description is required for AI analysis' });
  }

  try {
    const result = await analyzeIssueWithGemini({ title, department, description });
    res.json(result);
  } catch (error) {
    console.error('AI analysis route error:', error);
    res.status(500).json({
      message: 'AI analysis is temporarily unavailable. You can still raise a support ticket.',
      error: error.message
    });
  }
});

module.exports = router;
