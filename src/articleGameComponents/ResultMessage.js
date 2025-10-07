import React from "react";
import { useNavigate } from "react-router-dom";
import { getCorrectAnswerDisplay } from "../utils/gameSentencesUtils";

const ResultMessage = ({
  showResult,
  isCorrect,
  currentQuestion,
  shouldShowCorrectAnswer,
  canRetry,
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
          className={`text-sm mb-3 ${
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
        className={`text-xl leading-relaxed ${
          isCorrect ? "text-green-600" : "text-red-600"
        }`}
      >
        {currentQuestion.explanation}
      </p>

      <div className="mt-6 text-center">
        <button
          onClick={() => navigate(`/rules/${currentQuestion.ruleId}`)}
          className="text-grey-500 hover:text-grey-800 hover:scale-105 text-sm transition-transform"
        >
          📖 Study this rule in detail →
        </button>
      </div>
    </div>
  );
};

export default ResultMessage;
