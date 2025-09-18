import { useState, useEffect } from 'react';

const useDebugPanel = () => {
  const [isDebugVisible, setIsDebugVisible] = useState(false);
  const [debugHistory, setDebugHistory] = useState([]);

  // Check for debug mode in localStorage or URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const debugFromUrl = urlParams.get('debug') === 'true';
    const debugFromStorage = localStorage.getItem('articleGame_debugMode') === 'true';

    if (debugFromUrl || debugFromStorage) {
      setIsDebugVisible(true);
      localStorage.setItem('articleGame_debugMode', 'true');
    }
  }, []);

  // Add keyboard shortcut (Ctrl+Shift+D or Cmd+Shift+D)
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'D') {
        event.preventDefault();
        toggleDebugPanel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleDebugPanel = () => {
    setIsDebugVisible(prev => {
      const newValue = !prev;
      localStorage.setItem('articleGame_debugMode', newValue.toString());
      return newValue;
    });
  };

  const closeDebugPanel = () => {
    setIsDebugVisible(false);
    localStorage.setItem('articleGame_debugMode', 'false');
  };

  const addToDebugHistory = (data, action = 'state_change') => {
    const timestamp = new Date().toISOString();
    const entry = {
      id: Date.now() + Math.random(),
      timestamp,
      action,
      data: JSON.parse(JSON.stringify(data)), // Deep clone
    };

    setDebugHistory(prev => [entry, ...prev].slice(0, 100)); // Keep last 100 entries
  };

  const clearDebugHistory = () => {
    setDebugHistory([]);
  };

  const exportDebugHistory = () => {
    const dataStr = JSON.stringify(debugHistory, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `article-game-debug-${new Date().toISOString().slice(0, 19)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return {
    isDebugVisible,
    debugHistory,
    toggleDebugPanel,
    closeDebugPanel,
    addToDebugHistory,
    clearDebugHistory,
    exportDebugHistory,
  };
};

export default useDebugPanel;
