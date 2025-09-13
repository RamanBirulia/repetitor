# Repetitor - Gamified English Learning

A React-based web application for learning English grammar through interactive games. Currently featuring an Article Master game to practice English articles (a, an, the).

## Features

### 🎮 Article Master Game
- Interactive card-based game for practicing English articles
- Three answer options: A/AN, THE, or NO ARTICLE
- Two-attempt system with scoring
- Learning-focused timing: extended display for correct answers
- No auto-advance on incorrect answers for better learning
- Skip button for difficult questions
- Enhanced feedback with direct links to grammar rules
- Progressive difficulty levels
- Real-time score tracking

### 📖 Grammar Rules Guide
- Comprehensive collection of article usage rules displayed as readable text
- All rules presented in a single, easy-to-read format
- Categorized by article types (definite, indefinite, zero article)
- Difficulty-based filtering (beginner, intermediate, advanced)
- Searchable rule database
- Standard text width for optimal readability
- Direct navigation from game to relevant rules

### 🎯 Gamification Elements
- Point-based scoring system
- Progress tracking
- Interactive animations and transitions
- Engaging UI with visual feedback

## Tech Stack

- **React 18** - Frontend framework
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Styling and responsive design
- **Modern ES6+** - JavaScript features

## Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd repetitor
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open your browser and navigate to `http://localhost:3000`

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run eject` - Ejects from Create React App (irreversible)

## Project Structure

```
repetitor/
├── public/
│   └── index.html          # HTML template
├── src/
│   ├── components/         # Reusable React components
│   ├── content/           # JSON-based content files
│   │   ├── articleRules.json # Grammar rules database
│   │   ├── gameSentences.json # Practice sentences
│   │   └── config.json    # Application configuration
│   ├── pages/             # Main page components
│   │   ├── HomePage.js    # Landing page
│   │   ├── ArticleGame.js # Game interface
│   │   └── RulesPage.js   # Rules browser
│   ├── utils/             # Utility functions
│   │   ├── articleRulesUtils.js # Rules data utilities
│   │   ├── gameSentencesUtils.js # Sentences data utilities
│   │   └── contentUtils.js # Configuration utilities
│   ├── App.js             # Main app component
│   ├── index.js           # React entry point
│   └── index.css          # Global styles
├── package.json           # Dependencies and scripts
├── tailwind.config.js     # Tailwind configuration
└── postcss.config.js      # PostCSS configuration
```

## Game Features
### 🎯 **Game Features**

#### **Article Master Game Flow**

1. **Question Display**: Shows a sentence with a blank space for an article
2. **Answer Selection**: Three options - "A/AN", "THE", or "NO ARTICLE"
3. **Immediate Feedback**: Visual indication of correct/incorrect answers
4. **Smart Timing**: 
   - **Correct answers**: Extended display time (4 seconds) for reinforcement
   - **Incorrect answers**: No auto-advance to allow learning time
5. **Second Chance**: Users get two attempts per question with helpful guidance
6. **Enhanced Feedback**:
   - **Success**: Encouraging message with auto-advance
   - **First failure**: Guidance to try again with explanation
   - **Final failure**: Simple link to study relevant grammar rule
7. **User Control**: Next Question button available after final incorrect attempt
8. **Scoring System**: 10 points for first attempt, 5 points for second attempt
9. **Rule Integration**: Info button and contextual links to relevant grammar rules

#### **A/AN Logic**

The game uses intelligent logic for handling "a" vs "an" articles:

- **Single Button**: Players click "A/AN" for both indefinite article cases
- **Smart Matching**: The system accepts the "A/AN" button for sentences requiring either "a" or "an"
- **Correct Display**: When showing the correct answer, it displays "A / AN" for consistency
- **Educational Value**: Explanations specify whether to use "a" (consonant sounds) or "an" (vowel sounds)
- **Examples**: 
  - "I need ___ umbrella" → Click "A/AN" (system knows it should be "an")
  - "She bought ___ car" → Click "A/AN" (system knows it should be "a")

#### **Learning-Focused Features**

The game prioritizes learning over speed:

- **Extended Learning Time**: Correct answers show for 4 seconds instead of 2
- **No Rush on Mistakes**: Incorrect final attempts don't auto-advance
- **Contextual Help**: Direct links to relevant grammar rules
- **User Control**: Next Question button for progression control
- **Encouraging Feedback**: Positive reinforcement and clear guidance
- **Visual Learning Aids**: Color-coded feedback with helpful icons

### Grammar Rules System

- **8 comprehensive rule categories** covering all major article usage patterns
- **Readable text layout** with standard width for optimal reading experience
- **Sequential presentation** - all rules displayed as numbered list
- **Direct linking** from game questions to specific rules
- **Search and filter** functionality for easy rule discovery
- **Progressive difficulty** from beginner to advanced concepts
- **Learning integration** with enhanced game feedback system

## Customization

### Adding New Sentences

Edit `src/content/gameSentences.json` to add new practice sentences:

```json
{
  "id": 31,
  "sentence": "I need to buy ___ new laptop.",
  "correctAnswer": "a",
  "explanation": "Use 'a' when mentioning something for the first time.",
  "ruleId": "indefinite-first-mention",
  "difficulty": "beginner"
}
```

### Adding New Rules

Edit `src/content/articleRules.json` to add new grammar rules:

```json
{
  "id": "new-rule-id",
  "title": "Rule Title",
  "category": "definite|indefinite|zero",
  "description": "Brief description",
  "examples": ["Example 1", "Example 2"],
  "explanation": "Detailed explanation",
  "difficulty": "beginner|intermediate|advanced"
}
```

### Content Management

All content is now organized in JSON files for easy management:

- **`src/content/articleRules.json`** - Grammar rules with examples and explanations
- **`src/content/gameSentences.json`** - Practice sentences with correct answers
- **`src/content/config.json`** - Application configuration and settings

Use the utility functions in `src/utils/` to interact with content:

```javascript
import { getRuleById, getRandomSentences } from '../utils/articleRulesUtils';
import { getSentencesByDifficulty } from '../utils/gameSentencesUtils';
import { getGameConfig } from '../utils/contentUtils';
```

### Styling Customization

The project uses Tailwind CSS with custom color schemes and animations defined in `tailwind.config.js`. Key design tokens:

- **Primary colors**: Blue gradient theme
- **Success colors**: Green for correct answers
- **Danger colors**: Red for incorrect answers
- **Custom animations**: Bounce-in, fade-in, slide-up

## Future Enhancements

- Additional grammar games (verb tenses, prepositions)
- User progress tracking and statistics  
- Difficulty-adaptive question selection
- Spaced repetition algorithm for better retention
- Multiplayer competitions
- Achievement system and learning streaks
- Audio pronunciation guides
- Personalized learning paths based on mistakes
- Content management interface for easy rule/sentence editing
- Multi-language support using JSON structure
- Advanced analytics for learning progress

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-game`)
3. Commit your changes (`git commit -am 'Add new grammar game'`)
4. Push to the branch (`git push origin feature/new-game`)
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Grammar rules based on standard English language teaching resources
- UI/UX inspired by modern gamification principles
- Built with accessibility and responsive design in mind
- JSON-based content structure for easy maintenance and scalability