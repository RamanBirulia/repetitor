import React from "react";

const AnswerOptions = ({
  articleOptions,
  answerWith,
  attempts,
  isCorrect,
  selectedAnswer,
  currentQuestion,
  maxAttempts = 2,
}) => {
  // Determine which options to use - custom from question or default articleOptions
  const optionsToUse = React.useMemo(() => {
    // Check if current question has custom answer options
    if (
      currentQuestion?.answerOptions &&
      Array.isArray(currentQuestion.answerOptions)
    ) {
      // Use custom options from the question
      const failedAnswers = [];
      if (selectedAnswer && !isCorrect) {
        failedAnswers.push(selectedAnswer);
      }

      return currentQuestion.answerOptions.map((option) => {
        const hasFailed = failedAnswers.includes(option);
        const isDisabled = attempts >= maxAttempts || isCorrect === true;

        let className = "article-button";
        if (hasFailed) {
          className += " failed";
        }
        if (isDisabled) {
          className += " disabled";
        }

        return {
          value: option,
          label: option === "nothing" ? "no article" : option,
          className,
          disabled: isDisabled,
        };
      });
    }

    // Fall back to default articleOptions
    return articleOptions;
  }, [
    currentQuestion,
    articleOptions,
    selectedAnswer,
    isCorrect,
    attempts,
    maxAttempts,
  ]);

  return (
    <div>
      {/* Answer Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {optionsToUse.map((option) => {
          const isSelected = selectedAnswer === option.value;
          const isCorrectAnswer =
            currentQuestion && currentQuestion.correctAnswer === option.value;
          const showCorrectness = isSelected && isCorrect !== null;
          const shouldHighlightCorrect =
            isCorrectAnswer && isCorrect === false && attempts >= maxAttempts;

          let buttonClass = option.className;
          if (showCorrectness) {
            if (isCorrect) {
              buttonClass = "article-button correct";
            } else {
              buttonClass = "article-button incorrect";
            }
          } else if (shouldHighlightCorrect) {
            // Show correct answer after user has exhausted attempts
            buttonClass = "article-button correct";
          }

          return (
            <button
              key={option.value}
              onClick={() => answerWith(option.value)}
              disabled={option.disabled}
              className={buttonClass}
            >
              {option.label}
              {option.className.includes("failed") && !showCorrectness && (
                <span className="ml-2 text-red-500">✗</span>
              )}
              {showCorrectness && isCorrect && (
                <span className="ml-2 text-green-600">✓</span>
              )}
              {showCorrectness && !isCorrect && (
                <span className="ml-2 text-red-500">✗</span>
              )}
              {shouldHighlightCorrect && !isSelected && (
                <span className="ml-2 text-green-600">✓</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Attempts Indicator */}
      <div className="flex justify-center space-x-2 my-6">
        {Array.from(Array(maxAttempts).keys()).map((attempt) => (
          <div
            key={attempt}
            className={`w-3 h-3 rounded-full
              ${attempts > attempt + 1 && "bg-red-500"}
              ${attempts < attempt + 1 && "bg-gray-500"}
              ${attempts === attempt + 1 && (isCorrect ? "bg-green-500" : "bg-red-500")}
            `}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default AnswerOptions;
