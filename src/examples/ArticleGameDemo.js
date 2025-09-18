import React, { useState } from "react";
import useArticleGameStatistics from "../hooks/useArticleGameStatistics";

/**
 * Demo component to showcase localStorage answer state persistence
 *
 * This component demonstrates how the improved useArticleGameStatistics hook
 * now persists user answer selections across page reloads.
 */
const ArticleGameDemo = () => {
  const {
    answerWith,
    startNextQuestion,
    skipQuestion,
    resetGame,
    clearStoredStatistics,
    clearAnswerStateForCurrentQuestion,
    getStoredAnswerStates,
    articleGameResult,
  } = useArticleGameStatistics();

  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [storedStates, setStoredStates] = useState([]);

  const handleShowStoredStates = () => {
    const states = getStoredAnswerStates();
    setStoredStates(states);
  };

  const handleReloadDemo = () => {
    window.location.reload();
  };

  if (articleGameResult.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading game...</div>
      </div>
    );
  }

  if (articleGameResult.isCompleted) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-green-600 mb-4">🎉 Game Completed!</h2>
        <div className="space-y-2 mb-6">
          <p>Final Score: {articleGameResult.completionStats.finalScore}</p>
          <p>Questions Completed: {articleGameResult.completionStats.questionsCompleted}</p>
          <p>Errors Remaining: {articleGameResult.completionStats.errorsRemaining}</p>
        </div>
        <div className="space-x-4">
          <button
            onClick={resetGame}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Play Again
          </button>
          <button
            onClick={clearStoredStatistics}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Clear All Data
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = articleGameResult.currentQuestion;
  if (!currentQuestion) {
    return (
      <div className="text-center">
        <p>No questions available</p>
        <button
          onClick={resetGame}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Reset Game
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header with demo info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          📚 Article Game with localStorage Demo
        </h1>
        <p className="text-gray-700">
          This demo shows how your answer selections are now saved to localStorage.
          Try selecting an answer and then reloading the page - your selection will persist!
        </p>
      </div>

      {/* Progress and score */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold">
              Progress: {articleGameResult.progress.current} / {articleGameResult.progress.total}
            </h2>
            <p className="text-sm text-gray-600">{articleGameResult.progress.type}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              Score: {articleGameResult.score}
            </div>
            <div className="text-sm text-gray-500">
              Mode: {articleGameResult.currentMode}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${articleGameResult.progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Main question card */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Complete the sentence:</h3>
        <p className="text-lg mb-6 p-4 bg-gray-50 rounded-lg font-mono">
          {currentQuestion.sentence}
        </p>

        {/* Answer options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {articleGameResult.articleOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => answerWith(option.value)}
              disabled={option.disabled}
              className={`p-4 rounded-lg border-2 text-center font-semibold transition-all duration-200 ${
                option.className === "article-button"
                  ? "border-gray-300 bg-white hover:bg-blue-50 hover:border-blue-300"
                  : option.className === "article-button correct"
                  ? "border-green-500 bg-green-100 text-green-800"
                  : option.className === "article-button incorrect"
                  ? "border-red-500 bg-red-100 text-red-800"
                  : option.className === "article-button failed"
                  ? "border-gray-400 bg-gray-100 text-gray-500 cursor-not-allowed"
                  : "border-gray-300 bg-white"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Answer feedback */}
        {articleGameResult.showResult && (
          <div className="mb-6">
            {articleGameResult.isCorrect ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-semibold">✅ Correct!</p>
                {currentQuestion.explanation && (
                  <p className="text-green-700 mt-2">{currentQuestion.explanation}</p>
                )}
              </div>
            ) : (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 font-semibold">❌ Incorrect</p>
                {articleGameResult.canRetry ? (
                  <p className="text-red-700 mt-2">Try another option!</p>
                ) : (
                  <div>
                    <p className="text-red-700 mt-2">
                      The correct answer is: <strong>{currentQuestion.correctAnswer}</strong>
                    </p>
                    {currentQuestion.explanation && (
                      <p className="text-red-700 mt-2">{currentQuestion.explanation}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Answer state info */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 font-semibold mb-2">📋 Current Answer State:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Selected:</span>
              <br />
              <span className="text-blue-700">
                {articleGameResult.selectedAnswer || "None"}
              </span>
            </div>
            <div>
              <span className="font-medium">Attempts:</span>
              <br />
              <span className="text-blue-700">{articleGameResult.attempts}</span>
            </div>
            <div>
              <span className="font-medium">Is Correct:</span>
              <br />
              <span className="text-blue-700">
                {articleGameResult.isCorrect === null
                  ? "Unknown"
                  : articleGameResult.isCorrect
                  ? "Yes"
                  : "No"}
              </span>
            </div>
            <div>
              <span className="font-medium">Failed Options:</span>
              <br />
              <span className="text-blue-700">
                {articleGameResult.failedOptions.length > 0
                  ? articleGameResult.failedOptions.join(", ")
                  : "None"}
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-4">
          {articleGameResult.canProceed && (
            <button
              onClick={startNextQuestion}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold"
            >
              {articleGameResult.nextButtonText}
            </button>
          )}

          <button
            onClick={skipQuestion}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Skip Question
          </button>

          <button
            onClick={clearAnswerStateForCurrentQuestion}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            title="Clear the saved answer state for this question"
          >
            Clear Answer State
          </button>

          <button
            onClick={handleReloadDemo}
            className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
            title="Reload page to test localStorage persistence"
          >
            🔄 Reload Page
          </button>
        </div>
      </div>

      {/* Debug Panel */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">🔧 Debug Information</h3>
          <button
            onClick={() => setShowDebugInfo(!showDebugInfo)}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            {showDebugInfo ? "Hide" : "Show"} Debug
          </button>
        </div>

        {showDebugInfo && (
          <div className="space-y-4">
            {/* Debug info from hook */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Hook Debug Info:</h4>
              <pre className="text-sm text-gray-700">
                {JSON.stringify(articleGameResult.debugInfo, null, 2)}
              </pre>
            </div>

            {/* Stored answer states */}
            <div>
              <div className="flex items-center gap-4 mb-2">
                <h4 className="font-semibold">Stored Answer States:</h4>
                <button
                  onClick={handleShowStoredStates}
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                >
                  Refresh
                </button>
              </div>
              {storedStates.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {storedStates.map((state, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded text-sm">
                      <div className="font-medium">{state.key}</div>
                      <div className="text-gray-600">
                        Selected: {state.selectedAnswer}, Attempts: {state.attempts},
                        Correct: {state.isCorrect ? "Yes" : "No"}
                      </div>
                      {state.timestamp && (
                        <div className="text-xs text-gray-500">
                          {new Date(state.timestamp).toLocaleString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No stored answer states found</p>
              )}
            </div>

            {/* Control buttons */}
            <div className="border-t pt-4 space-x-4">
              <button
                onClick={resetGame}
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                Reset Game
              </button>
              <button
                onClick={clearStoredStatistics}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Clear All localStorage Data
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h4 className="font-semibold text-green-800 mb-2">💡 Test localStorage Persistence:</h4>
        <ol className="list-decimal list-inside text-green-700 space-y-1">
          <li>Select an answer option above</li>
          <li>Click the "🔄 Reload Page" button</li>
          <li>Notice that your selection is preserved after reload</li>
          <li>Try different combinations: wrong answers, retries, etc.</li>
          <li>Each question's answer state is saved independently</li>
        </ol>
      </div>
    </div>
  );
};

export default ArticleGameDemo;
