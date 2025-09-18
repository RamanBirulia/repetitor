import React, { useState, useEffect } from 'react';

const DebugPanel = ({ articleGameResult, isVisible, onClose }) => {
  const [history, setHistory] = useState([]);
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);

  // Track changes and add to history
  useEffect(() => {
    if (articleGameResult) {
      const timestamp = new Date().toISOString();
      const newEntry = {
        timestamp,
        data: JSON.parse(JSON.stringify(articleGameResult)), // Deep clone
        id: Date.now()
      };

      setHistory(prev => {
        const updated = [newEntry, ...prev].slice(0, 50); // Keep last 50 entries
        setSelectedHistoryIndex(0); // Always select the latest
        return updated;
      });
    }
  }, [articleGameResult]);

  if (!isVisible) return null;

  const currentData = history[selectedHistoryIndex]?.data || articleGameResult;

  const formatValue = (value) => {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'boolean') return value.toString();
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  const getValueColor = (value) => {
    if (value === null || value === undefined) return '#999';
    if (typeof value === 'boolean') return value ? '#4caf50' : '#f44336';
    if (typeof value === 'number') return '#2196f3';
    if (typeof value === 'string') return '#ff9800';
    if (Array.isArray(value)) return '#9c27b0';
    return '#607d8b';
  };

  const renderSection = (title, data, bgColor = '#f8f9fa') => (
    <div style={{
      marginBottom: '16px',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      <div style={{
        backgroundColor: bgColor,
        padding: '8px 12px',
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#333'
      }}>
        {title}
      </div>
      <div style={{ padding: '12px', backgroundColor: '#fff' }}>
        {Object.entries(data).map(([key, value]) => (
          <div key={key} style={{
            display: 'flex',
            marginBottom: '8px',
            fontSize: '12px',
            fontFamily: 'Monaco, Consolas, monospace'
          }}>
            <span style={{
              minWidth: '120px',
              color: '#666',
              fontWeight: '500'
            }}>
              {key}:
            </span>
            <span style={{
              color: getValueColor(value),
              flex: 1,
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap'
            }}>
              {formatValue(value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      width: isMinimized ? '300px' : '450px',
      height: isMinimized ? '60px' : '80vh',
      backgroundColor: '#ffffff',
      border: '2px solid #2196f3',
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
      zIndex: 10000,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      transition: 'all 0.3s ease'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#2196f3',
        color: 'white',
        padding: '12px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '14px',
        fontWeight: 'bold'
      }}>
        <span>🐛 ArticleGame Debug Panel</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            {isMinimized ? '📈' : '📉'}
          </button>
          <button
            onClick={() => setHistory([])}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
            title="Clear History"
          >
            🗑️
          </button>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
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
            <div style={{
              padding: '8px 16px',
              backgroundColor: '#f5f5f5',
              borderBottom: '1px solid #e0e0e0'
            }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                History ({history.length} entries):
              </div>
              <select
                value={selectedHistoryIndex}
                onChange={(e) => setSelectedHistoryIndex(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '4px',
                  fontSize: '11px',
                  fontFamily: 'Monaco, Consolas, monospace'
                }}
              >
                {history.map((entry, index) => (
                  <option key={entry.id} value={index}>
                    {index === 0 ? '🔴 ' : '⚪ '}
                    {new Date(entry.timestamp).toLocaleTimeString()}
                    {entry.data.currentQuestion ? ` - Q${entry.data.cursor}` : ''}
                    {entry.data.selectedAnswer ? ` - "${entry.data.selectedAnswer}"` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Content */}
          <div style={{
            flex: 1,
            overflow: 'auto',
            padding: '16px'
          }}>
            {currentData && (
              <>
                {/* Current State */}
                {renderSection('🎯 Current State', {
                  isLoading: currentData.isLoading,
                  isCompleted: currentData.isCompleted,
                  score: currentData.score,
                  cursor: currentData.cursor,
                  currentMode: currentData.currentMode,
                  attempts: currentData.attempts,
                  isCorrect: currentData.isCorrect,
                  showResult: currentData.showResult,
                  canRetry: currentData.canRetry,
                  canProceed: currentData.canProceed
                }, '#e8f5e8')}

                {/* Progress Info */}
                {renderSection('📊 Progress', {
                  type: currentData.progress?.type,
                  current: currentData.progress?.current,
                  total: currentData.progress?.total,
                  percentage: currentData.progressPercentage + '%',
                  nextButtonText: currentData.nextButtonText
                }, '#fff3e0')}

                {/* Question Data */}
                {currentData.currentQuestion && renderSection('❓ Current Question', {
                  id: currentData.currentQuestion.id,
                  sentence: currentData.currentQuestion.sentence,
                  correctAnswer: currentData.currentQuestion.correctAnswer,
                  ruleId: currentData.currentQuestion.ruleId,
                  difficulty: currentData.currentQuestion.difficulty || 'N/A'
                }, '#e3f2fd')}

                {/* Answer State */}
                {renderSection('✋ Answer State', {
                  selectedAnswer: currentData.selectedAnswer,
                  failedOptions: currentData.failedOptions,
                  shouldShowCorrectAnswer: currentData.shouldShowCorrectAnswer,
                  availableOptions: currentData.articleOptions?.filter(opt => !opt.disabled).length + ' of 3'
                }, '#fce4ec')}

                {/* Error Tracking */}
                {renderSection('❌ Error Tracking', {
                  wrongAnswersCount: currentData.wrongAnswersMap?.length || 0,
                  errorQuestions: currentData.errorQuestions,
                  failureRepetitions: currentData.failureRepetitions || 0,
                  wrongAnswerIds: currentData.wrongAnswersMap?.map(w => w.id).join(', ') || 'None'
                }, '#ffebee')}

                {/* Article Options */}
                {currentData.articleOptions && renderSection('🔘 Article Options',
                  currentData.articleOptions.reduce((acc, opt) => {
                    acc[opt.label] = `${opt.value} (${opt.className.split(' ').pop()}) ${opt.disabled ? '🚫' : '✅'}`;
                    return acc;
                  }, {}), '#f3e5f5')}

                {/* Completion Stats */}
                {currentData.completionStats && renderSection('🏆 Completion Stats',
                  currentData.completionStats, '#e0f2f1')}

                {/* Raw Data (Collapsible) */}
                <details style={{ marginTop: '16px' }}>
                  <summary style={{
                    padding: '8px',
                    backgroundColor: '#f5f5f5',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    🔍 Raw JSON Data
                  </summary>
                  <pre style={{
                    backgroundColor: '#1e1e1e',
                    color: '#d4d4d4',
                    padding: '12px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    overflow: 'auto',
                    maxHeight: '200px',
                    fontFamily: 'Monaco, Consolas, monospace',
                    margin: '8px 0 0 0'
                  }}>
                    {JSON.stringify(currentData, null, 2)}
                  </pre>
                </details>
              </>
            )}
          </div>
        </>
      )}

      {isMinimized && (
        <div style={{
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '12px'
        }}>
          <span>
            Score: {currentData?.score || 0} |
            Q{currentData?.cursor || 1}/{currentData?.progress?.total || '?'} |
            {currentData?.attempts || 0} attempts
          </span>
          {currentData?.isCorrect !== null && (
            <span style={{
              color: currentData.isCorrect ? '#4caf50' : '#f44336',
              fontWeight: 'bold'
            }}>
              {currentData.isCorrect ? '✅' : '❌'}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default DebugPanel;
