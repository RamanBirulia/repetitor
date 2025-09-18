import { useState, useEffect, useCallback } from "react";
import { getGameSentences, isAnswerCorrect } from "../utils/gameSentencesUtils";

// LocalStorage keys for persisting game state
const STORAGE_KEY = "article_game_statistics";
const ANSWER_STATE_KEY = "article_game_answer_state";

/**
 * Custom hook for managing article game statistics and answer state persistence
 *
 * Features:
 * - Persists game progress and statistics in localStorage
 * - Stores answer state per question to survive page reloads
 * - Manages game modes (regular questions vs error review)
 * - Handles scoring and wrong answer tracking
 * - Automatic cleanup of old answer states
 */

const articleOptions = [
  { value: "a/an", label: "A / AN" },
  { value: "the", label: "THE" },
  { value: "nothing", label: "NO ARTICLE" },
];

const useArticleGameStatistics = () => {
  // Internal state - not exposed to component
  const [allSentences, setAllSentences] = useState([]);
  const [cursor, setCursor] = useState(1);
  const [score, setScore] = useState(0);
  const [wrongAnswersMap, setWrongAnswersMap] = useState([]);
  const [failureRepetitions, setFailureRepetitions] = useState(0);
  const [regularQuestionCounter, setRegularQuestionCounter] = useState(0);
  const [errorQuestionCounter, setErrorQuestionCounter] = useState(0);
  const [currentMode, setCurrentMode] = useState("regular");
  const [errorQuestions, setErrorQuestions] = useState([]);
  const [gameCompleted, setGameCompleted] = useState(false);

  // Question-specific state
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [failedOptions, setFailedOptions] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Internal helper to get current question
  const getCurrentQuestionInternal = useCallback(() => {
    if (currentMode === "error" && errorQuestions.length > 0) {
      const index = errorQuestionCounter % errorQuestions.length;
      return errorQuestions[index];
    } else {
      if (cursor <= allSentences.length && cursor > 0) {
        return allSentences[cursor - 1];
      }
      return null;
    }
  }, [currentMode, errorQuestions, errorQuestionCounter, cursor, allSentences]);

  // Current question identifier for localStorage
  const getCurrentQuestionId = useCallback(() => {
    const currentQuestion = getCurrentQuestionInternal();
    return currentQuestion ? `${currentMode}_${currentQuestion.id}` : null;
  }, [currentMode, getCurrentQuestionInternal]);

  // Load answer state from localStorage
  const loadAnswerState = useCallback(() => {
    try {
      const questionId = getCurrentQuestionId();
      if (!questionId) return;

      const savedAnswerState = localStorage.getItem(
        `${ANSWER_STATE_KEY}_${questionId}`,
      );
      if (savedAnswerState) {
        const parsedState = JSON.parse(savedAnswerState);
        setSelectedAnswer(parsedState.selectedAnswer || null);
        setAttempts(parsedState.attempts || 0);
        setIsCorrect(parsedState.isCorrect);
        setShowResult(parsedState.showResult || false);
        setFailedOptions(parsedState.failedOptions || []);
      } else {
        // Reset answer state for new question
        setSelectedAnswer(null);
        setAttempts(0);
        setIsCorrect(null);
        setShowResult(false);
        setFailedOptions([]);
      }
    } catch (error) {
      console.error("Error loading answer state:", error);
      // Reset to default state on error
      setSelectedAnswer(null);
      setAttempts(0);
      setIsCorrect(null);
      setShowResult(false);
      setFailedOptions([]);
    }
  }, [getCurrentQuestionId]);

  // Save answer state to localStorage
  const saveAnswerState = useCallback(() => {
    try {
      const questionId = getCurrentQuestionId();
      if (!questionId) return;

      const answerStateToSave = {
        selectedAnswer,
        attempts,
        isCorrect,
        showResult,
        failedOptions,
        questionId,
        timestamp: new Date().toISOString(),
      };

      localStorage.setItem(
        `${ANSWER_STATE_KEY}_${questionId}`,
        JSON.stringify(answerStateToSave),
      );
    } catch (error) {
      console.error("Error saving answer state:", error);
    }
  }, [
    getCurrentQuestionId,
    selectedAnswer,
    attempts,
    isCorrect,
    showResult,
    failedOptions,
  ]);

  // Clear answer state from localStorage for a specific question
  const clearAnswerState = useCallback((questionId) => {
    try {
      localStorage.removeItem(`${ANSWER_STATE_KEY}_${questionId}`);
    } catch (error) {
      console.error("Error clearing answer state:", error);
    }
  }, []);

  // Clean up old answer states (optional: keep only recent ones)
  const cleanupOldAnswerStates = useCallback(() => {
    try {
      const keys = Object.keys(localStorage);
      const answerStateKeys = keys.filter((key) =>
        key.startsWith(ANSWER_STATE_KEY),
      );

      // Keep only the last 100 answer states to prevent localStorage bloat
      if (answerStateKeys.length > 100) {
        const statesWithTimestamp = answerStateKeys
          .map((key) => {
            try {
              const data = JSON.parse(localStorage.getItem(key));
              return { key, timestamp: data.timestamp || 0 };
            } catch {
              return { key, timestamp: 0 };
            }
          })
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Remove oldest states
        statesWithTimestamp.slice(100).forEach(({ key }) => {
          localStorage.removeItem(key);
        });
      }
    } catch (error) {
      console.error("Error cleaning up old answer states:", error);
    }
  }, []);

  // Load statistics from localStorage on mount
  useEffect(() => {
    try {
      const savedStats = localStorage.getItem(STORAGE_KEY);
      if (savedStats) {
        const parsedStats = JSON.parse(savedStats);
        setCursor(parsedStats.cursor || 1);
        setScore(parsedStats.score || 0);
        setWrongAnswersMap(parsedStats.wrongAnswersMap || []);
        setFailureRepetitions(parsedStats.failureRepetitions || 0);
        setRegularQuestionCounter(parsedStats.regularQuestionCounter || 0);
        setErrorQuestionCounter(parsedStats.errorQuestionCounter || 0);
        setCurrentMode(parsedStats.currentMode || "regular");
        setErrorQuestions(parsedStats.errorQuestions || []);
        setGameCompleted(parsedStats.gameCompleted || false);
      }
    } catch (error) {
      console.error("Error loading game statistics:", error);
    }

    // Initialize sentences
    const sentences = getGameSentences();
    setAllSentences(sentences);
    setIsInitialized(true);

    // Clean up old answer states periodically
    cleanupOldAnswerStates();
  }, [cleanupOldAnswerStates]);

  // Load answer state when question changes
  useEffect(() => {
    if (isInitialized && allSentences.length > 0) {
      loadAnswerState();
    }
  }, [
    isInitialized,
    cursor,
    currentMode,
    errorQuestionCounter,
    allSentences.length,
    loadAnswerState,
  ]);

  // Save answer state when it changes
  useEffect(() => {
    if (isInitialized) {
      saveAnswerState();
    }
  }, [
    isInitialized,
    selectedAnswer,
    attempts,
    isCorrect,
    showResult,
    failedOptions,
    saveAnswerState,
  ]);

  // Save statistics to localStorage whenever they change
  const saveStatistics = useCallback(() => {
    try {
      const statsToSave = {
        cursor,
        score,
        wrongAnswersMap,
        failureRepetitions,
        regularQuestionCounter,
        errorQuestionCounter,
        currentMode,
        errorQuestions,
        gameCompleted,
        lastPlayedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(statsToSave));
    } catch (error) {
      console.error("Error saving game statistics:", error);
    }
  }, [
    cursor,
    score,
    wrongAnswersMap,
    failureRepetitions,
    regularQuestionCounter,
    errorQuestionCounter,
    currentMode,
    errorQuestions,
    gameCompleted,
  ]);

  useEffect(() => {
    if (isInitialized) {
      saveStatistics();
    }
  }, [saveStatistics, isInitialized]);

  // Get current question based on mode and counters
  const getCurrentQuestion = useCallback(() => {
    return getCurrentQuestionInternal();
  }, [getCurrentQuestionInternal]);

  // Helper functions for wrong answers management
  const addToWrongAnswersMap = useCallback((sentenceId) => {
    setWrongAnswersMap((prev) => {
      const existing = prev.find((item) => item.id === sentenceId);
      if (existing) {
        return prev.map((item) =>
          item.id === sentenceId ? { ...item, successRepetitions: 0 } : item,
        );
      } else {
        return [...prev, { id: sentenceId, successRepetitions: 0 }];
      }
    });
  }, []);

  const updateSuccessRepetitions = useCallback((sentenceId) => {
    setWrongAnswersMap((prev) => {
      return prev
        .map((item) => {
          if (item.id === sentenceId) {
            const newSuccessCount = item.successRepetitions + 1;
            return { ...item, successRepetitions: newSuccessCount };
          }
          return item;
        })
        .filter((item) => {
          return !(item.id === sentenceId && item.successRepetitions >= 3);
        });
    });
  }, []);

  const prepareErrorQuestions = useCallback(() => {
    const errorSentenceIds = wrongAnswersMap.map((item) => item.id);
    const errorSentences = allSentences.filter((sentence) =>
      errorSentenceIds.includes(sentence.id),
    );
    if (errorSentences.length > 0) {
      setErrorQuestions(errorSentences);
      setErrorQuestionCounter(0);
    } else {
      setCurrentMode("regular");
    }
  }, [wrongAnswersMap, allSentences]);

  // Check if user can retry
  const canRetry = useCallback(() => {
    const availableOptions = articleOptions.filter(
      (opt) => !failedOptions.includes(opt.value),
    );
    return !isCorrect && attempts === 1 && availableOptions.length > 0;
  }, [isCorrect, attempts, failedOptions]);

  // Calculate progress information
  const getProgressInfo = useCallback(() => {
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
  }, [currentMode, errorQuestionCounter, cursor, allSentences.length]);

  // Get button class for styling
  const getButtonClass = useCallback(
    (option) => {
      let baseClass = "article-button";

      if (failedOptions.includes(option.value)) {
        return `${baseClass} failed`;
      }

      if (!showResult || canRetry()) {
        return baseClass;
      }

      const currentQuestion = getCurrentQuestion();
      if (currentQuestion && isAnswerCorrect(currentQuestion, option.value)) {
        return `${baseClass} correct`;
      }

      if (
        option.value === selectedAnswer &&
        currentQuestion &&
        option.value !== currentQuestion.correctAnswer
      ) {
        return `${baseClass} incorrect`;
      }

      return baseClass;
    },
    [failedOptions, showResult, canRetry, getCurrentQuestion, selectedAnswer],
  );

  // Reset question state (used internally when moving to next question)
  const resetQuestionState = useCallback(() => {
    // Clear the answer state from localStorage for the current question
    const questionId = getCurrentQuestionId();
    if (questionId) {
      clearAnswerState(questionId);
    }

    setSelectedAnswer(null);
    setAttempts(0);
    setIsCorrect(null);
    setShowResult(false);
    setFailedOptions([]);
  }, [getCurrentQuestionId, clearAnswerState]);

  // PUBLIC API METHODS

  // Answer with a specific option
  const answerWith = useCallback(
    (answer) => {
      if (attempts >= 2 || showResult || failedOptions.includes(answer)) return;

      const currentQuestion = getCurrentQuestion();
      if (!currentQuestion) {
        console.error("No current question available");
        return;
      }

      setSelectedAnswer(answer);
      const correct = isAnswerCorrect(currentQuestion, answer);
      setIsCorrect(correct);
      if (attempts > 0 || correct) {
        setShowResult(true);
      }
      setAttempts((prev) => prev + 1);

      if (correct) {
        setScore((prev) => prev + (attempts === 0 ? 10 : 5));
        if (currentMode === "error") {
          updateSuccessRepetitions(currentQuestion.id);
        }
      } else {
        setFailedOptions((prev) => [...prev, answer]);
        const newFailedOptions = [...failedOptions, answer];
        if (attempts >= 1 || newFailedOptions.length >= 2) {
          if (currentMode === "regular") {
            addToWrongAnswersMap(currentQuestion.id);
          } else {
            addToWrongAnswersMap(currentQuestion.id);
            setFailureRepetitions((prev) => prev + 1);
          }
        }
      }
    },
    [
      attempts,
      showResult,
      failedOptions,
      getCurrentQuestion,
      currentMode,
      updateSuccessRepetitions,
      addToWrongAnswersMap,
    ],
  );

  // Skip current question (adds to wrong answers)
  const skipQuestion = useCallback(() => {
    const currentQuestion = getCurrentQuestion();
    if (currentQuestion) {
      addToWrongAnswersMap(currentQuestion.id);
      // Clear answer state when skipping
      const questionId = getCurrentQuestionId();
      if (questionId) {
        clearAnswerState(questionId);
      }
    }
  }, [
    getCurrentQuestion,
    addToWrongAnswersMap,
    getCurrentQuestionId,
    clearAnswerState,
  ]);

  // Move to next question
  const startNextQuestion = useCallback(() => {
    let shouldAdvanceCursor = false;
    let shouldSwitchMode = false;
    let shouldComplete = false;

    if (currentMode === "regular") {
      const newRegularCounter = regularQuestionCounter + 1;
      setRegularQuestionCounter(newRegularCounter);

      if (isCorrect) {
        shouldAdvanceCursor = true;
      }

      if (newRegularCounter % 5 === 0 && wrongAnswersMap.length > 0) {
        shouldSwitchMode = true;
      } else {
        const nextCursor = shouldAdvanceCursor ? cursor + 1 : cursor;
        if (nextCursor > allSentences.length && wrongAnswersMap.length === 0) {
          shouldComplete = true;
        }
      }
    } else {
      const newErrorCounter = errorQuestionCounter + 1;
      setErrorQuestionCounter(newErrorCounter);

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
      resetQuestionState();
      return;
    }

    resetQuestionState();
  }, [
    currentMode,
    regularQuestionCounter,
    isCorrect,
    cursor,
    wrongAnswersMap.length,
    allSentences.length,
    errorQuestionCounter,
    prepareErrorQuestions,
    resetQuestionState,
  ]);

  // Reset entire game
  const resetGame = useCallback(() => {
    // Clear all answer states from localStorage
    try {
      const keys = Object.keys(localStorage);
      const answerStateKeys = keys.filter((key) =>
        key.startsWith(ANSWER_STATE_KEY),
      );
      answerStateKeys.forEach((key) => localStorage.removeItem(key));
    } catch (error) {
      console.error("Error clearing answer states:", error);
    }

    setCursor(1);
    setScore(0);
    setWrongAnswersMap([]);
    setFailureRepetitions(0);
    setRegularQuestionCounter(0);
    setErrorQuestionCounter(0);
    setCurrentMode("regular");
    setErrorQuestions([]);
    setGameCompleted(false);
    resetQuestionState();
  }, [resetQuestionState]);

  // Clear localStorage
  const clearStoredStatistics = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);

      // Clear all answer states
      const keys = Object.keys(localStorage);
      const answerStateKeys = keys.filter((key) =>
        key.startsWith(ANSWER_STATE_KEY),
      );
      answerStateKeys.forEach((key) => localStorage.removeItem(key));

      resetGame();
    } catch (error) {
      console.error("Error clearing stored statistics:", error);
    }
  }, [resetGame]);

  // Build comprehensive result object for component consumption
  const articleGameResult = {
    // Game state
    isLoading: !isInitialized || allSentences.length === 0,
    isCompleted: gameCompleted,
    currentQuestion: getCurrentQuestion(),

    // Progress information
    progress: getProgressInfo(),
    score,
    cursor,

    // Current question state
    selectedAnswer,
    attempts,
    isCorrect,
    showResult,
    failedOptions,
    canRetry: canRetry(),

    // Question options with styling
    articleOptions: articleOptions.map((option) => ({
      ...option,
      className: getButtonClass(option),
      disabled:
        failedOptions.includes(option.value) ||
        (showResult && isCorrect && !canRetry()) ||
        (attempts >= 2 && !canRetry()),
    })),

    // Error tracking
    wrongAnswersMap,
    currentMode,
    errorQuestions: errorQuestions.length,
    failureRepetitions,

    // UI helpers
    shouldShowCorrectAnswer: !canRetry() || isCorrect,
    progressPercentage: Math.round(
      (getProgressInfo().current / getProgressInfo().total) * 100,
    ),
    canProceed: (attempts >= 2 && !canRetry()) || isCorrect,

    // Messages
    nextButtonText:
      currentMode === "error" && errorQuestionCounter >= 1
        ? "Back to Main Questions →"
        : cursor >= allSentences.length && wrongAnswersMap.length === 0
          ? "Complete Game →"
          : "Next Question →",

    // Statistics for completion screen
    completionStats: {
      questionsCompleted: cursor - 1,
      errorsRemaining: wrongAnswersMap.length,
      totalFailures: failureRepetitions,
      finalScore: score,
    },

    // Debug information (useful for development)
    debugInfo: {
      currentQuestionId: getCurrentQuestionId(),
      hasStoredAnswerState:
        !!getCurrentQuestionId() &&
        !!localStorage.getItem(`${ANSWER_STATE_KEY}_${getCurrentQuestionId()}`),
      answerStateCount: Object.keys(localStorage).filter((key) =>
        key.startsWith(ANSWER_STATE_KEY),
      ).length,
    },
  };

  // Additional utility methods for debugging and advanced use cases
  const getStoredAnswerStates = useCallback(() => {
    try {
      const keys = Object.keys(localStorage);
      const answerStateKeys = keys.filter((key) =>
        key.startsWith(ANSWER_STATE_KEY),
      );

      return answerStateKeys.map((key) => {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          return { key, ...data };
        } catch {
          return { key, error: "Failed to parse" };
        }
      });
    } catch (error) {
      console.error("Error getting stored answer states:", error);
      return [];
    }
  }, []);

  const clearAnswerStateForCurrentQuestion = useCallback(() => {
    const questionId = getCurrentQuestionId();
    if (questionId) {
      clearAnswerState(questionId);
      // Reset current answer state
      setSelectedAnswer(null);
      setAttempts(0);
      setIsCorrect(null);
      setShowResult(false);
      setFailedOptions([]);
    }
  }, [getCurrentQuestionId, clearAnswerState]);

  return {
    // Public API - primary methods for components
    answerWith,
    startNextQuestion,
    skipQuestion,
    resetGame,
    clearStoredStatistics,

    // Additional utility methods
    clearAnswerStateForCurrentQuestion,
    getStoredAnswerStates,

    // Result object for component consumption
    articleGameResult,
  };
};

export default useArticleGameStatistics;
