import { useMemo } from "react";
import useGameStatistics from "./useGameStatistics";
import { getGameSentences } from "../utils/gameSentencesUtils";

// Article-specific configuration
const ARTICLE_CONFIG = {
  maxAttempts: 2,
  errorModeTrigger: 5, // Switch to error mode after 5 regular questions
  errorModeQuestions: 2, // Show 2 error questions before returning to regular mode
  progressStateKey: "article_game_progress_state",
  answerStateKey: "article_game_answer_state",
  errorStateKey: "article_game_error_state",
};

// Article answer options
const ARTICLE_OPTIONS = ["a/an", "the", "nothing"];

/**
 * Article-specific hook that configures useGameStatistics for article games
 *
 * This hook adds article-specific configuration including:
 * - Article question loading from gameSentencesUtils
 * - Article-specific answer options (a/an, the, nothing)
 * - Article-specific storage keys and configuration
 * - Returns structured state objects directly from useGameStatistics
 */
const useArticleGameStatistics = () => {
  // Load article questions
  const questions = useMemo(() => {
    try {
      return getGameSentences() || [];
    } catch (error) {
      console.error("Error loading game sentences:", error);
      return [];
    }
  }, []);

  const {
    progressState,
    currentQuestionState,
    errorState,
    answerWith,
    startNextQuestion,
    resetGame,
    possibleAnswers,
    isLoading,
    totalQuestions,
  } = useGameStatistics(questions, ARTICLE_OPTIONS, ARTICLE_CONFIG);

  // Get current question from the generic hook
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

  // Enhanced current question state with the actual question object
  const enhancedCurrentQuestionState = useMemo(
    () => ({
      ...currentQuestionState,
      currentQuestion,
    }),
    [currentQuestionState, currentQuestion],
  );

  return {
    // Core functions
    answerWith,
    startNextQuestion,
    resetGame,

    // Structured state objects
    progressState,
    currentQuestionState: enhancedCurrentQuestionState,
    errorState,

    // Additional data
    possibleAnswers,
    isLoading,
    totalQuestions,

    // Utility functions
    skipQuestion: () => {
      // Skip current question by marking it as wrong and moving to next
      if (currentQuestion && !currentQuestionState.isCompleted) {
        // Fill remaining attempts with wrong answers to complete the question
        const remainingAttempts =
          currentQuestionState.maxAttempts -
          currentQuestionState.selectedAnswers.length;
        for (let i = 0; i < remainingAttempts; i++) {
          answerWith("__skip__"); // Use a special marker for skipped answers
        }
        startNextQuestion();
      }
    },

    // Utility functions for debugging and development
    getProgressState: () => progressState,
    getCurrentQuestionState: () => enhancedCurrentQuestionState,
    getErrorState: () => errorState,
  };
};

export default useArticleGameStatistics;
