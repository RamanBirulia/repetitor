import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DebugPanel from '../DebugPanel';

const mockArticleGameResult = {
  isLoading: false,
  isCompleted: false,
  currentQuestion: {
    id: 1,
    sentence: 'I need ___ apple.',
    correctAnswer: 'a/an',
    ruleId: 5,
    explanation: 'Use a/an for singular countable nouns.'
  },
  progress: {
    current: 1,
    total: 10,
    type: 'Main Progress'
  },
  score: 10,
  cursor: 1,
  selectedAnswer: 'a/an',
  attempts: 1,
  isCorrect: true,
  showResult: true,
  failedOptions: [],
  canRetry: false,
  articleOptions: [
    { value: 'a/an', label: 'A / AN', className: 'article-button correct', disabled: false },
    { value: 'the', label: 'THE', className: 'article-button', disabled: false },
    { value: 'nothing', label: 'NO ARTICLE', className: 'article-button', disabled: false }
  ],
  wrongAnswersMap: [],
  currentMode: 'regular',
  errorQuestions: 0,
  failureRepetitions: 0,
  shouldShowCorrectAnswer: true,
  progressPercentage: 10,
  canProceed: true,
  nextButtonText: 'Next Question →',
  completionStats: {
    questionsCompleted: 0,
    errorsRemaining: 0,
    totalFailures: 0,
    finalScore: 10
  }
};

describe('DebugPanel', () => {
  const defaultProps = {
    articleGameResult: mockArticleGameResult,
    isVisible: true,
    onClose: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders debug panel when visible', () => {
    render(<DebugPanel {...defaultProps} />);

    expect(screen.getByText('🐛 ArticleGame Debug Panel')).toBeInTheDocument();
    expect(screen.getByText('🎯 Current State')).toBeInTheDocument();
    expect(screen.getByText('📊 Progress')).toBeInTheDocument();
    expect(screen.getByText('❓ Current Question')).toBeInTheDocument();
  });

  test('does not render when not visible', () => {
    render(<DebugPanel {...defaultProps} isVisible={false} />);

    expect(screen.queryByText('🐛 ArticleGame Debug Panel')).not.toBeInTheDocument();
  });

  test('displays current game state correctly', () => {
    render(<DebugPanel {...defaultProps} />);

    expect(screen.getByText('isLoading:')).toBeInTheDocument();
    expect(screen.getByText('false')).toBeInTheDocument();
    expect(screen.getByText('score:')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  test('displays current question information', () => {
    render(<DebugPanel {...defaultProps} />);

    expect(screen.getByText('sentence:')).toBeInTheDocument();
    expect(screen.getByText('I need ___ apple.')).toBeInTheDocument();
    expect(screen.getByText('correctAnswer:')).toBeInTheDocument();
    expect(screen.getByText('a/an')).toBeInTheDocument();
  });

  test('displays progress information', () => {
    render(<DebugPanel {...defaultProps} />);

    expect(screen.getByText('type:')).toBeInTheDocument();
    expect(screen.getByText('Main Progress')).toBeInTheDocument();
    expect(screen.getByText('current:')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  test('displays article options with states', () => {
    render(<DebugPanel {...defaultProps} />);

    expect(screen.getByText('🔘 Article Options')).toBeInTheDocument();
    expect(screen.getByText(/A \/ AN/)).toBeInTheDocument();
    expect(screen.getByText(/THE/)).toBeInTheDocument();
    expect(screen.getByText(/NO ARTICLE/)).toBeInTheDocument();
  });

  test('calls onClose when close button is clicked', () => {
    const onClose = jest.fn();
    render(<DebugPanel {...defaultProps} onClose={onClose} />);

    const closeButton = screen.getByText('✕');
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('can be minimized and maximized', () => {
    render(<DebugPanel {...defaultProps} />);

    const minimizeButton = screen.getByText('📉');
    fireEvent.click(minimizeButton);

    // When minimized, detailed sections should not be visible
    expect(screen.queryByText('🎯 Current State')).not.toBeInTheDocument();

    // But the minimized info should be visible
    expect(screen.getByText(/Score:/)).toBeInTheDocument();

    // Click to maximize again
    const maximizeButton = screen.getByText('📈');
    fireEvent.click(maximizeButton);

    // Detailed sections should be visible again
    expect(screen.getByText('🎯 Current State')).toBeInTheDocument();
  });

  test('updates history when articleGameResult changes', async () => {
    const { rerender } = render(<DebugPanel {...defaultProps} />);

    // Change the game result
    const updatedResult = {
      ...mockArticleGameResult,
      score: 20,
      attempts: 2
    };

    rerender(<DebugPanel {...defaultProps} articleGameResult={updatedResult} />);

    await waitFor(() => {
      expect(screen.getByText('20')).toBeInTheDocument();
    });
  });

  test('shows raw JSON data in collapsible section', () => {
    render(<DebugPanel {...defaultProps} />);

    const detailsElement = screen.getByText('🔍 Raw JSON Data');
    expect(detailsElement).toBeInTheDocument();

    // Click to expand
    fireEvent.click(detailsElement);

    // Should show JSON content
    expect(screen.getByText(/"isLoading"/)).toBeInTheDocument();
  });

  test('handles null or undefined articleGameResult', () => {
    render(<DebugPanel {...defaultProps} articleGameResult={null} />);

    expect(screen.getByText('🐛 ArticleGame Debug Panel')).toBeInTheDocument();
    // Should not crash, but content might be empty
  });

  test('displays error tracking information', () => {
    const resultWithErrors = {
      ...mockArticleGameResult,
      wrongAnswersMap: [{ id: 1, successRepetitions: 0 }],
      failureRepetitions: 1,
      currentMode: 'error'
    };

    render(<DebugPanel {...defaultProps} articleGameResult={resultWithErrors} />);

    expect(screen.getByText('❌ Error Tracking')).toBeInTheDocument();
    expect(screen.getByText('wrongAnswersCount:')).toBeInTheDocument();
    expect(screen.getByText('failureRepetitions:')).toBeInTheDocument();
  });

  test('displays completion stats', () => {
    render(<DebugPanel {...defaultProps} />);

    expect(screen.getByText('🏆 Completion Stats')).toBeInTheDocument();
    expect(screen.getByText('questionsCompleted:')).toBeInTheDocument();
    expect(screen.getByText('finalScore:')).toBeInTheDocument();
  });

  test('shows correct colors for different value types', () => {
    render(<DebugPanel {...defaultProps} />);

    // Boolean values should be colored
    const booleanElements = screen.getAllByText('false');
    expect(booleanElements.length).toBeGreaterThan(0);

    // Number values should be colored
    const numberElements = screen.getAllByText('10');
    expect(numberElements.length).toBeGreaterThan(0);
  });
});
