import React from "react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  const games = [
    {
      id: "articles",
      title: "Article Master",
      description:
        "Practice English articles (a, an, the) with interactive card game",
      icon: "📚",
      route: "/article-game",
      difficulty: "Beginner",
      color: "from-blue-500 to-purple-600",
    },
    {
      id: "coming-soon-1",
      title: "Verb Tenses",
      description: "Master English verb tenses with fun exercises",
      icon: "⏰",
      route: "#",
      difficulty: "Coming Soon",
      color: "from-green-500 to-teal-600",
      disabled: true,
    },
    {
      id: "coming-soon-2",
      title: "Prepositions",
      description: "Learn prepositions through interactive games",
      icon: "📍",
      route: "#",
      difficulty: "Coming Soon",
      color: "from-orange-500 to-red-600",
      disabled: true,
    },
  ];

  const handleGameClick = (game) => {
    if (!game.disabled) {
      navigate(game.route);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              🎓 Repetitor for Natushka 🎓
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Practice, play, and progress with comprehensive rule guides!
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Choose Your Learning Adventure
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Select a game below to start improving your English skills.
            <br />
            Need help? Check our comprehensive grammar guide!
          </p>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {games.map((game) => (
            <div
              key={game.id}
              className={`game-card relative overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 ${
                game.disabled ? "opacity-60 cursor-not-allowed" : ""
              }`}
              onClick={() => handleGameClick(game)}
            >
              {/* Background Gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-10`}
              ></div>

              {/* Content */}
              <div className="relative z-10">
                <div className="text-center mb-4">
                  <span className="text-6xl">{game.icon}</span>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {game.title}
                </h3>

                <p className="text-gray-600 mb-4 line-clamp-2">
                  {game.description}
                </p>

                <div className="flex justify-between items-center gap-4">
                  <span
                    className={`px-4 py-1 rounded-full text-sm font-medium ${
                      game.disabled
                        ? "bg-gray-100 text-gray-500"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {game.difficulty}
                  </span>

                  {!game.disabled && (
                    <button className="btn-primary">Start →</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Features Section */}
        <div className="p-8 mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Why Choose Repetitor?
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎯</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Targeted Practice
              </h4>
              <p className="text-gray-600">
                Focus on specific grammar rules with carefully designed
                exercises
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🏆</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Gamified Learning
              </h4>
              <p className="text-gray-600">
                Earn points, track progress, and stay motivated through game
                elements
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📈</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Progressive Difficulty
              </h4>
              <p className="text-gray-600">
                Start with basics and gradually advance to complex grammar
                concepts
              </p>
            </div>
          </div>
        </div>

        {/* Quick Access */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Need Help?
          </h3>
          <button
            onClick={() => navigate("/rules")}
            className="btn-secondary mr-4"
          >
            📖 Complete Grammar Guide
          </button>
          <button
            onClick={() => navigate("/article-game")}
            className="btn-primary"
          >
            🚀 Start Learning
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600">
            © 2025 Repetitor - English Learning Games. Made with ❤️ for
            language learners.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
