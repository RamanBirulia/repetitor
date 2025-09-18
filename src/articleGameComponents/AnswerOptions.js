import React from "react";

const AnswerOptions = ({ articleOptions, answerWith, attempts, isCorrect }) => {
  return (
    <div>
      {/* Answer Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {articleOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => answerWith(option.value)}
            disabled={option.disabled}
            className={option.className}
          >
            {option.label}
            {option.className.includes("failed") && (
              <span className="ml-2 text-red-500">✗</span>
            )}
          </button>
        ))}
      </div>

      {/* Attempts Indicator */}
      <div className="flex justify-center space-x-2 my-6">
        {[1, 2].map((attempt) => (
          <div
            key={attempt}
            className={`w-3 h-3 rounded-full
              ${attempts > attempt && "bg-red-500"}
              ${attempts === attempt && isCorrect ? "bg-green-500" : "bg-red-500"}
              ${attempts < attempt && "bg-gray-500"}
            `}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default AnswerOptions;
