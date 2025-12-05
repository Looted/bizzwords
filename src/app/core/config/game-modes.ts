import { GameMode } from '../models/game-config.model';
import { LanguageService } from '../../services/language.service';

// Helper function to map language codes to LanguageField
function mapLanguageToField(language: string): string {
  switch (language) {
    case 'pl': return 'polish';
    case 'es': return 'spanish';
    case 'en':
    case 'de':
    case 'fr':
    default: return 'polish'; // Default to polish for unsupported languages
  }
}

// Factory function to create game modes with dynamic language configuration
export function createStandardGameMode(languageService: LanguageService): GameMode {
  const currentLanguage = mapLanguageToField(languageService.currentLanguage()) as 'polish' | 'spanish';
  return {
    id: 'standard',
    description: 'Classic Learning Mode',
    rounds: [
      {
        id: 'recognition',
        name: 'Recognition',
        layout: {
          templateId: 'flashcard_standard',
          dataMap: {
            primary: 'english',
            secondary: currentLanguage
          }
        },
        inputSource: 'deck_start',
        completionCriteria: {
          requiredSuccesses: 1
        },
        failureBehavior: {
          action: 'requeue',
          strategy: 'static_offset',
          params: [3]
        }
      },
      {
        id: 'recall',
        name: 'Recall',
        layout: {
          templateId: 'flashcard_standard',
          dataMap: {
            primary: currentLanguage,
            secondary: 'english'
          }
        },
        inputSource: 'deck_start',
        completionCriteria: {
          requiredSuccesses: 1
        },
        failureBehavior: {
          action: 'requeue',
          strategy: 'static_offset',
          params: [3]
        }
      },
      {
        id: 'writing',
        name: 'Writing',
        layout: {
          templateId: 'typing_challenge',
          dataMap: {
            primary: currentLanguage,
            secondary: 'english'
          }
        },
        inputSource: 'deck_start',
        completionCriteria: {
          requiredSuccesses: 1
        },
        failureBehavior: {
          action: 'requeue',
          strategy: 'static_offset',
          params: [3]
        }
      }
    ]
  };
}

// Factory function to create Blitz mode with dynamic language configuration
export function createBlitzGameMode(languageService: LanguageService): GameMode {
  const currentLanguage = mapLanguageToField(languageService.currentLanguage()) as 'polish' | 'spanish';
  return {
    id: 'blitz',
    description: 'Blitz Mode - Fast Flipping',
    rounds: [
      {
        id: 'recognition',
        name: 'Recognition',
        layout: {
          templateId: 'flashcard_standard',
          dataMap: {
            primary: 'english',
            secondary: currentLanguage
          }
        },
        inputSource: 'deck_start',
        completionCriteria: {
          requiredSuccesses: 1
        },
        failureBehavior: {
          action: 'requeue',
          strategy: 'static_offset',
          params: [3]
        }
      },
      {
        id: 'recall',
        name: 'Recall',
        layout: {
          templateId: 'flashcard_standard',
          dataMap: {
            primary: currentLanguage,
            secondary: 'english'
          }
        },
        inputSource: 'deck_start',
        completionCriteria: {
          requiredSuccesses: 1
        },
        failureBehavior: {
          action: 'requeue',
          strategy: 'static_offset',
          params: [3]
        }
      }
    ]
  };
}
