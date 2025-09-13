// Utility functions for working with game sentences data
import gameSentencesData from '../content/gameSentences.json';

const { gameSentences } = gameSentencesData;

// Get all game sentences
export const getGameSentences = () => {
  return gameSentences;
};

// Get a specific sentence by ID
export const getSentenceById = (id) => {
  return gameSentences.find(sentence => sentence.id === id);
};

// Get sentences by difficulty level
export const getSentencesByDifficulty = (difficulty) => {
  return gameSentences.filter(sentence => sentence.difficulty === difficulty);
};

// Get sentences by rule ID
export const getSentencesByRuleId = (ruleId) => {
  return gameSentences.filter(sentence => sentence.ruleId === ruleId);
};

// Get sentences by correct answer type
export const getSentencesByAnswerType = (answerType) => {
  if (answerType === 'indefinite') {
    return gameSentences.filter(sentence =>
      sentence.correctAnswer === 'a' || sentence.correctAnswer === 'an'
    );
  }
  return gameSentences.filter(sentence => sentence.correctAnswer === answerType);
};

// Get random sentences with optional filtering
export const getRandomSentences = (count = 10, options = {}) => {
  const { difficulty, ruleId, answerType } = options;
  let filtered = [...gameSentences];

  // Apply filters
  if (difficulty) {
    filtered = filtered.filter(sentence => sentence.difficulty === difficulty);
  }

  if (ruleId) {
    filtered = filtered.filter(sentence => sentence.ruleId === ruleId);
  }

  if (answerType) {
    if (answerType === 'indefinite') {
      filtered = filtered.filter(sentence =>
        sentence.correctAnswer === 'a' || sentence.correctAnswer === 'an'
      );
    } else {
      filtered = filtered.filter(sentence => sentence.correctAnswer === answerType);
    }
  }

  // Shuffle the filtered array
  const shuffled = filtered.sort(() => 0.5 - Math.random());

  // Return the requested count
  return shuffled.slice(0, Math.min(count, shuffled.length));
};

// Shuffle an array of sentences
export const shuffleSentences = (sentences) => {
  return [...sentences].sort(() => 0.5 - Math.random());
};

// Get sentences statistics
export const getSentenceStatistics = () => {
  const total = gameSentences.length;

  const byDifficulty = {
    beginner: gameSentences.filter(s => s.difficulty === 'beginner').length,
    intermediate: gameSentences.filter(s => s.difficulty === 'intermediate').length,
    advanced: gameSentences.filter(s => s.difficulty === 'advanced').length
  };

  const byAnswer = {
    a: gameSentences.filter(s => s.correctAnswer === 'a').length,
    an: gameSentences.filter(s => s.correctAnswer === 'an').length,
    the: gameSentences.filter(s => s.correctAnswer === 'the').length,
    nothing: gameSentences.filter(s => s.correctAnswer === 'nothing').length
  };

  const byRule = gameSentences.reduce((acc, sentence) => {
    acc[sentence.ruleId] = (acc[sentence.ruleId] || 0) + 1;
    return acc;
  }, {});

  return {
    total,
    byDifficulty,
    byAnswer,
    byRule
  };
};

// Validate if an answer is correct for a sentence
export const isAnswerCorrect = (sentence, userAnswer) => {
  if (!sentence || !userAnswer) return false;

  // Handle the a/an case where user selects "a/an" but answer is "a" or "an"
  if (userAnswer === 'a/an') {
    return sentence.correctAnswer === 'a' || sentence.correctAnswer === 'an';
  }

  return userAnswer === sentence.correctAnswer;
};

// Get the display text for the correct answer
export const getCorrectAnswerDisplay = (correctAnswer) => {
  switch (correctAnswer) {
    case 'nothing':
      return 'NO ARTICLE';
    case 'a':
    case 'an':
      return 'A / AN';
    case 'the':
      return 'THE';
    default:
      return correctAnswer.toUpperCase();
  }
};

// Get available difficulty levels for sentences
export const getSentenceDifficultyLevels = () => {
  return [
    { value: 'all', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];
};

// Get sentences grouped by rule
export const getSentencesGroupedByRule = () => {
  return gameSentences.reduce((acc, sentence) => {
    if (!acc[sentence.ruleId]) {
      acc[sentence.ruleId] = [];
    }
    acc[sentence.ruleId].push(sentence);
    return acc;
  }, {});
};

// Create a practice set with balanced difficulty
export const createBalancedPracticeSet = (totalCount = 10) => {
  const beginnerCount = Math.ceil(totalCount * 0.4); // 40% beginner
  const intermediateCount = Math.ceil(totalCount * 0.4); // 40% intermediate
  const advancedCount = totalCount - beginnerCount - intermediateCount; // 20% advanced

  const beginnerSentences = getRandomSentences(beginnerCount, { difficulty: 'beginner' });
  const intermediateSentences = getRandomSentences(intermediateCount, { difficulty: 'intermediate' });
  const advancedSentences = getRandomSentences(advancedCount, { difficulty: 'advanced' });

  // Combine and shuffle
  const combined = [...beginnerSentences, ...intermediateSentences, ...advancedSentences];
  return shuffleSentences(combined);
};
