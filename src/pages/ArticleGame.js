import React from "react";
import useArticleGameStatistics from "../hooks/useArticleGameStatistics";
import useDebugPanel from "../hooks/useDebugPanel";
import DebugPanel from "../articleGameComponents/DebugPanel";
import DebugButton from "../articleGameComponents/DebugButton";
import {
  isCommonExpression,
  getCommonExpressionIcon,
} from "../utils/gameSentencesUtils";
import {
  GameHeader,
  GameProgressBar,
  ErrorStatusCard,
  AnswerOptions,
  ResultMessage,
  GameNavigation,
  GameCompletedScreen,
  LoadingScreen,
} from "../articleGameComponents";

const ArticleGame = () => {
  const { answerWith, startNextQuestion, resetGame, articleGameResult } =
    useArticleGameStatistics();

  const { isDebugVisible, closeDebugPanel } = useDebugPanel();

  // Show loading screen while initializing
  if (articleGameResult.isLoading) {
    return <LoadingScreen />;
  }

  // Show completion screen when game is finished
  if (articleGameResult.isCompleted) {
    return (
      <GameCompletedScreen
        completionStats={articleGameResult.completionStats}
        resetGame={resetGame}
      />
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <GameHeader
        score={articleGameResult.score}
        progress={articleGameResult.progress}
        currentMode={articleGameResult.currentMode}
        currentQuestion={articleGameResult.currentQuestion}
      />

      {/* Main Game Area */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Bar */}
        <GameProgressBar
          progress={articleGameResult.progress}
          progressPercentage={articleGameResult.progressPercentage}
          currentMode={articleGameResult.currentMode}
        />

        {/* Error Status */}
        <ErrorStatusCard
          wrongAnswersMap={articleGameResult.wrongAnswersMap}
          currentMode={articleGameResult.currentMode}
          regularQuestionCounter={articleGameResult.progress.current}
          cursor={articleGameResult.cursor}
          totalSentences={articleGameResult.progress.total}
          errorQuestionCounter={0} // This could be exposed from the hook if needed
        />

        {/* Game Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 animate-slide-up">
          {/* Question Type Indicator */}
          {articleGameResult.currentMode === "error" && (
            <div className="mb-4 text-center">
              <span className="inline-block bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold">
                🔄 Error Review Question
              </span>
            </div>
          )}

          {/* Sentence */}
          {articleGameResult.currentQuestion && (
            <div className="text-center mb-12">
              {/* Common Expression Indicator */}
              {isCommonExpression(articleGameResult.currentQuestion) && (
                <div className="mb-4 flex justify-center items-center">
                  <span className="inline-flex items-center bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {getCommonExpressionIcon(articleGameResult.currentQuestion)}
                    <span className="ml-1">
                      Common Expression - Learn by Heart
                    </span>
                  </span>
                </div>
              )}

              <h2 className="text-2xl md:text-3xl font-medium text-gray-900 leading-relaxed">
                {articleGameResult.currentQuestion.sentence
                  .split("___")
                  .map((part, index) => (
                    <span key={index}>
                      {part}
                      {index <
                        articleGameResult.currentQuestion.sentence.split("___")
                          .length -
                          1 && (
                        <span className="inline-block mx-2 px-4 py-1 bg-yellow-100 border-2 border-yellow-300 rounded-lg text-yellow-800 font-semibold">
                          ___
                        </span>
                      )}
                    </span>
                  ))}
              </h2>
            </div>
          )}

          <AnswerOptions
            articleOptions={articleGameResult.articleOptions}
            answerWith={answerWith}
            attempts={articleGameResult.attempts}
            isCorrect={articleGameResult.isCorrect}
          />

          {/* Result Message */}
          <ResultMessage
            showResult={articleGameResult.showResult}
            isCorrect={articleGameResult.isCorrect}
            currentQuestion={articleGameResult.currentQuestion}
            shouldShowCorrectAnswer={articleGameResult.shouldShowCorrectAnswer}
            canRetry={articleGameResult.canRetry}
          />
        </div>

        {/* Navigation */}
        <GameNavigation
          canProceed={articleGameResult.canProceed}
          canRetry={articleGameResult.canRetry}
          nextButtonText={articleGameResult.nextButtonText}
          showResult={articleGameResult.showResult}
          isCorrect={articleGameResult.isCorrect}
          startNextQuestion={startNextQuestion}
        />
      </main>

      {/* Debug Panel */}
      <DebugPanel
        articleGameResult={articleGameResult}
        isVisible={isDebugVisible}
        onClose={closeDebugPanel}
      />

      {/* Debug Button (only show in development) */}
      {process.env.NODE_ENV === "development" && <DebugButton />}
    </div>
  );
};

export default ArticleGame;
