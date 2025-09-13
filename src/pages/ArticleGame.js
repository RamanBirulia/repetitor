import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getRandomSentences,
  isAnswerCorrect,
  getCorrectAnswerDisplay,
} from "../utils/gameSentencesUtils";
import {
  getCorrectAnswerDisplayTime,
  getIncorrectAnswerDisplayTime,
  shouldPauseOnIncorrect,
  isAutoAdvanceEnabled,
} from "../utils/contentUtils";

const ArticleGame = () => {
  const navigate = useNavigate();
  const [currentSentence, setCurrentSentence] = useState(null);
  const [sentences, setSentences] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);

  const articleOptions = [
    { value: "a/an", label: "A / AN" },
    { value: "the", label: "THE" },
    { value: "nothing", label: "NO ARTICLE" },
  ];

  useEffect(() => {
    // Initialize game with random sentences
    const gameSentences = getRandomSentences(10);
    setSentences(gameSentences);
    setCurrentSentence(gameSentences[0]);
  }, []);

  const handleAnswerClick = (answer) => {
    if (attempts >= 2 || showResult) return;

    setSelectedAnswer(answer);
    // Check if answer is correct using utility function
    const correct = isAnswerCorrect(currentSentence, answer);
    setIsCorrect(correct);
    setShowResult(true);
    setAttempts((prev) => prev + 1);

    if (correct) {
      setScore((prev) => prev + (attempts === 0 ? 10 : 5)); // More points for first attempt
    }

    // For correct answers, show result longer to reinforce learning
    // For incorrect answers, don't auto-advance to give time for learning
    if (correct && isAutoAdvanceEnabled()) {
      setTimeout(() => {
        nextSentence();
      }, getCorrectAnswerDisplayTime());
    } else if (attempts >= 1 && shouldPauseOnIncorrect()) {
      // Don't auto-advance on final incorrect attempt - let user control
      // They can use the Next button when ready
    } else {
      // Reset for second attempt after showing feedback
      setTimeout(() => {
        setShowResult(false);
        setSelectedAnswer(null);
      }, getIncorrectAnswerDisplayTime());
    }
  };

  const nextSentence = () => {
    const nextIndex = currentIndex + 1;

    if (nextIndex >= sentences.length) {
      setGameCompleted(true);
      return;
    }

    setCurrentIndex(nextIndex);
    setCurrentSentence(sentences[nextIndex]);
    setSelectedAnswer(null);
    setAttempts(0);
    setIsCorrect(null);
    setShowResult(false);
  };

  const restartGame = () => {
    const newSentences = getRandomSentences(10);
    setSentences(newSentences);
    setCurrentSentence(newSentences[0]);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setAttempts(0);
    setIsCorrect(null);
    setShowResult(false);
    setScore(0);
    setGameCompleted(false);
  };

  const navigateToRule = (ruleId) => {
    navigate(`/rules/${ruleId}`);
  };

  const getButtonClass = (option) => {
    let baseClass = "article-button";

    if (!showResult) {
      return baseClass;
    }

    if (isAnswerCorrect(currentSentence, option.value)) {
      return `${baseClass} correct`;
    }

    if (
      option.value === selectedAnswer &&
      option.value !== currentSentence.correctAnswer
    ) {
      return `${baseClass} incorrect`;
    }

    return baseClass;
  };

  if (gameCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-2xl mx-auto p-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center animate-bounce-in">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Congratulations!
            </h2>
            <p className="text-xl text-gray-600 mb-6">
              You completed the game!
            </p>
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6 mb-8">
              <div className="text-4xl font-bold mb-2">{score}</div>
              <div className="text-lg">Total Points</div>
            </div>
            <div className="space-x-4">
              <button onClick={restartGame} className="btn-primary">
                Play Again
              </button>
              <button onClick={() => navigate("/")} className="btn-secondary">
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentSentence) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate("/")}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back to Home
            </button>

            <div className="flex items-center space-x-6">
              <div className="text-sm text-gray-600">
                Question {currentIndex + 1} of {sentences.length}
              </div>
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                Score: {score}
              </div>
              <button
                onClick={() => navigateToRule(currentSentence.ruleId)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-full transition-colors"
                title="View grammar rules"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Progress</span>
            <span className="text-sm text-gray-600">
              {Math.round(((currentIndex + 1) / sentences.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentIndex + 1) / sentences.length) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Game Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 animate-slide-up">
          {/* Sentence */}
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-medium text-gray-900 leading-relaxed">
              {currentSentence.sentence.split("___").map((part, index) => (
                <span key={index}>
                  {part}
                  {index < currentSentence.sentence.split("___").length - 1 && (
                    <span className="inline-block mx-2 px-4 py-1 bg-yellow-100 border-2 border-yellow-300 rounded-lg text-yellow-800 font-semibold">
                      ___
                    </span>
                  )}
                </span>
              ))}
            </h2>
          </div>

          {/* Answer Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {articleOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleAnswerClick(option.value)}
                disabled={attempts >= 2 || showResult}
                className={getButtonClass(option)}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Result Message */}
          {showResult && (
            <div
              className={`text-center p-6 rounded-lg animate-fade-in ${
                isCorrect
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              <p
                className={`text-base mb-3 ${
                  isCorrect ? "text-green-700" : "text-red-700"
                }`}
              >
                Correct answer:{" "}
                <strong>
                  {getCorrectAnswerDisplay(currentSentence.correctAnswer)}
                </strong>
              </p>
              <p
                className={`text-base leading-relaxed ${
                  isCorrect ? "text-green-600" : "text-red-600"
                }`}
              >
                {currentSentence.explanation}
              </p>
              {!isCorrect && attempts === 0 && (
                <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                  <div className="flex items-start">
                    <div className="text-2xl mr-3">💡</div>
                    <div>
                      <h4 className="text-blue-800 font-semibold mb-1">
                        Take your time!
                      </h4>
                      <p className="text-blue-700 text-sm">
                        Read the explanation above carefully, then try again.
                        You have one more chance to get it right.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {!isCorrect && attempts >= 1 && (
                <div className="mt-3 text-center">
                  <button
                    onClick={() => navigate(`/rules/${currentSentence.ruleId}`)}
                    className="text-blue-600 hover:text-blue-800 text-sm underline"
                  >
                    📖 Study this rule in detail →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Attempts Indicator */}
          <div className="flex justify-center space-x-2 mt-6">
            {[1, 2].map((attempt) => (
              <div
                key={attempt}
                className={`w-3 h-3 rounded-full ${
                  attempts >= attempt
                    ? (attempt === 1 && isCorrect) || attempt === 2
                      ? "bg-blue-500"
                      : "bg-red-500"
                    : "bg-gray-300"
                }`}
              ></div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button onClick={() => navigate("/rules")} className="btn-secondary">
            📖 View All Rules
          </button>

          <div className="flex justify-between items-center">
            <div></div>

            {attempts >= 2 || isCorrect ? (
              <button onClick={nextSentence} className="btn-primary">
                Next Question →
              </button>
            ) : showResult && !isCorrect && attempts === 0 ? (
              <div className="text-blue-600 text-sm flex items-center">
                <span className="text-xl mr-2">🤔</span>
                Read the explanation, then try again
              </div>
            ) : !showResult ? (
              <div className="text-gray-500 flex items-center">
                <span className="text-xl mr-2">👆</span>
                Select an answer to continue
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ArticleGame;
