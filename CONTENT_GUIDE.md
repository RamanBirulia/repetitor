# Content Management Guide

This guide explains how to manage and extend content in the Repetitor application using the JSON-based content system.

## 📁 Content Structure

All content is organized in JSON files under `src/content/`:

```
src/content/
├── articleRules.json     # Grammar rules database
├── gameSentences.json    # Practice sentences
└── config.json          # Application configuration
```

## 📖 Grammar Rules (`articleRules.json`)

### Rule Structure

```json
{
  "id": "unique-rule-identifier",
  "title": "The Rule Title",
  "category": "definite|indefinite|zero",
  "description": "Brief description of when to use this rule",
  "examples": [
    "Example sentence 1",
    "Example sentence 2"
  ],
  "explanation": "Detailed explanation of the rule",
  "difficulty": "beginner|intermediate|advanced"
}
```

### Adding a New Rule

1. Open `src/content/articleRules.json`
2. Add your rule to the `articleRules` array:

```json
{
  "id": "definite-ordinal-numbers",
  "title": "The Definite Article \"THE\" - Ordinal Numbers",
  "category": "definite",
  "description": "Use \"the\" before ordinal numbers (first, second, third, etc.)",
  "examples": [
    "She finished the first in the race.",
    "This is the third time I've been here.",
    "The second option looks better."
  ],
  "explanation": "Ordinal numbers (first, second, third, etc.) are specific positions in a sequence, making them unique and requiring 'the'.",
  "difficulty": "intermediate"
}
```

### Rule Categories

- **`definite`** - Rules for using "the"
- **`indefinite`** - Rules for using "a/an"  
- **`zero`** - Rules for using no article

### Difficulty Levels

- **`beginner`** - Basic concepts and common patterns
- **`intermediate`** - More complex rules and exceptions
- **`advanced`** - Specialized usage and edge cases

## 🎮 Game Sentences (`gameSentences.json`)

### Sentence Structure

```json
{
  "id": 1,
  "sentence": "Sentence with ___ blank to fill",
  "correctAnswer": "a|an|the|nothing",
  "explanation": "Why this answer is correct",
  "ruleId": "reference-to-rule-id",
  "difficulty": "beginner|intermediate|advanced"
}
```

### Adding a New Sentence

1. Open `src/content/gameSentences.json`
2. Add your sentence to the `gameSentences` array:

```json
{
  "id": 31,
  "sentence": "I finished ___ first in the marathon.",
  "correctAnswer": "the",
  "explanation": "Use 'the' with ordinal numbers like 'first' because they indicate a specific position.",
  "ruleId": "definite-ordinal-numbers",
  "difficulty": "intermediate"
}
```

### Answer Types

- **`a`** - Indefinite article before consonant sounds
- **`an`** - Indefinite article before vowel sounds  
- **`the`** - Definite article
- **`nothing`** - No article needed

### Linking to Rules

Always set `ruleId` to match an existing rule `id` from `articleRules.json`. This enables:
- Navigation from game to relevant rule
- Contextual help during gameplay
- Organized learning progression

## ⚙️ Configuration (`config.json`)

### Game Settings

```json
{
  "gameConfig": {
    "articleGame": {
      "defaultQuestionCount": 10,
      "maxQuestionCount": 30,
      "scoring": {
        "firstAttemptPoints": 10,
        "secondAttemptPoints": 5,
        "maxAttempts": 2
      },
      "timing": {
        "correctAnswerDisplayTime": 4000,
        "incorrectAnswerDisplayTime": 3000,
        "explanationReadingTime": 2000,
        "autoAdvanceEnabled": true
      },
      "learningFlow": {
        "showSkipButton": true,
        "pauseOnIncorrect": true,
        "reinforcementMessages": true,
        "extendedFeedback": true
      }
    }
  }
}
```

### UI Configuration

```json
{
  "uiConfig": {
    "theme": {
      "primaryColor": "blue",
      "accentColor": "purple"
    },
    "layout": {
      "maxContentWidth": "4xl"
    }
  }
}
```

### Feature Toggles

```json
{
  "features": {
    "search": {
      "enabled": true,
      "placeholder": "Search rules..."
    },
    "filtering": {
      "enabled": true,
      "defaultCategory": "all"
    }
  }
}
```

## 🛠 Using Content Utilities

### Grammar Rules

