import React from "react";

const QuestionCard = ({ currentQuestion, currentMode }) => {
  if (!currentQuestion) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 animate-slide-up">
      {/* Question Type Indicator */}
      {currentMode === "error" && (
        <div className="mb-4 text-center">
          <span className="inline-block bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold">
            🔄 Error Review Question
          </span>
        </div>
      )}

      {/* Sentence */}
      <div className="text-center mb-12">
        <h2 className="text-2xl md:text-3xl font-medium text-gray-900 leading-relaxed">
          {currentQuestion.sentence.split("___").map((part, index) => (
            <span key={index}>
              {part}
              {index < currentQuestion.sentence.split("___").length - 1 && (
                <span className="inline-block mx-2 px-4 py-1 bg-yellow-100 border-2 border-yellow-300 rounded-lg text-yellow-800 font-semibold">
                  ___
                </span>
              )}
            </span>
          ))}
        </h2>
      </div>
    </div>
  );
};

export default QuestionCard;
