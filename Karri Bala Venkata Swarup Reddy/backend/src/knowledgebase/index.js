const network = require('./network');
const hardware = require('./hardware');
const software = require('./software');
const email = require('./email');
const accounts = require('./accounts');
const hr = require('./hr');
const general = require('./general');

const { calculatePriority } = require('../services/priorityEngine');

const allTopics = [
  ...network,
  ...hardware,
  ...software,
  ...email,
  ...accounts,
  ...hr,
  ...general
];

function analyzeIssue(description) {
  if (!description) return null;

  const desc = description.toLowerCase();
  
  const scoredTopics = allTopics.map(topic => {
    let score = 0;
    
    topic.keywords.forEach(keyword => {
      if (desc.includes(keyword.toLowerCase())) {
        const weight = Math.max(keyword.length / 10, 0.5);
        score += weight;
      }
    });

    const finalScore = score * topic.confidenceBase;
    return { ...topic, score: finalScore };
  });

  scoredTopics.sort((a, b) => b.score - a.score);

  const top3 = scoredTopics.slice(0, 3);
  const topTopic = top3[0];

  if (!topTopic || topTopic.score === 0) {
    return {
      matchedCategory: 'General',
      matchedTopic: 'General IT Request',
      department: 'IT Support',
      suggestedPriority: calculatePriority('low', desc),
      possibleCauses: [],
      steps: ['Wait for a technician to review your request.'],
      confidence: 0,
      topicOptions: [],
      allTopics
    };
  }

  return {
    matchedCategory: topTopic.category,
    matchedTopic: topTopic.name,
    department: topTopic.department,
    suggestedPriority: calculatePriority(topTopic.priority, desc),
    possibleCauses: topTopic.possibleCauses,
    steps: topTopic.steps,
    confidence: Math.min(topTopic.score / 3, 1),
    topicOptions: top3.map(t => ({ id: t.id, name: t.name, category: t.category })),
    allTopics
  };
}

function getTopicById(id) {
  return allTopics.find(t => t.id === id);
}

function getStepsForTopic(topicId) {
  const topic = getTopicById(topicId);
  return topic ? topic : null;
}

module.exports = {
  analyzeIssue,
  getTopicById,
  getStepsForTopic,
  allTopics
};
