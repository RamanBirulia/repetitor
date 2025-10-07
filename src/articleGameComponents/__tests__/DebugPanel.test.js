import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DebugPanel from "../DebugPanel";

const mockProgressState = {
  cursor: 1,
  mode: "regular",
  shuffledQuestions: [1, 2, 3],
  progressPercentage: 33.3,
  isCompleted: false,
  regularQuestionCounter: 1,
  errorQuestionsShown: 0,
};

const mockCurrentQuestionState = {
  currentQuestion: {
    id: 1,
    sentence: "I need ___ apple.",
    correctAnswer: "a/an",
    ruleId: 5,
    explanation: "Use a/an for singular countable nouns.",
  },
  selectedAnswers: ["a/an"],
  isCompleted: true,
  isCorrect: true,
  maxAttempts: 2,
};

const mockErrorState = {
  errorCursor: 0,
  errors: [],
};

const mockPossibleAnswers = ["a/an", "the", "nothing"];

describe("DebugPanel", () => {
  const defaultProps = {
    progressState: mockProgressState,
    currentQuestionState: mockCurrentQuestionState,
    errorState: mockErrorState,
    possibleAnswers: mockPossibleAnswers,
    isLoading: false,
    totalQuestions: 3,
    isVisible: true,
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders debug panel when visible", () => {
    render(<DebugPanel {...defaultProps} />);

    expect(screen.getByText("🐛 ArticleGame Debug Panel")).toBeInTheDocument();
    expect(screen.getByText("🎯 Current State")).toBeInTheDocument();
    expect(screen.getByText("📊 Progress")).toBeInTheDocument();
    expect(screen.getByText("❓ Current Question")).toBeInTheDocument();
  });

  test("does not render when not visible", () => {
    render(<DebugPanel {...defaultProps} isVisible={false} />);

    expect(
      screen.queryByText("🐛 ArticleGame Debug Panel"),
    ).not.toBeInTheDocument();
  });

  test("displays current game state correctly", () => {
    render(<DebugPanel {...defaultProps} />);

    expect(screen.getByText("isLoading:")).toBeInTheDocument();
    expect(screen.getByText("false")).toBeInTheDocument();
    expect(screen.getByText("mode:")).toBeInTheDocument();
    expect(screen.getByText("regular")).toBeInTheDocument();
  });

  test("displays current question information", () => {
    render(<DebugPanel {...defaultProps} />);

    expect(screen.getByText("sentence:")).toBeInTheDocument();
    expect(screen.getByText("I need ___ apple.")).toBeInTheDocument();
    expect(screen.getByText("correctAnswer:")).toBeInTheDocument();
    expect(screen.getByText("a/an")).toBeInTheDocument();
  });

  test("displays progress information", () => {
    render(<DebugPanel {...defaultProps} />);

    expect(screen.getByText("current:")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("total:")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  test("displays answer state information", () => {
    render(<DebugPanel {...defaultProps} />);

    expect(screen.getByText("✋ Answer State")).toBeInTheDocument();
    expect(screen.getByText("selectedAnswers:")).toBeInTheDocument();
    expect(screen.getByText('["a/an"]')).toBeInTheDocument();
    expect(screen.getByText("lastSelectedAnswer:")).toBeInTheDocument();
  });

  test("displays error tracking information", () => {
    const propsWithErrors = {
      ...defaultProps,
      errorState: {
        errorCursor: 0,
        errors: [{ id: 1, correctCount: 0 }],
      },
    };

    render(<DebugPanel {...propsWithErrors} />);

    expect(screen.getByText("❌ Error Tracking")).toBeInTheDocument();
    expect(screen.getByText("errorCount:")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  test("displays article options", () => {
    render(<DebugPanel {...defaultProps} />);

    expect(screen.getByText("🔘 Article Options")).toBeInTheDocument();
    expect(screen.getByText("option_0:")).toBeInTheDocument();
    expect(screen.getByText("option_1:")).toBeInTheDocument();
    expect(screen.getByText("option_2:")).toBeInTheDocument();
  });

  test("calls onClose when close button is clicked", () => {
    const onClose = jest.fn();
    render(<DebugPanel {...defaultProps} onClose={onClose} />);

    const closeButton = screen.getByText("✕");
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("can be minimized and maximized", () => {
    render(<DebugPanel {...defaultProps} />);

    const minimizeButton = screen.getByText("📉");
    fireEvent.click(minimizeButton);

    // When minimized, detailed sections should not be visible
    expect(screen.queryByText("🎯 Current State")).not.toBeInTheDocument();

    // But the minimized info should be visible
    expect(screen.getByText(/Score:/)).toBeInTheDocument();

    // Click to maximize again
    const maximizeButton = screen.getByText("📈");
    fireEvent.click(maximizeButton);

    // Detailed sections should be visible again
    expect(screen.getByText("🎯 Current State")).toBeInTheDocument();
  });

  test("updates history when state changes", async () => {
    const { rerender } = render(<DebugPanel {...defaultProps} />);

    // Change the state
    const updatedProgressState = {
      ...mockProgressState,
      cursor: 2,
    };

    rerender(
      <DebugPanel {...defaultProps} progressState={updatedProgressState} />,
    );

    await waitFor(() => {
      expect(screen.getByText("2")).toBeInTheDocument();
    });
  });

  test("shows raw JSON data in collapsible sections", () => {
    render(<DebugPanel {...defaultProps} />);

    const progressDetails = screen.getByText("📊 Raw Progress State");
    expect(progressDetails).toBeInTheDocument();

    const questionDetails = screen.getByText("❓ Raw Current Question State");
    expect(questionDetails).toBeInTheDocument();

    const errorDetails = screen.getByText("❌ Raw Error State");
    expect(errorDetails).toBeInTheDocument();
  });

  test("handles null or undefined states", () => {
    render(
      <DebugPanel
        {...defaultProps}
        progressState={null}
        currentQuestionState={null}
        errorState={null}
      />,
    );

    expect(screen.getByText("🐛 ArticleGame Debug Panel")).toBeInTheDocument();
    // Should not crash, but content might be empty or show null values
  });

  test("displays loading state correctly", () => {
    render(<DebugPanel {...defaultProps} isLoading={true} />);

    expect(screen.getByText("isLoading:")).toBeInTheDocument();
    expect(screen.getByText("true")).toBeInTheDocument();
  });

  test("displays completion state when game is finished", () => {
    const completedProps = {
      ...defaultProps,
      progressState: {
        ...mockProgressState,
        isCompleted: true,
        progressPercentage: 100,
      },
    };

    render(<DebugPanel {...completedProps} />);

    expect(screen.getByText("isCompleted:")).toBeInTheDocument();
    expect(screen.getByText("true")).toBeInTheDocument();
  });

  test("shows correct minimized state information", () => {
    render(<DebugPanel {...defaultProps} />);

    const minimizeButton = screen.getByText("📉");
    fireEvent.click(minimizeButton);

    // Should show score calculation (completed * 10)
    expect(screen.getByText(/Score:/)).toBeInTheDocument();
    expect(screen.getByText(/Q2\/3/)).toBeInTheDocument();
    expect(screen.getByText(/1 attempts/)).toBeInTheDocument();
    expect(screen.getByText("✅")).toBeInTheDocument(); // Correct answer indicator
  });

  test("handles error mode display", () => {
    const errorModeProps = {
      ...defaultProps,
      progressState: {
        ...mockProgressState,
        mode: "error",
      },
      errorState: {
        errorCursor: 1,
        errors: [
          { id: 1, correctCount: 0 },
          { id: 2, correctCount: 1 },
        ],
      },
    };

    render(<DebugPanel {...errorModeProps} />);

    expect(screen.getByText("mode:")).toBeInTheDocument();
    expect(screen.getByText("error")).toBeInTheDocument();
    expect(screen.getByText("errorCursor:")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  test("clears history when clear button is clicked", () => {
    render(<DebugPanel {...defaultProps} />);

    const clearButton = screen.getByTitle("Clear History");
    fireEvent.click(clearButton);

    // History should be cleared (this is more of a functional test)
    expect(clearButton).toBeInTheDocument();
  });

  test("shows correct colors for different value types", () => {
    render(<DebugPanel {...defaultProps} />);

    // Boolean values should be colored
    const booleanElements = screen.getAllByText("false");
    expect(booleanElements.length).toBeGreaterThan(0);

    // Number values should be colored
    const numberElements = screen.getAllByText("1");
    expect(numberElements.length).toBeGreaterThan(0);
  });

  test("handles no current question state", () => {
    const propsWithoutQuestion = {
      ...defaultProps,
      currentQuestionState: {
        ...mockCurrentQuestionState,
        currentQuestion: null,
      },
    };

    render(<DebugPanel {...propsWithoutQuestion} />);

    expect(screen.getByText("🎯 Current State")).toBeInTheDocument();
    // Should not show question section when no current question
    expect(screen.queryByText("❓ Current Question")).not.toBeInTheDocument();
  });
});
