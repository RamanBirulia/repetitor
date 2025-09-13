import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ArticleGame from './pages/ArticleGame';
import RulesPage from './pages/RulesPage';
import './index.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/article-game" element={<ArticleGame />} />
          <Route path="/rules" element={<RulesPage />} />
          <Route path="/rules/:ruleId" element={<RulesPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