```javascript
import { 
  getRuleById, 
  getRulesByCategory,
  getFilteredRules 
} from '../utils/articleRulesUtils';

// Get specific rule
const rule = getRuleById('definite-specific');

// Get all definite article rules
const definiteRules = getRulesByCategory('definite');

// Search and filter
const filteredRules = getFilteredRules('indefinite', 'profession');
```

### Game Sentences

```javascript
import { 
  getRandomSentences,
  getSentencesByDifficulty,
  isAnswerCorrect 
} from '../utils/gameSentencesUtils';

// Get random sentences for a game
const sentences = getRandomSentences(10);

// Get beginner-level sentences
const beginnerSentences = getSentencesByDifficulty('beginner');

// Check if answer is correct
const correct = isAnswerCorrect(sentence, userAnswer);
```

### Configuration

```javascript
import { 
  getGameConfig,
  getScoringConfig,
  isFeatureEnabled,
  getTimingConfig,
  getLearningFlowConfig,
  shouldShowSkipButton,
  shouldPauseOnIncorrect
} from '../utils/contentUtils';

// Get scoring configuration
const scoring = getScoringConfig();

// Check if search is enabled
const canSearch = isFeatureEnabled('search');

// Get timing settings
const timing = getTimingConfig();

// Check learning flow settings
const showSkip = shouldShowSkipButton();
const pauseOnError = shouldPauseOnIncorrect();
```

## 🎯 Content Best Practices

### Writing Rules

1. **Clear Titles** - Use descriptive titles that indicate when to apply the rule
2. **Concise Descriptions** - One sentence summary of the rule
3. **Good Examples** - 3-4 clear examples showing the rule in action
4. **Detailed Explanations** - Explain the reasoning behind the rule

### Creating Sentences

1. **Natural Language** - Use realistic, everyday sentences
2. **Single Focus** - Each sentence should test one specific rule
3. **Clear Context** - Provide enough context to determine the correct answer
4. **Helpful Explanations** - Explain why the answer is correct

### Difficulty Progression

- **Beginner** - Common words, simple sentence structures
- **Intermediate** - More complex sentences, less obvious contexts
- **Advanced** - Specialized vocabulary, complex grammatical structures

### Learning Flow Configuration

The `learningFlow` section controls how the game handles learning:

```json
{
  "learningFlow": {
    "showSkipButton": true,        // Show skip option on incorrect answers
    "pauseOnIncorrect": true,      // Don't auto-advance on mistakes
    "reinforcementMessages": true, // Show encouraging feedback
    "extendedFeedback": true       // Provide detailed explanations
  }
}
```

### Timing Configuration

The `timing` section controls display durations:

```json
{
  "timing": {
    "correctAnswerDisplayTime": 4000,   // 4 seconds for correct answers
    "incorrectAnswerDisplayTime": 3000, // 3 seconds for incorrect attempts
    "explanationReadingTime": 2000,     // 2 seconds for reading explanations
    "autoAdvanceEnabled": true          // Enable automatic progression
  }
}
```

## 📊 Content Validation

The system includes validation utilities:

```javascript
import { validateContentIntegrity } from '../utils/contentUtils';

const validation = validateContentIntegrity();
if (!validation.isValid) {
  console.log('Content issues:', validation.issues);
}
```

## 🔄 Updating Metadata

When adding content, update the metadata in `config.json`:

```json
{
  "metadata": {
    "lastUpdated": "2024-01-01",
    "contentVersion": "1.1.0",
    "totalRules": 9,
    "totalSentences": 35
  }
}
```

## 🌐 Future Extensions

The JSON structure supports future enhancements:

- **Multi-language**: Add language-specific content files
- **Themes**: Extend configuration for custom themes  
- **Analytics**: Add metadata for tracking content performance
- **Accessibility**: Include alternative text and descriptions
- **Media**: Reference audio/visual content for pronunciation guides

## 🚀 Quick Start Checklist

To add new content:

1. ✅ Create rule in `articleRules.json`
2. ✅ Add practice sentences in `gameSentences.json` 
3. ✅ Link sentences to rules via `ruleId`
4. ✅ Update metadata counts in `config.json`
5. ✅ Test with `npm run build`
6. ✅ Validate content integrity

This structured approach ensures consistent, maintainable, and extensible content management for the Repetitor learning platform.