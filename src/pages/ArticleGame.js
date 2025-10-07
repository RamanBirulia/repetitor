import React from "react";
import useArticleGameStatistics from "../hooks/useArticleGameStatistics";
import useDebugPanel from "../hooks/useDebugPanel";
import DebugPanel from "../articleGameComponents/DebugPanel";
import DebugButton from "../articleGameComponents/DebugButton";
import {
  isCommonExpression,
  getCommonExpressionIcon,
  getCorrectArticleText,
} from "../utils/gameSentencesUtils";
import {
  GameHeader,
  GameProgressBar,
  AnswerOptions,
  ResultMessage,
  GameNavigation,
  GameCompletedScreen,
  LoadingScreen,
} from "../articleGameComponents";

const ArticleGame = () => {
  const {
    answerWith,
    startNextQuestion,
    resetGame,
    progressState,
    currentQuestionState,
    errorState,
    possibleAnswers,
    isLoading,
    totalQuestions,
  } = useArticleGameStatistics();

  const { isDebugVisible, closeDebugPanel } = useDebugPanel();

  // Show loading screen while initializing
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Show completion screen when game is finished
  if (progressState.isCompleted) {
    const completionStats = {
      questionsCompleted: Math.max(
        0,
        progressState.cursor - errorState.errors.length,
      ),
      errorsRemaining: errorState.errors.length,
      totalFailures: errorState.errors.length,
      finalScore:
        Math.max(0, progressState.cursor - errorState.errors.length) * 10,
    };

    return (
      <GameCompletedScreen
        completionStats={completionStats}
        resetGame={resetGame}
      />
    );
  }

  // Get current question based on progress state
  const currentQuestion = currentQuestionState.currentQuestion;

  // Calculate derived values for UI
  const progress = {
    current: progressState.cursor,
    total: totalQuestions,
    completed: Math.max(0, progressState.cursor - errorState.errors.length),
  };

  const attempts = currentQuestionState.selectedAnswers.length;
  const maxAttempts = currentQuestionState.maxAttempts || 2;
  const showResult =
    attempts === currentQuestionState.maxAttempt ||
    currentQuestionState.isCorrect;
  const canRetry = !currentQuestionState.isCompleted && attempts < maxAttempts;
  const canProceed = currentQuestionState.isCompleted;
  const shouldShowCorrectAnswer = currentQuestionState.isCompleted;
  const selectedAnswer =
    currentQuestionState.selectedAnswers[
      currentQuestionState.selectedAnswers.length - 1
    ] || null;

  // Transform possibleAnswers into articleOptions format
  const articleOptions = possibleAnswers.map((answer) => {
    const failedAnswers = currentQuestionState.selectedAnswers.filter(
      (selectedAnswer) => selectedAnswer !== currentQuestion?.correctAnswer,
    );
    const hasFailed = failedAnswers.includes(answer);
    const isDisabled = currentQuestionState.isCompleted;

    let className = "article-button";
    if (hasFailed) {
      className += " failed";
    }
    if (isDisabled) {
      className += " disabled";
    }

    return {
      value: answer,
      label: answer === "nothing" ? "no article" : answer,
      className,
      disabled: isDisabled,
    };
  });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <GameHeader
        progress={progress}
        currentMode={progressState.mode}
        currentQuestion={currentQuestion}
      />

      {/* Main Game Area */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Bar */}
        <GameProgressBar
          progress={progress}
          progressPercentage={progressState.progressPercentage}
          currentMode={progressState.mode}
        />

        {/* Game Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 animate-slide-up">
          {/* Question Type Indicator */}
          {progressState.mode === "error" && (
            <div className="mb-4 text-center">
              <span className="inline-block bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold">
                🔄 Error Review Question
              </span>
            </div>
          )}

          {/* Sentence */}
          {currentQuestion && currentQuestion.sentence && (
            <div className="text-center mb-12">
              {/* Common Expression Indicator */}
              {isCommonExpression(currentQuestion) && (
                <div className="mb-4 flex justify-center items-center">
                  <span className="inline-flex items-center bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {getCommonExpressionIcon(currentQuestion)}
                    <span className="ml-1">
                      Common Expression - Learn by Heart
                    </span>
                  </span>
                </div>
              )}

              <h2 className="text-2xl md:text-3xl font-medium text-gray-900 leading-relaxed">
                {currentQuestion.sentence.split("___").map((part, index) => (
                  <span key={index}>
                    {part}
                    {index < currentQuestion.sentence.split("___").length - 1 &&
                      (shouldShowCorrectAnswer ? (
                        <span className="inline-block mx-2 px-4 py-1 bg-green-100 border-2 border-green-300 rounded-lg text-green-800 font-semibold">
                          {getCorrectArticleText(
                            currentQuestion.correctAnswer,
                          ) || "_"}
                        </span>
                      ) : (
                        <span className="inline-block mx-2 px-4 py-1 bg-yellow-100 border-2 border-yellow-300 rounded-lg text-yellow-800 font-semibold">
                          ___
                        </span>
                      ))}
                  </span>
                ))}
              </h2>
            </div>
          )}

          <AnswerOptions
            articleOptions={articleOptions}
            answerWith={answerWith}
            attempts={attempts}
            isCorrect={currentQuestionState.isCorrect}
            selectedAnswer={selectedAnswer}
            currentQuestion={currentQuestion}
            maxAttempts={maxAttempts}
          />

          {/* Result Message */}
          <ResultMessage
            showResult={showResult}
            isCorrect={currentQuestionState.isCorrect}
            currentQuestion={currentQuestion}
            shouldShowCorrectAnswer={shouldShowCorrectAnswer}
            canRetry={canRetry}
          />
        </div>

        {/* Navigation */}
        <GameNavigation
          canProceed={canProceed}
          canRetry={canRetry}
          showResult={showResult}
          isCorrect={currentQuestionState.isCorrect}
          startNextQuestion={startNextQuestion}
        />
      </main>

      {/* Debug Panel */}
      <DebugPanel
        progressState={progressState}
        currentQuestionState={currentQuestionState}
        errorState={errorState}
        possibleAnswers={possibleAnswers}
        isLoading={isLoading}
        totalQuestions={totalQuestions}
        isVisible={isDebugVisible}
        onClose={closeDebugPanel}
      />

      {/* Debug Button (only show in development) */}
      {process.env.NODE_ENV === "development" && <DebugButton />}
    </div>
  );
};

export default ArticleGame;
