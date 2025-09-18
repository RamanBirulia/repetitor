import React from "react";
import { useNavigate } from "react-router-dom";

const GameCompletedScreen = ({ completionStats, resetGame }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-2xl mx-auto p-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center animate-bounce-in">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Congratulations!
          </h2>
          <p className="text-xl text-gray-600 mb-6">
            You completed the game!
          </p>

          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6 mb-8">
            <div className="text-4xl font-bold mb-2">{completionStats.finalScore}</div>
            <div className="text-lg">Total Points</div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Game Statistics</div>
              <div className="grid grid-cols-3 gap-4 mt-2">
                <div>
                  <div className="text-lg font-bold">{completionStats.questionsCompleted}</div>
                  <div className="text-xs text-gray-500">
                    Questions Completed
                  </div>
                </div>
                <div>
                  <div className="text-lg font-bold">{completionStats.errorsRemaining}</div>
                  <div className="text-xs text-gray-500">
                    Errors Remaining
                  </div>
                </div>
                <div>
                  <div className="text-lg font-bold">{completionStats.totalFailures}</div>
                  <div className="text-xs text-gray-500">Total Failures</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-x-4">
            <button onClick={resetGame} className="btn-primary">
              Play Again
            </button>
            <button onClick={() => navigate("/")} className="btn-secondary">
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameCompletedScreen;
