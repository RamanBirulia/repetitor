import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getGameSentences,
  isAnswerCorrect,
  getCorrectAnswerDisplay,
} from "../utils/gameSentencesUtils";

const ArticleGame = () => {
  const navigate = useNavigate();
  const [allSentences, setAllSentences] = useState([]);
  const [currentSentence, setCurrentSentence] = useState(null);

  // Main progress tracking
  const [cursor, setCursor] = useState(1); // Goes from 1 to sentences.count
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);

  // Error tracking system
  const [wrongAnswersMap, setWrongAnswersMap] = useState([]); // [{id: number, successRepetitions: number}]
  const [failureRepetitions, setFailureRepetitions] = useState(0);
  const [regularQuestionCounter, setRegularQuestionCounter] = useState(0);
  const [errorQuestionCounter, setErrorQuestionCounter] = useState(0);
  const [currentMode, setCurrentMode] = useState("regular"); // 'regular' or 'error'
  const [errorQuestions, setErrorQuestions] = useState([]);

  const articleOptions = [
    { value: "a/an", label: "A / AN" },
    { value: "the", label: "THE" },
    { value: "nothing", label: "NO ARTICLE" },
  ];

  useEffect(() => {
    // Initialize game with all sentences in order
    const sentences = getGameSentences();
    setAllSentences(sentences);
    if (sentences.length > 0) {
      setCurrentSentence(sentences[0]);
    }
  }, []);

  const getCurrentQuestion = () => {
    if (currentMode === "error" && errorQuestions.length > 0) {
      const index = errorQuestionCounter % errorQuestions.length;
      return errorQuestions[index];
    } else {
      // Regular mode: use cursor to get current sentence (cursor is 1-based, array is 0-based)
      if (cursor <= allSentences.length && cursor > 0) {
        return allSentences[cursor - 1];
      }
      return null;
    }
  };

  const addToWrongAnswersMap = (sentenceId) => {
    setWrongAnswersMap((prev) => {
      const existing = prev.find((item) => item.id === sentenceId);
      if (existing) {
        // Reset success repetitions to 0 for wrong answer
        return prev.map((item) =>
          item.id === sentenceId ? { ...item, successRepetitions: 0 } : item,
        );
      } else {
        // Add new entry with 0 success repetitions
        return [...prev, { id: sentenceId, successRepetitions: 0 }];
      }
    });
  };

  const updateSuccessRepetitions = (sentenceId) => {
    setWrongAnswersMap((prev) => {
      return prev
        .map((item) => {
          if (item.id === sentenceId) {
            const newSuccessCount = item.successRepetitions + 1;
            // If reached 3 successful repetitions, we'll remove it after this update
            return { ...item, successRepetitions: newSuccessCount };
          }
          return item;
        })
        .filter((item) => {
          // Remove items that have reached 3 successful repetitions
          return !(item.id === sentenceId && item.successRepetitions >= 3);
        });
    });
  };

  const prepareErrorQuestions = () => {
    // Get sentences from wrong answers map
    const errorSentenceIds = wrongAnswersMap.map((item) => item.id);
    const errorSentences = allSentences.filter((sentence) =>
      errorSentenceIds.includes(sentence.id),
    );
    if (errorSentences.length > 0) {
      setErrorQuestions(errorSentences);
      setErrorQuestionCounter(0);
    } else {
      // If no error questions available, stay in regular mode
      setCurrentMode("regular");
    }
  };

  const handleAnswerClick = (answer) => {
    if (attempts >= 2 || showResult) return;

    setSelectedAnswer(answer);
    const sentence = getCurrentQuestion();

    if (!sentence) {
      console.error("No current sentence available");
      return;
    }

    const correct = isAnswerCorrect(sentence, answer);
    setIsCorrect(correct);
    setShowResult(true);
    setAttempts((prev) => prev + 1);

    if (correct) {
      setScore((prev) => prev + (attempts === 0 ? 10 : 5));

      if (currentMode === "error") {
        // Update success repetitions for error question
        updateSuccessRepetitions(sentence.id);
      }
    } else {
      // Wrong answer
      if (currentMode === "regular") {
        // Add to wrong answers map
        addToWrongAnswersMap(sentence.id);
      } else {
        // Error mode wrong answer
        addToWrongAnswersMap(sentence.id); // Reset success repetitions to 0
        setFailureRepetitions((prev) => prev + 1);
      }
    }
  };

  const nextQuestion = () => {
    let shouldAdvanceCursor = false;
    let shouldSwitchMode = false;
    let shouldComplete = false;

    if (currentMode === "regular") {
      const newRegularCounter = regularQuestionCounter + 1;
      setRegularQuestionCounter(newRegularCounter);

      // Check if we completed this regular question successfully
      if (isCorrect) {
        shouldAdvanceCursor = true;
      }

      // Check if it's time for error questions (every 5 regular questions)
      if (newRegularCounter % 5 === 0 && wrongAnswersMap.length > 0) {
        // Switch to error mode
        shouldSwitchMode = true;
      } else {
        // Continue with regular questions - check if game should complete
        const nextCursor = shouldAdvanceCursor ? cursor + 1 : cursor;
        if (nextCursor > allSentences.length && wrongAnswersMap.length === 0) {
          shouldComplete = true;
        }
      }
    } else {
      // Error mode
      const newErrorCounter = errorQuestionCounter + 1;
      setErrorQuestionCounter(newErrorCounter);

      // After 2 error questions, switch back to regular mode
      if (newErrorCounter >= 2) {
        setCurrentMode("regular");
      }
    }

    // Apply state changes
    if (shouldAdvanceCursor) {
      setCursor((prev) => prev + 1);
    }

    if (shouldSwitchMode) {
      setCurrentMode("error");
      prepareErrorQuestions();
    }

    if (shouldComplete) {
      setGameCompleted(true);
      return;
    }

    // Reset question state
    setSelectedAnswer(null);
    setAttempts(0);
    setIsCorrect(null);
    setShowResult(false);
  };

  // Update current sentence when relevant state changes
  useEffect(() => {
    const nextSentence = getCurrentQuestion();
    if (nextSentence && nextSentence.id !== currentSentence?.id) {
      setCurrentSentence(nextSentence);
    }
  }, [
    currentMode,
    cursor,
    errorQuestionCounter,
    errorQuestions,
    allSentences,
    wrongAnswersMap,
  ]);

  const restartGame = () => {
    const sentences = getGameSentences();
    setAllSentences(sentences);
    setCurrentSentence(sentences[0]);
    setCursor(1);
    setSelectedAnswer(null);
    setAttempts(0);
    setIsCorrect(null);
    setShowResult(false);
    setScore(0);
    setGameCompleted(false);
    setWrongAnswersMap([]);
    setFailureRepetitions(0);
    setRegularQuestionCounter(0);
    setErrorQuestionCounter(0);
    setCurrentMode("regular");
    setErrorQuestions([]);
  };

  const navigateToRule = (ruleId) => {
    navigate(`/rules/${ruleId}`);
  };

  const getButtonClass = (option) => {
    let baseClass = "article-button";

    if (!showResult || !currentSentence) {
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

  const getProgressInfo = () => {
    if (currentMode === "error") {
      return {
        current: errorQuestionCounter + 1,
        total: 2,
        type: "Error Review",
      };
    } else {
      return {
        current: cursor,
        total: allSentences.length,
        type: "Main Progress",
      };
    }
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
            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Game Statistics</div>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div>
                    <div className="text-lg font-bold">{cursor - 1}</div>
                    <div className="text-xs text-gray-500">
                      Questions Completed
                    </div>
                  </div>
                  <div>
                    <div className="text-lg font-bold">
                      {wrongAnswersMap.length}
                    </div>
                    <div className="text-xs text-gray-500">
                      Errors Remaining
                    </div>
                  </div>
                  <div>
                    <div className="text-lg font-bold">
                      {failureRepetitions}
                    </div>
                    <div className="text-xs text-gray-500">Total Failures</div>
                  </div>
                </div>
              </div>
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

  const progressInfo = getProgressInfo();

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
                {progressInfo.type}: {progressInfo.current} of{" "}
                {progressInfo.total}
              </div>
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                Score: {score}
              </div>
              {currentMode === "error" && (
                <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold">
                  Review Mode
                </div>
              )}
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
            <span className="text-sm text-gray-600">{progressInfo.type}</span>
            <span className="text-sm text-gray-600">
              {Math.round((progressInfo.current / progressInfo.total) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                currentMode === "error" ? "bg-orange-500" : "bg-blue-600"
              }`}
              style={{
                width: `${(progressInfo.current / progressInfo.total) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Error Status */}
        {(wrongAnswersMap.length > 0 || currentMode === "error") && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-sm text-yellow-800">
              <strong>Errors to Review:</strong> {wrongAnswersMap.length}{" "}
              questions need more practice
            </div>
            <div className="text-xs text-yellow-600 mt-1">
              Error questions appear every 5th question for additional practice
            </div>
            <div className="text-xs text-gray-500 mt-2 space-y-1">
              <div>
                Progress: {regularQuestionCounter} regular questions completed
              </div>
              <div>
                Main cursor position: {cursor} of {allSentences.length}
              </div>
              {currentMode === "error" && (
                <div>Error review: {errorQuestionCounter + 1}/2</div>
              )}
              <div>
                Next error review at:{" "}
                {Math.ceil((regularQuestionCounter + 1) / 5) * 5} questions
              </div>
            </div>
          </div>
        )}

        {/* Game Card */}
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
              <button onClick={nextQuestion} className="btn-primary">
                {currentMode === "error" && errorQuestionCounter >= 1
                  ? "Back to Main Questions →"
                  : cursor >= allSentences.length &&
                      wrongAnswersMap.length === 0
                    ? "Complete Game →"
                    : "Next Question →"}
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
