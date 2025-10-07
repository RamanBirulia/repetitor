import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  getRuleById,
  getFilteredRules,
  getRuleStatistics,
  getCategories,
  getCategoryIcon,
} from "../utils/articleRulesUtils";
import LanguageSwitcher from "../components/LanguageSwitcher";

const RulesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { ruleId } = useParams();
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Check if user came from the game page
  const [cameFromGame, setCameFromGame] = useState(false);

  const categories = getCategories(t);
  const currentLanguage = i18n.language;

  useEffect(() => {
    // Check if user came from the game page
    const referrer = document.referrer;
    const fromGamePage =
      referrer.includes("/article-game") || location.state?.fromGame;
    setCameFromGame(fromGamePage && ruleId); // Only show back button when viewing a specific rule from game
  }, [ruleId, location]);

  useEffect(() => {
    if (ruleId) {
      const rule = getRuleById(ruleId, currentLanguage);
      if (rule) {
        // Scroll to the specific rule
        setTimeout(() => {
          const element = document.getElementById(`rule-${ruleId}`);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 100);
      }
    }
  }, [ruleId, currentLanguage]);

  const filteredRules = getFilteredRules(
    selectedCategory,
    searchTerm,
    currentLanguage,
  );
  const ruleStats = getRuleStatistics(currentLanguage);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Floating Back Button - only when coming from game */}
      {cameFromGame && (
        <div className="fixed top-24 right-4 sm:right-6 z-50 animate-fade-in">
          <button
            onClick={() => navigate("/article-game")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 sm:px-5 sm:py-3 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-1 flex items-center space-x-1 sm:space-x-2 font-medium text-xs sm:text-sm"
            title="Back to Game"
          >
            <svg
              className="w-3 h-3 sm:w-4 sm:h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span>Back</span>
          </button>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => navigate("/")}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              {t("header.backToHome")}
            </button>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <button
                onClick={() => navigate("/article-game")}
                className="btn-primary"
              >
                🎮 {t("header.practiceGame")}
              </button>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {t("rulesPage.title")}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("rulesPage.subtitle")}
            </p>
          </div>
        </div>
      </header>

      {/* Search and Filter Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder={t("rulesPage.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="md:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Rules List */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8">
            {filteredRules.map((rule, index) => (
              <div
                key={rule.id}
                id={`rule-${rule.id}`}
                className={`mb-12 last:mb-0 ${
                  ruleId === rule.id
                    ? "bg-blue-50 -mx-8 px-8 py-6 rounded-lg border-l-4 border-blue-500"
                    : ""
                }`}
              >
                {/* Rule Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">
                      {getCategoryIcon(rule.category)}
                    </span>
                    <span className="text-2xl font-bold text-gray-900">
                      {index + 1}. {rule.title}
                    </span>
                  </div>
                </div>

                {/* Rule Description */}
                <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                  {rule.description}
                </p>

                {/* Detailed Explanation */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="text-xl mr-2">📝</span>
                    {t("rulesPage.detailedExplanation")}
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-base">
                    {rule.explanation}
                  </p>
                </div>

                {/* Examples */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="text-xl mr-2">💡</span>
                    {t("rulesPage.examples")}
                  </h3>
                  <div className="grid gap-3">
                    {rule.examples.map((example, exampleIndex) => (
                      <div
                        key={exampleIndex}
                        className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg"
                      >
                        <p className="text-blue-900 font-medium text-base">
                          "{example}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Separator */}
                {index < filteredRules.length - 1 && (
                  <hr className="border-gray-200 border-t-2 mt-8" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* No Results */}
        {filteredRules.length === 0 && (
          <div className="max-w-4xl mx-auto text-center py-12">
            <div className="bg-white rounded-lg shadow-sm p-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t("rulesPage.noRulesFound")}
              </h3>
              <p className="text-gray-600 mb-6">
                {t("rulesPage.tryAdjusting")}
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                }}
                className="btn-secondary"
              >
                {t("rulesPage.clearFilters")}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {ruleStats.total}
              </div>
              <div className="text-sm text-gray-600">
                {t("rulesPage.totalRules")}
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-1">
                {ruleStats.byDifficulty.beginner}
              </div>
              <div className="text-sm text-gray-600">
                {t("rulesPage.difficulty.beginner")}
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-600 mb-1">
                {ruleStats.byDifficulty.intermediate}
              </div>
              <div className="text-sm text-gray-600">
                {t("rulesPage.difficulty.intermediate")}
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-600 mb-1">
                {ruleStats.byDifficulty.advanced}
              </div>
              <div className="text-sm text-gray-600">
                {t("rulesPage.difficulty.advanced")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RulesPage;
