import React from "react";
import { useNavigate } from "react-router-dom";

const GameNavigation = ({
  canProceed,
  canRetry,
  nextButtonText,
  showResult,
  isCorrect,
  startNextQuestion
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center">
      <button onClick={() => navigate("/rules")} className="btn-secondary">
        📖 View All Rules
      </button>

      <div className="flex justify-between items-center">
        <div></div>

        {canProceed ? (
          <button onClick={startNextQuestion} className="btn-primary">
            {nextButtonText}
          </button>
        ) : showResult && !isCorrect && canRetry ? (
          <div className="text-blue-600 text-sm flex items-center">
            <span className="text-xl mr-2">🤔</span>
            Try selecting another option
          </div>
        ) : !showResult ? (
          <div className="text-gray-500 flex items-center">
            <span className="text-xl mr-2">👆</span>
            Select an answer to continue
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default GameNavigation;
