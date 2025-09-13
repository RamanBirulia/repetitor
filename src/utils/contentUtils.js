// Content utility functions using configuration
import contentConfig from "../content/config.json";

// Get app configuration
export const getAppConfig = () => {
  return contentConfig.appConfig;
};

// Get game configuration
export const getGameConfig = () => {
  return contentConfig.gameConfig;
};

// Get article game configuration
export const getArticleGameConfig = () => {
  return contentConfig.gameConfig.articleGame;
};

// Get upcoming games
export const getUpcomingGames = () => {
  return contentConfig.gameConfig.upcomingGames;
};

// Get content categories
export const getContentCategories = () => {
  return contentConfig.contentCategories;
};

// Get difficulty levels
export const getDifficultyLevels = () => {
  return contentConfig.difficultyLevels;
};

// Get UI configuration
export const getUIConfig = () => {
  return contentConfig.uiConfig;
};

// Get feature configuration
export const getFeatureConfig = () => {
  return contentConfig.features;
};

// Get content strings
export const getContentStrings = () => {
  return contentConfig.content;
};

// Get metadata
export const getContentMetadata = () => {
  return contentConfig.metadata;
};

// Get theme colors
export const getThemeColors = () => {
  return contentConfig.uiConfig.theme;
};

// Get difficulty color class by level
export const getDifficultyColorClass = (difficulty) => {
  const levels = contentConfig.difficultyLevels;
  const level = levels[difficulty];

  if (!level) return "bg-gray-100 text-gray-800 border-gray-200";

  const colorMap = {
    green: "bg-green-100 text-green-800 border-green-200",
    yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
    red: "bg-red-100 text-red-800 border-red-200",
    blue: "bg-blue-100 text-blue-800 border-blue-200",
    gray: "bg-gray-100 text-gray-800 border-gray-200",
  };

  return colorMap[level.color] || "bg-gray-100 text-gray-800 border-gray-200";
};

// Get category information
export const getCategoryInfo = (categoryId) => {
  return contentConfig.contentCategories.articleRules[categoryId];
};

// Get category icon by ID
export const getCategoryIconById = (categoryId) => {
  const category = getCategoryInfo(categoryId);
  return category ? category.icon : "📚";
};

// Check if a feature is enabled
export const isFeatureEnabled = (featureName) => {
  const features = contentConfig.features;
  return features[featureName]?.enabled || false;
};

// Get scoring configuration
export const getScoringConfig = () => {
  return contentConfig.gameConfig.articleGame.scoring;
};

// Get answer options for article game
export const getAnswerOptions = () => {
  return contentConfig.gameConfig.articleGame.answerOptions;
};

// Get maximum content width
export const getMaxContentWidth = () => {
  return `max-w-${contentConfig.uiConfig.layout.maxContentWidth}`;
};

// Get transition duration
export const getTransitionDuration = () => {
  return contentConfig.uiConfig.animations.transitionDuration;
};

// Check if animations are enabled
export const areAnimationsEnabled = () => {
  return contentConfig.uiConfig.animations.enableTransitions;
};

// Get search configuration
export const getSearchConfig = () => {
  return contentConfig.features.search;
};

// Get filtering configuration
export const getFilteringConfig = () => {
  return contentConfig.features.filtering;
};

// Get direct linking configuration
export const getDirectLinkingConfig = () => {
  return contentConfig.features.directLinking;
};

// Get progress tracking configuration
export const getProgressTrackingConfig = () => {
  return contentConfig.features.progressTracking;
};

// Get timing configuration
export const getTimingConfig = () => {
  return contentConfig.gameConfig.articleGame.timing;
};

// Get learning flow configuration
export const getLearningFlowConfig = () => {
  return contentConfig.gameConfig.articleGame.learningFlow;
};

// Get correct answer display time
export const getCorrectAnswerDisplayTime = () => {
  return contentConfig.gameConfig.articleGame.timing.correctAnswerDisplayTime;
};

// Get incorrect answer display time
export const getIncorrectAnswerDisplayTime = () => {
  return contentConfig.gameConfig.articleGame.timing.incorrectAnswerDisplayTime;
};

// Check if auto-advance is enabled
export const isAutoAdvanceEnabled = () => {
  return contentConfig.gameConfig.articleGame.timing.autoAdvanceEnabled;
};

// Check if skip button should be shown
export const shouldShowSkipButton = () => {
  return contentConfig.gameConfig.articleGame.learningFlow.showSkipButton;
};

// Check if game should pause on incorrect answers
export const shouldPauseOnIncorrect = () => {
  return contentConfig.gameConfig.articleGame.learningFlow.pauseOnIncorrect;
};

// Get default question count for games
export const getDefaultQuestionCount = () => {
  return contentConfig.gameConfig.articleGame.defaultQuestionCount;
};

// Get maximum question count for games
export const getMaxQuestionCount = () => {
  return contentConfig.gameConfig.articleGame.maxQuestionCount;
};

// Get all available categories for dropdowns
export const getCategoryOptions = () => {
  const categories = contentConfig.contentCategories.articleRules;
  return [
    { value: "all", label: "All Rules" },
    ...Object.entries(categories).map(([key, category]) => ({
      value: key,
      label: category.name,
    })),
  ];
};

// Get all available difficulty levels for dropdowns
export const getDifficultyOptions = () => {
  const levels = contentConfig.difficultyLevels;
  return [
    { value: "all", label: "All Levels" },
    ...Object.entries(levels)
      .sort((a, b) => a[1].order - b[1].order)
      .map(([key, level]) => ({
        value: key,
        label: level.name,
      })),
  ];
};

// Format page title with app name
export const formatPageTitle = (pageTitle) => {
  const appName = contentConfig.appConfig.name;
  return pageTitle ? `${pageTitle} - ${appName}` : appName;
};

// Get version information
export const getVersionInfo = () => {
  return {
    app: contentConfig.appConfig.version,
    content: contentConfig.metadata.contentVersion,
    lastUpdated: contentConfig.metadata.lastUpdated,
  };
};

// Validate content integrity
export const validateContentIntegrity = () => {
  const metadata = contentConfig.metadata;
  const issues = [];

  // Check if metadata matches actual content
  if (metadata.totalRules !== 8) {
    issues.push(
      `Rule count mismatch: expected ${metadata.totalRules}, but should be 8`,
    );
  }

  if (metadata.totalSentences !== 30) {
    issues.push(
      `Sentence count mismatch: expected ${metadata.totalSentences}, but should be 30`,
    );
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
};
