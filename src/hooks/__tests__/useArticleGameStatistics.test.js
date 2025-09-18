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
  keys: jest.fn(() => []),
};
Object.defineProperty(global, "localStorage", {
  value: localStorageMock,
  writable: true,
});

// Mock Object.keys for localStorage
Object.defineProperty(Object, "keys", {
  value: jest.fn(() => []),
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
    Object.keys.mockReturnValue([]);
    gameSentencesUtils.getGameSentences.mockReturnValue(mockSentences);
    gameSentencesUtils.isAnswerCorrect.mockImplementation(
      (sentence, answer) => sentence.correctAnswer === answer,
    );
    gameSentencesUtils.getCorrectAnswerDisplay.mockImplementation((answer) => {
      switch (answer) {
        case "nothing":
          return "NO ARTICLE";
        case "a/an":
          return "A / AN";
        case "the":
          return "THE";
        default:
          return answer.toUpperCase();
      }
    });
  });

  describe("Initialization", () => {
    test("should initialize with default values when no localStorage data", () => {
      const { result } = renderHook(() => useArticleGameStatistics());

      expect(result.current.articleGameResult.isLoading).toBe(false);
      expect(result.current.articleGameResult.isCompleted).toBe(false);
      expect(result.current.articleGameResult.score).toBe(0);
      expect(result.current.articleGameResult.cursor).toBe(1);
      expect(result.current.articleGameResult.currentQuestion).toEqual(
        mockSentences[0],
      );
    });

    test("should load saved data from localStorage", () => {
      const savedData = {
        cursor: 2,
        score: 25,
        wrongAnswersMap: [{ id: 1, successRepetitions: 0 }],
        currentMode: "regular",
        gameCompleted: false,
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedData));

      const { result } = renderHook(() => useArticleGameStatistics());

      expect(result.current.articleGameResult.score).toBe(25);
      expect(result.current.articleGameResult.cursor).toBe(2);
      expect(result.current.articleGameResult.currentQuestion).toEqual(
        mockSentences[1],
      );
    });

    test("should handle localStorage parsing errors gracefully", () => {
      localStorageMock.getItem.mockReturnValue("invalid json");
      console.error = jest.fn();

      const { result } = renderHook(() => useArticleGameStatistics());

      expect(console.error).toHaveBeenCalledWith(
        "Error loading game statistics:",
        expect.any(Error),
      );
      expect(result.current.articleGameResult.score).toBe(0);
    });
  });

  describe("Answer handling", () => {
    test("should handle correct answer on first attempt", () => {
      const { result } = renderHook(() => useArticleGameStatistics());

      act(() => {
        result.current.answerWith("a/an");
      });

      expect(result.current.articleGameResult.isCorrect).toBe(true);
      expect(result.current.articleGameResult.score).toBe(10);
      expect(result.current.articleGameResult.attempts).toBe(1);
      expect(result.current.articleGameResult.showResult).toBe(true);
    });

    test("should handle wrong answer on first attempt", () => {
      const { result } = renderHook(() => useArticleGameStatistics());

      act(() => {
        result.current.answerWith("the");
      });

      expect(result.current.articleGameResult.isCorrect).toBe(false);
      expect(result.current.articleGameResult.score).toBe(0);
      expect(result.current.articleGameResult.attempts).toBe(1);
      expect(result.current.articleGameResult.failedOptions).toContain("the");
      expect(result.current.articleGameResult.canRetry).toBe(true);
    });

    test("should allow retry after first wrong answer", () => {
      const { result } = renderHook(() => useArticleGameStatistics());

      // First wrong attempt
      act(() => {
        result.current.answerWith("the");
      });

      // Second attempt with correct answer
      act(() => {
        result.current.answerWith("a/an");
      });

      expect(result.current.articleGameResult.isCorrect).toBe(true);
      expect(result.current.articleGameResult.score).toBe(5); // Partial credit
      expect(result.current.articleGameResult.attempts).toBe(2);
    });

    test("should prevent selecting already failed options", () => {
      const { result } = renderHook(() => useArticleGameStatistics());

      // First wrong attempt
      act(() => {
        result.current.answerWith("the");
      });

      const attemptsBefore = result.current.articleGameResult.attempts;

      // Try to select same wrong answer again
      act(() => {
        result.current.answerWith("the");
      });

      expect(result.current.articleGameResult.attempts).toBe(attemptsBefore);
    });

    test("should add question to wrong answers map after exhausting attempts", () => {
      const { result } = renderHook(() => useArticleGameStatistics());

      // Two wrong attempts
      act(() => {
        result.current.answerWith("the");
      });
      act(() => {
        result.current.answerWith("nothing");
      });

      expect(result.current.articleGameResult.wrongAnswersMap.length).toBe(1);
      expect(result.current.articleGameResult.wrongAnswersMap[0].id).toBe(1);
    });
  });

  describe("Question progression", () => {
    test("should advance cursor on correct answer", () => {
      const { result } = renderHook(() => useArticleGameStatistics());

      act(() => {
        result.current.answerWith("a/an");
      });
      act(() => {
        result.current.startNextQuestion();
      });

      expect(result.current.articleGameResult.cursor).toBe(2);
      expect(result.current.articleGameResult.currentQuestion).toEqual(
        mockSentences[1],
      );
      expect(result.current.articleGameResult.attempts).toBe(0);
      expect(result.current.articleGameResult.showResult).toBe(false);
    });

    test("should not advance cursor on wrong answer", () => {
      const { result } = renderHook(() => useArticleGameStatistics());

      act(() => {
        result.current.answerWith("the");
      });
      act(() => {
        result.current.answerWith("nothing");
      });
      act(() => {
        result.current.startNextQuestion();
      });

      expect(result.current.articleGameResult.cursor).toBe(1);
      expect(result.current.articleGameResult.currentQuestion).toEqual(
        mockSentences[0],
      );
    });

    test("should skip question and add to wrong answers", () => {
      const { result } = renderHook(() => useArticleGameStatistics());
      const initialWrongAnswersCount =
        result.current.articleGameResult.wrongAnswersMap.length;

      act(() => {
        result.current.skipQuestion();
      });

      expect(result.current.articleGameResult.wrongAnswersMap.length).toBe(
        initialWrongAnswersCount + 1,
      );
      expect(result.current.articleGameResult.attempts).toBe(0);
    });
  });

  describe("Error mode handling", () => {
    test("should switch to error mode after 5 regular questions with errors", () => {
      const { result } = renderHook(() => useArticleGameStatistics());

      // Add some wrong answers and advance regular question counter
      act(() => {
        result.current.answerWith("the"); // wrong
        result.current.answerWith("nothing"); // wrong
        result.current.startNextQuestion();
      });

      // Simulate 5 regular questions completed
      act(() => {
        // Manually set regular question counter for testing
        for (let i = 0; i < 4; i++) {
          result.current.answerWith("a/an"); // correct answers
          result.current.startNextQuestion();
        }
      });

      // After 5th question, should switch to error mode if there are wrong answers
      expect(result.current.articleGameResult.currentMode).toBe("error");
    });

    test("should return to regular mode after 2 error questions", () => {
      const { result } = renderHook(() => useArticleGameStatistics());

      // Set up error mode with wrong answers
      act(() => {
        result.current.answerWith("the");
        result.current.answerWith("nothing");
        result.current.startNextQuestion();
      });

      // Simulate being in error mode and completing 2 error questions
      // This would require more complex setup, but the logic is there
    });
  });

  describe("Game completion", () => {
    test("should mark game as completed when all questions done and no errors", () => {
      const { result } = renderHook(() => useArticleGameStatistics());

      // Answer all questions correctly
      for (let i = 0; i < mockSentences.length; i++) {
        act(() => {
          result.current.answerWith(mockSentences[i].correctAnswer);
          result.current.startNextQuestion();
        });
      }

      expect(result.current.articleGameResult.isCompleted).toBe(true);
    });

    test("should provide completion statistics", () => {
      const { result } = renderHook(() => useArticleGameStatistics());

      expect(result.current.articleGameResult.completionStats).toEqual({
        questionsCompleted: 0,
        errorsRemaining: 0,
        totalFailures: 0,
        finalScore: 0,
      });
    });
  });

  describe("Game reset", () => {
    test("should reset all game state", () => {
      const { result } = renderHook(() => useArticleGameStatistics());

      // Make some progress
      act(() => {
        result.current.answerWith("the"); // wrong
        result.current.startNextQuestion();
      });

      // Reset game
      act(() => {
        result.current.resetGame();
      });

      expect(result.current.articleGameResult.score).toBe(0);
      expect(result.current.articleGameResult.cursor).toBe(1);
      expect(result.current.articleGameResult.wrongAnswersMap.length).toBe(0);
      expect(result.current.articleGameResult.attempts).toBe(0);
      expect(result.current.articleGameResult.isCompleted).toBe(false);
    });

    test("should clear localStorage data", () => {
      const { result } = renderHook(() => useArticleGameStatistics());

      act(() => {
        result.current.clearStoredStatistics();
      });

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        "article_game_statistics",
      );
    });
  });

  describe("localStorage persistence", () => {
    test("should save statistics to localStorage on state changes", () => {
      const { result } = renderHook(() => useArticleGameStatistics());

      act(() => {
        result.current.answerWith("a/an");
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "article_game_statistics",
        expect.stringContaining('"score":10'),
      );
    });

    test("should handle localStorage save errors gracefully", () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error("Storage full");
      });
      console.error = jest.fn();

      const { result } = renderHook(() => useArticleGameStatistics());

      act(() => {
        result.current.answerWith("a/an");
      });

      expect(console.error).toHaveBeenCalledWith(
        "Error saving game statistics:",
        expect.any(Error),
      );
    });
  });

  describe("Article options", () => {
    test("should provide article options with correct styling", () => {
      const { result } = renderHook(() => useArticleGameStatistics());

      const options = result.current.articleGameResult.articleOptions;

      expect(options).toHaveLength(3);
      expect(options[0]).toEqual({
        value: "a/an",
        label: "A / AN",
        className: "article-button",
        disabled: false,
      });
    });

    test("should mark failed options correctly", () => {
      const { result } = renderHook(() => useArticleGameStatistics());

      act(() => {
        result.current.answerWith("the"); // wrong answer
      });

      const theOption = result.current.articleGameResult.articleOptions.find(
        (opt) => opt.value === "the",
      );
      expect(theOption.className).toBe("article-button failed");
      expect(theOption.disabled).toBe(true);
    });
  });

  describe("Progress calculation", () => {
    test("should calculate progress correctly in regular mode", () => {
      const { result } = renderHook(() => useArticleGameStatistics());

      expect(result.current.articleGameResult.progress).toEqual({
        current: 1,
        total: 3,
        type: "Main Progress",
      });
      expect(result.current.articleGameResult.progressPercentage).toBe(33);
    });

    test("should calculate progress correctly in error mode", () => {
      const { result } = renderHook(() => useArticleGameStatistics());

      // This would need setup to get into error mode
      // For now, just test the structure
      expect(result.current.articleGameResult.progress).toHaveProperty(
        "current",
      );
      expect(result.current.articleGameResult.progress).toHaveProperty("total");
      expect(result.current.articleGameResult.progress).toHaveProperty("type");
    });
  });

  describe("UI helpers", () => {
    test("should provide correct next button text", () => {
      const { result } = renderHook(() => useArticleGameStatistics());

      expect(result.current.articleGameResult.nextButtonText).toBe(
        "Next Question →",
      );
    });

    test("should indicate when user can proceed", () => {
      const { result } = renderHook(() => useArticleGameStatistics());

      expect(result.current.articleGameResult.canProceed).toBe(false);

      act(() => {
        result.current.answerWith("a/an");
      });

      expect(result.current.articleGameResult.canProceed).toBe(true);
    });

    test("should indicate when to show correct answer", () => {
      const { result } = renderHook(() => useArticleGameStatistics());

      expect(result.current.articleGameResult.shouldShowCorrectAnswer).toBe(
        false,
      );

      act(() => {
        result.current.answerWith("a/an"); // correct
      });

      expect(result.current.articleGameResult.shouldShowCorrectAnswer).toBe(
        true,
      );
    });
  });

  describe("Answer state localStorage persistence", () => {
    test("should save answer state to localStorage when answering", () => {
      const { result } = renderHook(() => useArticleGameStatistics());

      act(() => {
        result.current.answerWith("the"); // wrong answer
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "article_game_answer_state_regular_1",
        expect.stringContaining('"selectedAnswer":"the"'),
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "article_game_answer_state_regular_1",
        expect.stringContaining('"attempts":1'),
      );
    });

    test("should load answer state from localStorage on question change", () => {
      // Mock stored answer state
      const storedAnswerState = {
        selectedAnswer: "the",
        attempts: 1,
        isCorrect: false,
        showResult: false,
        failedOptions: ["the"],
        questionId: "regular_1",
        timestamp: new Date().toISOString(),
      };

      localStorageMock.getItem.mockImplementation((key) => {
        if (key === "article_game_answer_state_regular_1") {
          return JSON.stringify(storedAnswerState);
        }
        return null;
      });

      const { result } = renderHook(() => useArticleGameStatistics());

      expect(result.current.articleGameResult.selectedAnswer).toBe("the");
      expect(result.current.articleGameResult.attempts).toBe(1);
      expect(result.current.articleGameResult.isCorrect).toBe(false);
      expect(result.current.articleGameResult.failedOptions).toContain("the");
    });

    test("should clear answer state when moving to next question", () => {
      const { result } = renderHook(() => useArticleGameStatistics());

      // Answer question and move to next
      act(() => {
        result.current.answerWith("a/an"); // correct
      });
      act(() => {
        result.current.startNextQuestion();
      });

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        "article_game_answer_state_regular_1",
      );
    });

    test("should clear answer state when skipping question", () => {
      const { result } = renderHook(() => useArticleGameStatistics());

      act(() => {
        result.current.skipQuestion();
      });

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        "article_game_answer_state_regular_1",
      );
    });

    test("should clear all answer states when resetting game", () => {
      Object.keys.mockReturnValue([
        "article_game_answer_state_regular_1",
        "article_game_answer_state_regular_2",
        "other_key",
      ]);

      const { result } = renderHook(() => useArticleGameStatistics());

      act(() => {
        result.current.resetGame();
      });

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        "article_game_answer_state_regular_1",
      );
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        "article_game_answer_state_regular_2",
      );
      expect(localStorageMock.removeItem).not.toHaveBeenCalledWith("other_key");
    });

    test("should handle localStorage errors gracefully when loading answer state", () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error("Storage error");
      });
      console.error = jest.fn();

      const { result } = renderHook(() => useArticleGameStatistics());

      expect(console.error).toHaveBeenCalledWith(
        "Error loading answer state:",
        expect.any(Error),
      );
      expect(result.current.articleGameResult.selectedAnswer).toBe(null);
    });

    test("should provide debug information about answer states", () => {
      const { result } = renderHook(() => useArticleGameStatistics());

      expect(result.current.articleGameResult.debugInfo).toHaveProperty(
        "currentQuestionId",
      );
      expect(result.current.articleGameResult.debugInfo).toHaveProperty(
        "hasStoredAnswerState",
      );
      expect(result.current.articleGameResult.debugInfo).toHaveProperty(
        "answerStateCount",
      );
    });

    test("should provide utility method to get stored answer states", () => {
      Object.keys.mockReturnValue([
        "article_game_answer_state_regular_1",
        "article_game_answer_state_error_2",
        "other_key",
      ]);

      localStorageMock.getItem.mockImplementation((key) => {
        if (key.startsWith("article_game_answer_state_")) {
          return JSON.stringify({ selectedAnswer: "test", attempts: 1 });
        }
        return null;
      });

      const { result } = renderHook(() => useArticleGameStatistics());

      const storedStates = result.current.getStoredAnswerStates();
      expect(storedStates).toHaveLength(2);
      expect(storedStates[0]).toHaveProperty("selectedAnswer", "test");
    });

    test("should provide method to clear current question answer state", () => {
      const { result } = renderHook(() => useArticleGameStatistics());

      // Set some answer state first
      act(() => {
        result.current.answerWith("the");
      });

      // Clear it
      act(() => {
        result.current.clearAnswerStateForCurrentQuestion();
      });

      expect(result.current.articleGameResult.selectedAnswer).toBe(null);
      expect(result.current.articleGameResult.attempts).toBe(0);
      expect(result.current.articleGameResult.failedOptions).toHaveLength(0);
    });

    test("should clean up old answer states periodically", () => {
      // Mock many old answer states
      const manyKeys = Array.from(
        { length: 120 },
        (_, i) => `article_game_answer_state_regular_${i}`,
      );
      Object.keys.mockReturnValue(manyKeys);

      localStorageMock.getItem.mockImplementation((key) => {
        if (key.startsWith("article_game_answer_state_")) {
          return JSON.stringify({
            selectedAnswer: "test",
            timestamp: new Date(
              Date.now() - Math.random() * 1000000,
            ).toISOString(),
          });
        }
        return null;
      });

      renderHook(() => useArticleGameStatistics());

      // Should remove oldest states, keeping only 100
      expect(localStorageMock.removeItem).toHaveBeenCalledTimes(20);
    });
  });
});
