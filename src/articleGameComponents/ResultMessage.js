import React from "react";
import { useNavigate } from "react-router-dom";
import { getCorrectAnswerDisplay } from "../utils/gameSentencesUtils";

const ResultMessage = ({
  showResult,
  isCorrect,
  currentQuestion,
  shouldShowCorrectAnswer,
  canRetry
}) => {
  const navigate = useNavigate();

  if (!showResult || !currentQuestion) {
    return null;
  }

  return (
    <div
      className={`text-center p-6 rounded-lg animate-fade-in ${
        isCorrect
          ? "bg-green-50 border border-green-200"
          : "bg-red-50 border border-red-200"
      }`}
    >
      {/* Only show correct answer if user can't retry anymore */}
      {shouldShowCorrectAnswer && (
        <p
          className={`text-base mb-3 ${
            isCorrect ? "text-green-700" : "text-red-700"
          }`}
        >
          Correct answer:{" "}
          <strong>
            {getCorrectAnswerDisplay(currentQuestion.correctAnswer)}
          </strong>
        </p>
      )}

      <p
        className={`text-base leading-relaxed ${
          isCorrect ? "text-green-600" : "text-red-600"
        }`}
      >
        {currentQuestion.explanation}
      </p>

      {canRetry && (
        <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
          <div className="flex items-start">
            <div className="text-2xl mr-3">💡</div>
            <div>
              <h4 className="text-blue-800 font-semibold mb-1">
                Try again!
              </h4>
              <p className="text-blue-700 text-sm">
                Read the explanation above carefully, then select
                another option. You can still get partial points!
              </p>
            </div>
          </div>
        </div>
      )}

      {!isCorrect && !canRetry && (
        <div className="mt-3 text-center">
          <button
            onClick={() => navigate(`/rules/${currentQuestion.ruleId}`)}
            className="text-blue-600 hover:text-blue-800 text-sm underline"
          >
            📖 Study this rule in detail →
          </button>
        </div>
      )}
    </div>
  );
};

export default ResultMessage;
