import { renderHook, act } from "@testing-library/react";
import useArticleGameStatistics from "../useArticleGameStatistics";
import * as gameSentencesUtils from "../../utils/gameSentencesUtils";

// Mock the utils
jest.mock("../../utils/gameSentencesUtils");

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(global, "localStorage", {
  value: localStorageMock,
  writable: true,
});

// Mock data
const mockSentences = [
  {
    id: 1,
    sentence: "I need ___ apple.",
    correctAnswer: "a/an",
    ruleId: 1,
    explanation: "Use a/an for singular countable nouns.",
  },
  {
    id: 2,
    sentence: "___ sun is bright.",
    correctAnswer: "the",
    ruleId: 2,
    explanation: "Use the for unique objects.",
  },
  {
    id: 3,
    sentence: "I like ___ music.",
    correctAnswer: "nothing",
    ruleId: 3,
    explanation: "No article for uncountable nouns in general.",
  },
];

describe("useArticleGameStatistics", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    gameSentencesUtils.getGameSentences.mockReturnValue(mockSentences);
  });

  describe("Initialization", () => {
    test("should initialize with article-specific configuration", () => {
      const { result } = renderHook(() => useArticleGameStatistics());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.totalQuestions).toBe(3);
      expect(result.current.possibleAnswers).toEqual([
        "a/an",
        "the",
        "nothing",
      ]);
    });

    test("should load questions from gameSentencesUtils", () => {
      renderHook(() => useArticleGameStatistics());

      expect(gameSentencesUtils.getGameSentences).toHaveBeenCalled();
    });

    test("should handle empty questions gracefully", () => {
      gameSentencesUtils.getGameSentences.mockReturnValue([]);

      const { result } = renderHook(() => useArticleGameStatistics());

      expect(result.current.totalQuestions).toBe(0);
      expect(result.current.currentQuestionState.currentQuestion).toBe(null);
    });
  });

  describe("State Structure", () => {
    test("should provide structured state objects", () => {
      const { result } = renderHook(() => useArticleGameStatistics());

      expect(result.current.progressState).toHaveProperty("cursor");
      expect(result.current.progressState).toHaveProperty("mode");
      expect(result.current.progressState).toHaveProperty("shuffledQuestions");
      expect(result.current.progressState).toHaveProperty("progressPercentage");
      expect(result.current.progressState).toHaveProperty("isCompleted");

      expect(result.current.currentQuestionState).toHaveProperty(
        "currentQuestion",
      );
      expect(result.current.currentQuestionState).toHaveProperty(
        "selectedAnswers",
      );
      expect(result.current.currentQuestionState).toHaveProperty("isCompleted");
      expect(result.current.currentQuestionState).toHaveProperty("isCorrect");

      expect(result.current.errorState).toHaveProperty("errors");
      expect(result.current.errorState).toHaveProperty("errorCursor");
    });

    test("should provide current question", () => {
      const { result } = renderHook(() => useArticleGameStatistics());

      expect(result.current.currentQuestionState.currentQuestion).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          sentence: expect.any(String),
          correctAnswer: expect.any(String),
          ruleId: expect.any(Number),
          explanation: expect.any(String),
        }),
      );
    });
  });

  describe("Answer Handling", () => {
    test("should handle correct answer", () => {
      const { result } = renderHook(() => useArticleGameStatistics());

      act(() => {
        result.current.answerWith("a/an");
      });

      expect(result.current.currentQuestionState.isCorrect).toBe(true);
      expect(result.current.currentQuestionState.isCompleted).toBe(true);
      expect(result.current.currentQuestionState.selectedAnswers).toEqual([
        "a/an",
      ]);
    });

    test("should handle incorrect answer", () => {
      const { result } = renderHook(() => useArticleGameStatistics());

      act(() => {
        result.current.answerWith("the");
      });

      expect(result.current.currentQuestionState.isCorrect).toBe(false);
      expect(result.current.currentQuestionState.isCompleted).toBe(false);
      expect(result.current.currentQuestionState.selectedAnswers).toEqual([
        "the",
      ]);
    });

    test("should allow retry after wrong answer", () => {
      const { result } = renderHook(() => useArticleGameStatistics());

      // First wrong answer
      act(() => {
        result.current.answerWith("the");
      });

      expect(result.current.currentQuestionState.isCompleted).toBe(false);

      // Correct answer on retry
      act(() => {
        result.current.answerWith("a/an");
      });

      expect(result.current.currentQuestionState.isCorrect).toBe(true);
      expect(result.current.currentQuestionState.isCompleted).toBe(true);
      expect(result.current.currentQuestionState.selectedAnswers).toEqual([
        "the",
        "a/an",
      ]);
    });
  });

  describe("Question Progression", () => {
    test("should advance to next question after correct answer", () => {
      const { result } = renderHook(() => useArticleGameStatistics());

      const initialQuestion =
        result.current.currentQuestionState.currentQuestion;

      act(() => {
        result.current.answerWith("a/an");
        result.current.startNextQuestion();
      });

      expect(result.current.progressState.cursor).toBe(1);
      expect(result.current.currentQuestionState.currentQuestion).not.toEqual(
        initialQuestion,
      );
      expect(result.current.currentQuestionState.selectedAnswers).toHaveLength(
        0,
      );
      expect(result.current.currentQuestionState.isCompleted).toBe(false);
    });

    test("should add wrong answers to error state", () => {
      const { result } = renderHook(() => useArticleGameStatistics());

      act(() => {
        result.current.answerWith("the");
        result.current.answerWith("nothing");
      });

      expect(result.current.currentQuestionState.isCompleted).toBe(true);
      expect(result.current.errorState.errors).toHaveLength(1);
      expect(result.current.errorState.errors[0]).toEqual({
        id: 1,
        correctCount: 0,
      });
    });
  });

  describe("Game Completion", () => {
    test("should detect game completion", () => {
      const { result } = renderHook(() => useArticleGameStatistics());

      // Answer all questions correctly
      mockSentences.forEach((sentence, index) => {
        act(() => {
          result.current.answerWith(sentence.correctAnswer);
          if (index < mockSentences.length - 1) {
            result.current.startNextQuestion();
          }
        });
      });

      expect(result.current.progressState.isCompleted).toBe(true);
    });
  });

  describe("Game Reset", () => {
    test("should reset all state", () => {
      const { result } = renderHook(() => useArticleGameStatistics());

      // Make some progress
      act(() => {
        result.current.answerWith("the");
        result.current.startNextQuestion();
      });

      // Reset
      act(() => {
        result.current.resetGame();
      });

      expect(result.current.progressState.cursor).toBe(0);
      expect(result.current.progressState.mode).toBe("regular");
      expect(result.current.errorState.errors).toHaveLength(0);
      expect(result.current.currentQuestionState.selectedAnswers).toHaveLength(
        0,
      );
      expect(result.current.currentQuestionState.isCompleted).toBe(false);
    });

    test("should clear localStorage on reset", () => {
      const { result } = renderHook(() => useArticleGameStatistics());

      act(() => {
        result.current.resetGame();
      });

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        "article_game_progress_state",
      );
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        "article_game_answer_state",
      );
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        "article_game_error_state",
      );
    });
  });

  describe("Skip Question", () => {
    test("should skip current question", () => {
      const { result } = renderHook(() => useArticleGameStatistics());

      const initialQuestion =
        result.current.currentQuestionState.currentQuestion;

      act(() => {
        result.current.skipQuestion();
      });

      // After skip, should have moved to next question
      expect(result.current.currentQuestionState.currentQuestion).not.toEqual(
        initialQuestion,
      );
      expect(result.current.progressState.cursor).toBe(1);
    });
  });

  describe("Error Handling", () => {
    test("should handle localStorage errors gracefully", () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error("Storage error");
      });

      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      renderHook(() => useArticleGameStatistics());

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    test("should handle getGameSentences errors", () => {
      gameSentencesUtils.getGameSentences.mockImplementation(() => {
        throw new Error("Failed to load sentences");
      });

      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const { result } = renderHook(() => useArticleGameStatistics());

      expect(result.current.totalQuestions).toBe(0);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error loading game sentences:",
        expect.any(Error),
      );
      consoleSpy.mockRestore();
    });
  });

  describe("Debug Utilities", () => {
    test("should provide debug state getters", () => {
      const { result } = renderHook(() => useArticleGameStatistics());

      expect(typeof result.current.getProgressState).toBe("function");
      expect(typeof result.current.getCurrentQuestionState).toBe("function");
      expect(typeof result.current.getErrorState).toBe("function");

      const progressState = result.current.getProgressState();
      expect(progressState).toEqual(result.current.progressState);
    });
  });
});
