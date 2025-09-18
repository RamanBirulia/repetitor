import React from "react";

const ErrorStatusCard = ({
  wrongAnswersMap,
  currentMode,
  regularQuestionCounter,
  cursor,
  totalSentences,
  errorQuestionCounter,
}) => {
  if (wrongAnswersMap.length === 0 && currentMode !== "error") {
    return null;
  }

  const nextErrorReview = Math.ceil((regularQuestionCounter + 1) / 5) * 5;

  return (
    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="text-sm text-yellow-800">
        <strong>Errors to Review:</strong> {wrongAnswersMap.length} questions
        need more practice
      </div>
      <div className="text-xs text-yellow-600 mt-1">
        Error questions appear every 5th question for additional practice
      </div>
      <div className="text-xs text-gray-500 mt-2 space-y-1">
        <div>
          Progress: {regularQuestionCounter} regular questions completed
        </div>
        <div>
          Main cursor position: {cursor} of {totalSentences}
        </div>
        {currentMode === "error" && (
          <div>Error review: {errorQuestionCounter + 1}/2</div>
        )}
        <div>Next error review at: {nextErrorReview} questions</div>
      </div>
    </div>
  );
};

export default ErrorStatusCard;
