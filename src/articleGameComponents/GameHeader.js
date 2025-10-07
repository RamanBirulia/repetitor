import React from "react";
import { useNavigate } from "react-router-dom";

const GameHeader = ({ progress, currentMode, currentQuestion }) => {
  const navigate = useNavigate();

  const navigateToRule = (ruleId) => {
    navigate(`/rules/${ruleId}`);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate("/")}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back to Home
          </button>

          <div className="flex items-center space-x-6">
            <div className="text-sm text-gray-600">
              Question: {progress.current} of {progress.total}
            </div>
            {currentMode === "error" && (
              <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold">
                Review Mode
              </div>
            )}
            {currentQuestion && (
              <button
                onClick={() => navigateToRule(currentQuestion.ruleId)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-full transition-colors"
                title="View grammar rules"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default GameHeader;
