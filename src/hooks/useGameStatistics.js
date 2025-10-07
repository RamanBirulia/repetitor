import { useState, useEffect, useMemo, useCallback } from "react";

// Shuffle array utility
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const loadStateFromStorage = (key, defaultValue) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.error(`Error loading from localStorage (${key}):`, error);
    return defaultValue;
  }
};

/**
 * Generic game statistics hook that manages game state across three main areas:
 * 1. Progress state - overall game progress and question ordering
 * 2. Current question state - current question and user interaction
 * 3. Error state - tracking and managing incorrect answers
 */
const useGameStatistics = (
  questions = [],
  possibleAnswers = [],
  config = {},
) => {
  // Default configuration
  const {
    maxAttempts = 2,
    errorModeTrigger = 5,
    errorModeQuestions = 2,
    progressStateKey = "game_progress_state",
    answerStateKey = "game_answer_state",
    errorStateKey = "game_error_state",
  } = config;

  // Initialize shuffled questions
  const shuffledQuestionIds = useMemo(() => {
    if (questions.length === 0) return [];
    return shuffleArray(questions.map((q) => q.id));
  }, [questions]);

  // Save state to localStorage
  const saveStateToStorage = useCallback((key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving to localStorage (${key}):`, error);
    }
  }, []);

  // 1. Progress State
  const [progressState, setProgressState] = useState(() =>
    loadStateFromStorage(progressStateKey, {
      shuffledQuestions: shuffledQuestionIds,
      cursor: 0,
      mode: "regular", // 'regular', 'error', 'error_only'
    }),
  );

  // 2. Current Question State
  const [currentQuestionState, setCurrentQuestionState] = useState(() =>
    loadStateFromStorage(answerStateKey, {
      currentQuestion: null,
      selectedAnswers: [],
      isCompleted: false,
      isCorrect: false,
      maxAttempts,
    }),
  );

  // 3. Error State
  const [errorState, setErrorState] = useState(() =>
    loadStateFromStorage(errorStateKey, {
      errorCursor: 0,
      errors: [], // [{id: questionId, correctCount: number}]
    }),
  );

  // + Get current question based on mode and cursor
  const currentQuestion = useMemo(() => {
    if (questions.length === 0) return null;

    if (progressState.mode === "error" || progressState.mode === "error_only") {
      // error mode
      if (errorState.errors.length === 0) return null;
      const errorQuestionId = errorState.errors[errorState.errorCursor].id;
      return questions.find((q) => q.id === errorQuestionId) || null;
    } else {
      // Regular mode
      if (progressState.cursor >= progressState.shuffledQuestions.length)
        return null;
      const questionId = progressState.shuffledQuestions[progressState.cursor];
      return questions.find((q) => q.id === questionId) || null;
    }
  }, [
    questions,
    progressState.mode,
    progressState.cursor,
    progressState.shuffledQuestions,
    errorState.errorCursor,
    errorState.errors,
  ]);

  // Save states to localStorage whenever they change
  useEffect(() => {
    saveStateToStorage(progressStateKey, progressState);
  }, [progressState, progressStateKey, saveStateToStorage]);

  useEffect(() => {
    saveStateToStorage(answerStateKey, currentQuestionState);
  }, [currentQuestionState, answerStateKey, saveStateToStorage]);

  useEffect(() => {
    saveStateToStorage(errorStateKey, errorState);
  }, [errorState, errorStateKey, saveStateToStorage]);

  // Initialize shuffled questions if empty
  useEffect(() => {
    if (
      progressState.shuffledQuestions.length === 0 &&
      shuffledQuestionIds.length > 0
    ) {
      setProgressState((prev) => ({
        ...prev,
        shuffledQuestions: shuffledQuestionIds,
      }));
    }
  }, [shuffledQuestionIds, progressState.shuffledQuestions.length]);

  // Calculate progress percentage
  const progressPercentage = useMemo(() => {
    if (progressState.shuffledQuestions.length === 0) return 0;
    const completed = progressState.cursor - errorState.errors.length;
    return Math.max(
      0,
      (completed / progressState.shuffledQuestions.length) * 100,
    );
  }, [
    progressState.cursor,
    errorState.errors.length,
    progressState.shuffledQuestions.length,
  ]);

  // Check if game is completed
  const isGameCompleted = progressPercentage === 100;

  // Answer with selected option
  const answerWith = useCallback(
    (answer) => {
      if (!currentQuestion || currentQuestionState.isCompleted) return;

      const newSelectedAnswers = [
        ...currentQuestionState.selectedAnswers,
        answer,
      ];
      const isCorrect = answer === currentQuestion.correctAnswer;
      const isCompleted = isCorrect || newSelectedAnswers.length >= maxAttempts;

      setCurrentQuestionState((prev) => ({
        ...prev,
        selectedAnswers: newSelectedAnswers,
        isCompleted,
        isCorrect,
      }));

      // Handle error tracking
      if (isCompleted && !isCorrect) {
        // Add question to errors if not already there
        setErrorState((prev) => {
          const existingError = prev.errors.find(
            (e) => e.id === currentQuestion.id,
          );
          if (!existingError) {
            return {
              ...prev,
              errors: [
                ...prev.errors,
                { id: currentQuestion.id, correctCount: 0 },
              ],
            };
          }
          return prev;
        });
      } else if (
        isCorrect &&
        (progressState.mode === "error" || progressState.mode === "error_only")
      ) {
        // Handle correct answer in error mode
        setErrorState((prev) => {
          const updatedErrors = prev.errors.map((error) =>
            error.id === currentQuestion.id
              ? { ...error, correctCount: error.correctCount + 1 }
              : error,
          );

          // Remove errors that have been answered correctly 3 times
          const filteredErrors = updatedErrors.filter(
            (error) => error.correctCount < 3,
          );

          return {
            ...prev,
            errors: filteredErrors,
            errorCursor: filteredErrors.length > 0 ? prev.errorCursor : 0,
          };
        });
      }
    },
    [
      currentQuestion,
      currentQuestionState.selectedAnswers,
      currentQuestionState.isCompleted,
      maxAttempts,
      progressState.mode,
    ],
  );

  // Start next question
  const startNextQuestion = useCallback(() => {
    if (!currentQuestionState.isCompleted) return;

    const shouldAdvanceCursor =
      currentQuestionState.isCorrect ||
      (!currentQuestionState.isCorrect && progressState.mode === "regular");

    if (progressState.mode === "regular") {
      const newRegularCounter = progressState.regularQuestionCounter + 1;
      const shouldEnterErrorMode =
        newRegularCounter % errorModeTrigger === 0 &&
        errorState.errors.length > 0;

      if (shouldEnterErrorMode) {
        setProgressState((prev) => ({
          ...prev,
          mode: "error",
          regularQuestionCounter: newRegularCounter,
          errorQuestionsShown: 0,
        }));
        setErrorState((prev) => ({ ...prev, errorCursor: 0 }));
      } else {
        setProgressState((prev) => ({
          ...prev,
          cursor: shouldAdvanceCursor ? prev.cursor + 1 : prev.cursor,
          regularQuestionCounter: newRegularCounter,
        }));
      }
    } else if (progressState.mode === "error") {
      const errorQuestionsShown = (progressState.errorQuestionsShown || 0) + 1;

      if (
        errorQuestionsShown >= errorModeQuestions ||
        errorState.errors.length === 0
      ) {
        // Return to regular mode or switch to error_only if no regular questions left
        const shouldGoToErrorOnly =
          progressState.cursor >= progressState.shuffledQuestions.length;

        setProgressState((prev) => ({
          ...prev,
          mode: shouldGoToErrorOnly ? "error_only" : "regular",
          errorQuestionsShown: 0,
        }));
      } else {
        setProgressState((prev) => ({
          ...prev,
          errorQuestionsShown,
        }));
        setErrorState((prev) => ({
          ...prev,
          errorCursor: (prev.errorCursor + 1) % Math.max(1, prev.errors.length),
        }));
      }
    } else if (progressState.mode === "error_only") {
      if (errorState.errors.length > 0) {
        setErrorState((prev) => ({
          ...prev,
          errorCursor: (prev.errorCursor + 1) % prev.errors.length,
        }));
      }
    }

    // Reset current question state
    setCurrentQuestionState((prev) => ({
      ...prev,
      selectedAnswers: [],
      isCompleted: false,
      isCorrect: false,
    }));
  }, [
    currentQuestionState.isCompleted,
    currentQuestionState.isCorrect,
    progressState,
    errorState.errors.length,
    errorModeTrigger,
    errorModeQuestions,
  ]);

  // Reset game
  const resetGame = useCallback(() => {
    const newShuffledQuestions = shuffleArray(questions.map((q) => q.id));

    setProgressState({
      shuffledQuestions: newShuffledQuestions,
      cursor: 0,
      mode: "regular",
      regularQuestionCounter: 0,
      errorQuestionsShown: 0,
    });

    setCurrentQuestionState({
      currentQuestion: null,
      selectedAnswers: [],
      isCompleted: false,
      isCorrect: false,
      maxAttempts,
    });

    setErrorState({
      errorCursor: 0,
      errors: [],
    });

    // Clear localStorage
    try {
      localStorage.removeItem(progressStateKey);
      localStorage.removeItem(answerStateKey);
      localStorage.removeItem(errorStateKey);
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  }, [questions, maxAttempts, progressStateKey, answerStateKey, errorStateKey]);

  return {
    // State objects
    progressState: {
      ...progressState,
      isCompleted: isGameCompleted,
      progressPercentage,
    },
    currentQuestionState,
    errorState,

    // Functions
    answerWith,
    startNextQuestion,
    resetGame,

    // Additional computed values
    possibleAnswers,
    isLoading: questions.length === 0,
    totalQuestions: questions.length,
  };
};

export default useGameStatistics;
