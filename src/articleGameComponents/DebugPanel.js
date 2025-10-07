import React, { useState, useEffect } from "react";

const DebugPanel = ({
  progressState,
  currentQuestionState,
  errorState,
  possibleAnswers,
  isLoading,
  totalQuestions,
  isVisible,
  onClose,
}) => {
  const [history, setHistory] = useState([]);
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);

  // Combine all state data for tracking
  const combinedData = {
    progressState,
    currentQuestionState,
    errorState,
    possibleAnswers,
    isLoading,
    totalQuestions,
  };

  // Track changes and add to history
  useEffect(() => {
    if (progressState || currentQuestionState || errorState) {
      const timestamp = new Date().toISOString();
      const newEntry = {
        timestamp,
        data: JSON.parse(JSON.stringify(combinedData)), // Deep clone
        id: Date.now(),
      };

      setHistory((prev) => {
        const updated = [newEntry, ...prev].slice(0, 50); // Keep last 50 entries
        setSelectedHistoryIndex(0); // Always select the latest
        return updated;
      });
    }
  }, [
    progressState,
    currentQuestionState,
    errorState,
    possibleAnswers,
    isLoading,
    totalQuestions,
  ]);

  if (!isVisible) return null;

  const currentData = history[selectedHistoryIndex]?.data || combinedData;

  const formatValue = (value) => {
    if (value === null) return "null";
    if (value === undefined) return "undefined";
    if (typeof value === "boolean") return value.toString();
    if (typeof value === "object") return JSON.stringify(value, null, 2);
    return String(value);
  };

  const getValueColor = (value) => {
    if (value === null || value === undefined) return "#999";
    if (typeof value === "boolean") return value ? "#4caf50" : "#f44336";
    if (typeof value === "number") return "#2196f3";
    if (typeof value === "string") return "#ff9800";
    if (Array.isArray(value)) return "#9c27b0";
    return "#607d8b";
  };

  const renderSection = (title, data, bgColor = "#f8f9fa") => (
    <div
      style={{
        marginBottom: "16px",
        border: "1px solid #e0e0e0",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          backgroundColor: bgColor,
          padding: "8px 12px",
          fontSize: "14px",
          fontWeight: "bold",
          color: "#333",
        }}
      >
        {title}
      </div>
      <div style={{ padding: "12px", backgroundColor: "#fff" }}>
        {Object.entries(data).map(([key, value]) => (
          <div
            key={key}
            style={{
              display: "flex",
              marginBottom: "8px",
              fontSize: "12px",
              fontFamily: "Monaco, Consolas, monospace",
            }}
          >
            <span
              style={{
                minWidth: "120px",
                color: "#666",
                fontWeight: "500",
              }}
            >
              {key}:
            </span>
            <span
              style={{
                color: getValueColor(value),
                flex: 1,
                wordBreak: "break-word",
                whiteSpace: "pre-wrap",
              }}
            >
              {formatValue(value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  // Calculate derived values for display
  const progress = {
    current: currentData.progressState?.cursor || 0,
    total: currentData.totalQuestions || 0,
    completed: Math.max(
      0,
      (currentData.progressState?.cursor || 0) -
        (currentData.errorState?.errors?.length || 0),
    ),
  };

  const attempts =
    currentData.currentQuestionState?.selectedAnswers?.length || 0;
  const maxAttempts = currentData.currentQuestionState?.maxAttempts || 2;
  const wrongAnswersMap =
    currentData.errorState?.errors?.map((error) => ({
      id: error.id,
      successRepetitions: error.correctCount,
    })) || [];

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        width: isMinimized ? "300px" : "450px",
        height: isMinimized ? "60px" : "80vh",
        backgroundColor: "#ffffff",
        border: "2px solid #2196f3",
        borderRadius: "12px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
        zIndex: 10000,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        transition: "all 0.3s ease",
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: "#2196f3",
          color: "white",
          padding: "12px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "14px",
          fontWeight: "bold",
        }}
      >
        <span>🐛 ArticleGame Debug Panel</span>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "none",
              color: "white",
              padding: "4px 8px",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            {isMinimized ? "📈" : "📉"}
          </button>
          <button
            onClick={() => setHistory([])}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "none",
              color: "white",
              padding: "4px 8px",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "12px",
            }}
            title="Clear History"
          >
            🗑️
          </button>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "none",
              color: "white",
              padding: "4px 8px",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* History Selector */}
          {history.length > 1 && (
            <div
              style={{
                padding: "8px 16px",
                backgroundColor: "#f5f5f5",
                borderBottom: "1px solid #e0e0e0",
              }}
            >
              <div
                style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}
              >
                History ({history.length} entries):
              </div>
              <select
                value={selectedHistoryIndex}
                onChange={(e) =>
                  setSelectedHistoryIndex(Number(e.target.value))
                }
                style={{
                  width: "100%",
                  padding: "4px",
                  fontSize: "11px",
                  fontFamily: "Monaco, Consolas, monospace",
                }}
              >
                {history.map((entry, index) => (
                  <option key={entry.id} value={index}>
                    {index === 0 ? "🔴 " : "⚪ "}
                    {new Date(entry.timestamp).toLocaleTimeString()}
                    {entry.data.currentQuestionState?.currentQuestion
                      ? ` - Q${(entry.data.progressState?.cursor || 0) + 1}`
                      : ""}
                    {entry.data.currentQuestionState?.selectedAnswers?.length >
                    0
                      ? ` - "${entry.data.currentQuestionState.selectedAnswers[entry.data.currentQuestionState.selectedAnswers.length - 1]}"`
                      : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Content */}
          <div
            style={{
              flex: 1,
              overflow: "auto",
              padding: "16px",
            }}
          >
            {currentData && (
              <>
                {/* Current State */}
                {renderSection(
                  "🎯 Current State",
                  {
                    isLoading: currentData.isLoading,
                    isCompleted: currentData.progressState?.isCompleted,
                    mode: currentData.progressState?.mode,
                    cursor: (currentData.progressState?.cursor || 0) + 1,
                    attempts: attempts,
                    maxAttempts: maxAttempts,
                    isCorrect: currentData.currentQuestionState?.isCorrect,
                    isCompleted: currentData.currentQuestionState?.isCompleted,
                  },
                  "#e8f5e8",
                )}

                {/* Progress Info */}
                {renderSection(
                  "📊 Progress",
                  {
                    current: progress.current,
                    total: progress.total,
                    completed: progress.completed,
                    percentage:
                      currentData.progressState?.progressPercentage?.toFixed(
                        1,
                      ) + "%" || "0%",
                    shuffledQuestionsLength:
                      currentData.progressState?.shuffledQuestions?.length || 0,
                  },
                  "#fff3e0",
                )}

                {/* Question Data */}
                {currentData.currentQuestionState?.currentQuestion &&
                  renderSection(
                    "❓ Current Question",
                    {
                      id: currentData.currentQuestionState.currentQuestion.id,
                      sentence:
                        currentData.currentQuestionState.currentQuestion
                          .sentence,
                      correctAnswer:
                        currentData.currentQuestionState.currentQuestion
                          .correctAnswer,
                      ruleId:
                        currentData.currentQuestionState.currentQuestion.ruleId,
                      difficulty:
                        currentData.currentQuestionState.currentQuestion
                          .difficulty || "N/A",
                    },
                    "#e3f2fd",
                  )}

                {/* Answer State */}
                {renderSection(
                  "✋ Answer State",
                  {
                    selectedAnswers:
                      currentData.currentQuestionState?.selectedAnswers || [],
                    lastSelectedAnswer:
                      currentData.currentQuestionState?.selectedAnswers?.[
                        currentData.currentQuestionState.selectedAnswers
                          .length - 1
                      ] || "None",
                    possibleAnswers: currentData.possibleAnswers || [],
                  },
                  "#fce4ec",
                )}

                {/* Error Tracking */}
                {renderSection(
                  "❌ Error Tracking",
                  {
                    errorCount: currentData.errorState?.errors?.length || 0,
                    errorCursor: currentData.errorState?.errorCursor || 0,
                    errorIds:
                      currentData.errorState?.errors
                        ?.map((e) => `${e.id}(${e.correctCount})`)
                        .join(", ") || "None",
                    regularQuestionCounter:
                      currentData.progressState?.regularQuestionCounter || 0,
                    errorQuestionsShown:
                      currentData.progressState?.errorQuestionsShown || 0,
                  },
                  "#ffebee",
                )}

                {/* Article Options */}
                {currentData.possibleAnswers &&
                  renderSection(
                    "🔘 Article Options",
                    currentData.possibleAnswers.reduce((acc, opt, index) => {
                      acc[`option_${index}`] = opt;
                      return acc;
                    }, {}),
                    "#f3e5f5",
                  )}

                {/* Raw Progress State */}
                <details style={{ marginBottom: "16px" }}>
                  <summary
                    style={{
                      padding: "8px",
                      backgroundColor: "#e8f5e8",
                      cursor: "pointer",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    📊 Raw Progress State
                  </summary>
                  <pre
                    style={{
                      backgroundColor: "#1e1e1e",
                      color: "#d4d4d4",
                      padding: "12px",
                      borderRadius: "4px",
                      fontSize: "10px",
                      overflow: "auto",
                      maxHeight: "150px",
                      fontFamily: "Monaco, Consolas, monospace",
                      margin: "8px 0 0 0",
                    }}
                  >
                    {JSON.stringify(currentData.progressState, null, 2)}
                  </pre>
                </details>

                {/* Raw Current Question State */}
                <details style={{ marginBottom: "16px" }}>
                  <summary
                    style={{
                      padding: "8px",
                      backgroundColor: "#e3f2fd",
                      cursor: "pointer",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    ❓ Raw Current Question State
                  </summary>
                  <pre
                    style={{
                      backgroundColor: "#1e1e1e",
                      color: "#d4d4d4",
                      padding: "12px",
                      borderRadius: "4px",
                      fontSize: "10px",
                      overflow: "auto",
                      maxHeight: "150px",
                      fontFamily: "Monaco, Consolas, monospace",
                      margin: "8px 0 0 0",
                    }}
                  >
                    {JSON.stringify(currentData.currentQuestionState, null, 2)}
                  </pre>
                </details>

                {/* Raw Error State */}
                <details style={{ marginBottom: "16px" }}>
                  <summary
                    style={{
                      padding: "8px",
                      backgroundColor: "#ffebee",
                      cursor: "pointer",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    ❌ Raw Error State
                  </summary>
                  <pre
                    style={{
                      backgroundColor: "#1e1e1e",
                      color: "#d4d4d4",
                      padding: "12px",
                      borderRadius: "4px",
                      fontSize: "10px",
                      overflow: "auto",
                      maxHeight: "150px",
                      fontFamily: "Monaco, Consolas, monospace",
                      margin: "8px 0 0 0",
                    }}
                  >
                    {JSON.stringify(currentData.errorState, null, 2)}
                  </pre>
                </details>
              </>
            )}
          </div>
        </>
      )}

      {isMinimized && (
        <div
          style={{
            padding: "12px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "12px",
          }}
        >
          <span>
            Score: {progress.completed * 10} | Q
            {(currentData.progressState?.cursor || 0) + 1}/
            {currentData.totalQuestions || "?"} |{attempts} attempts
          </span>
          {currentData.currentQuestionState?.isCorrect !== null &&
            currentData.currentQuestionState?.isCorrect !== undefined && (
              <span
                style={{
                  color: currentData.currentQuestionState.isCorrect
                    ? "#4caf50"
                    : "#f44336",
                  fontWeight: "bold",
                }}
              >
                {currentData.currentQuestionState.isCorrect ? "✅" : "❌"}
              </span>
            )}
        </div>
      )}
    </div>
  );
};

export default DebugPanel;
