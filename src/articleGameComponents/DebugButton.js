import React from 'react';
import useDebugPanel from '../hooks/useDebugPanel';

const DebugButton = ({ position = 'bottom-left', size = 'medium' }) => {
  const { isDebugVisible, toggleDebugPanel } = useDebugPanel();

  const positions = {
    'top-left': { top: '20px', left: '20px' },
    'top-right': { top: '20px', right: '20px' },
    'bottom-left': { bottom: '20px', left: '20px' },
    'bottom-right': { bottom: '20px', right: '20px' },
    'center': { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
  };

  const sizes = {
    small: { width: '40px', height: '40px', fontSize: '16px' },
    medium: { width: '50px', height: '50px', fontSize: '18px' },
    large: { width: '60px', height: '60px', fontSize: '20px' }
  };

  return (
    <button
      onClick={toggleDebugPanel}
      title={isDebugVisible ? 'Close Debug Panel (Ctrl+Shift+D)' : 'Open Debug Panel (Ctrl+Shift+D)'}
      style={{
        position: 'fixed',
        ...positions[position],
        ...sizes[size],
        backgroundColor: isDebugVisible ? '#f44336' : '#2196f3',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease',
        fontWeight: 'bold',
        fontFamily: 'monospace'
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = 'scale(1.1)';
        e.target.style.boxShadow = '0 6px 16px rgba(0,0,0,0.4)';
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'scale(1)';
        e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
      }}
    >
      🐛
    </button>
  );
};

export default DebugButton;
