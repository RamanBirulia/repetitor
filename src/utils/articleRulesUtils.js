// Utility functions for working with article rules data
import articleRulesDataEn from "../content/locales/articleRules-en.json";
import articleRulesDataRu from "../content/locales/articleRules-ru.json";

// Get rules data based on language
const getRulesData = (language = "en") => {
  switch (language) {
    case "ru":
      return articleRulesDataRu.articleRules;
    case "en":
    default:
      return articleRulesDataEn.articleRules;
  }
};

// Get all article rules
export const getArticleRules = (language = "en") => {
  return getRulesData(language);
};

// Get a specific rule by ID
export const getRuleById = (id, language = "en") => {
  const rules = getRulesData(language);
  return rules.find((rule) => rule.id === id);
};

// Get rules by category
export const getRulesByCategory = (category, language = "en") => {
  const rules = getRulesData(language);
  return rules.filter((rule) => rule.category === category);
};

// Get rules by difficulty level
export const getRulesByDifficulty = (difficulty, language = "en") => {
  const rules = getRulesData(language);
  return rules.filter((rule) => rule.difficulty === difficulty);
};

// Get rules by search term (searches title and description)
export const searchRules = (searchTerm, language = "en") => {
  const rules = getRulesData(language);
  if (!searchTerm) return rules;

  const term = searchTerm.toLowerCase();
  return rules.filter(
    (rule) =>
      rule.title.toLowerCase().includes(term) ||
      rule.description.toLowerCase().includes(term) ||
      rule.explanation.toLowerCase().includes(term),
  );
};

// Get filtered rules by category and search term
export const getFilteredRules = (
  category = "all",
  searchTerm = "",
  language = "en",
) => {
  let filtered = getRulesData(language);

  // Filter by category
  if (category !== "all") {
    filtered = filtered.filter((rule) => rule.category === category);
  }

  // Filter by search term
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(
      (rule) =>
        rule.title.toLowerCase().includes(term) ||
        rule.description.toLowerCase().includes(term) ||
        rule.explanation.toLowerCase().includes(term),
    );
  }

  return filtered;
};

// Get rule statistics
export const getRuleStatistics = (language = "en") => {
  const rules = getRulesData(language);
  const total = rules.length;
  const byCategory = {
    definite: rules.filter((r) => r.category === "definite").length,
    indefinite: rules.filter((r) => r.category === "indefinite").length,
    zero: rules.filter((r) => r.category === "zero").length,
    "common-expression": rules.filter((r) => r.category === "common-expression")
      .length,
  };
  const byDifficulty = {
    beginner: rules.filter((r) => r.difficulty === "beginner").length,
    intermediate: rules.filter((r) => r.difficulty === "intermediate").length,
    advanced: rules.filter((r) => r.difficulty === "advanced").length,
  };

  return {
    total,
    byCategory,
    byDifficulty,
  };
};

// Get available categories
export const getCategories = (t) => {
  return [
    { value: "all", label: t ? t("rulesPage.categories.all") : "All Rules" },
    {
      value: "definite",
      label: t ? t("rulesPage.categories.definite") : "The (Definite Article)",
    },
    {
      value: "indefinite",
      label: t
        ? t("rulesPage.categories.indefinite")
        : "A/An (Indefinite Articles)",
    },
    { value: "zero", label: t ? t("rulesPage.categories.zero") : "No Article" },
    {
      value: "common-expression",
      label: t
        ? t("rulesPage.categories.commonExpression")
        : "Common Expressions",
    },
  ];
};

// Get available difficulty levels
export const getDifficultyLevels = () => {
  return [
    { value: "all", label: "All Levels" },
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" },
  ];
};

// Get category icon
export const getCategoryIcon = (category) => {
  switch (category) {
    case "definite":
      return "🎯";
    case "indefinite":
      return "🔤";
    case "zero":
      return "∅";
    case "common-expression":
      return "🧠";
    default:
      return "📚";
  }
};

// Get difficulty color classes
export const getDifficultyColor = (difficulty) => {
  switch (difficulty) {
    case "beginner":
      return "bg-green-100 text-green-800 border-green-200";
    case "intermediate":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "advanced":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};
