// Utility functions for working with article rules data
import articleRulesData from '../content/articleRules.json';

const { articleRules } = articleRulesData;

// Get all article rules
export const getArticleRules = () => {
  return articleRules;
};

// Get a specific rule by ID
export const getRuleById = (id) => {
  return articleRules.find(rule => rule.id === id);
};

// Get rules by category
export const getRulesByCategory = (category) => {
  return articleRules.filter(rule => rule.category === category);
};

// Get rules by difficulty level
export const getRulesByDifficulty = (difficulty) => {
  return articleRules.filter(rule => rule.difficulty === difficulty);
};

// Get rules by search term (searches title and description)
export const searchRules = (searchTerm) => {
  if (!searchTerm) return articleRules;

  const term = searchTerm.toLowerCase();
  return articleRules.filter(rule =>
    rule.title.toLowerCase().includes(term) ||
    rule.description.toLowerCase().includes(term) ||
    rule.explanation.toLowerCase().includes(term)
  );
};

// Get filtered rules by category and search term
export const getFilteredRules = (category = 'all', searchTerm = '') => {
  let filtered = articleRules;

  // Filter by category
  if (category !== 'all') {
    filtered = filtered.filter(rule => rule.category === category);
  }

  // Filter by search term
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(rule =>
      rule.title.toLowerCase().includes(term) ||
      rule.description.toLowerCase().includes(term) ||
      rule.explanation.toLowerCase().includes(term)
    );
  }

  return filtered;
};

// Get rule statistics
export const getRuleStatistics = () => {
  const total = articleRules.length;
  const byCategory = {
    definite: articleRules.filter(r => r.category === 'definite').length,
    indefinite: articleRules.filter(r => r.category === 'indefinite').length,
    zero: articleRules.filter(r => r.category === 'zero').length
  };
  const byDifficulty = {
    beginner: articleRules.filter(r => r.difficulty === 'beginner').length,
    intermediate: articleRules.filter(r => r.difficulty === 'intermediate').length,
    advanced: articleRules.filter(r => r.difficulty === 'advanced').length
  };

  return {
    total,
    byCategory,
    byDifficulty
  };
};

// Get available categories
export const getCategories = () => {
  return [
    { value: 'all', label: 'All Rules' },
    { value: 'definite', label: 'The (Definite Article)' },
    { value: 'indefinite', label: 'A/An (Indefinite Articles)' },
    { value: 'zero', label: 'No Article' }
  ];
};

// Get available difficulty levels
export const getDifficultyLevels = () => {
  return [
    { value: 'all', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];
};

// Get category icon
export const getCategoryIcon = (category) => {
  switch (category) {
    case 'definite':
      return '🎯';
    case 'indefinite':
      return '🔤';
    case 'zero':
      return '∅';
    default:
      return '📚';
  }
};

// Get difficulty color classes
export const getDifficultyColor = (difficulty) => {
  switch (difficulty) {
    case 'beginner':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'intermediate':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'advanced':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};
