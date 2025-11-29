import { GameColor, FeedbackType, GAME_CONFIG, PegColor } from '../types';

export const generateSecretCode = (isHard: boolean = false): GameColor[] => {
  const colors = isHard ? GAME_CONFIG.AVAILABLE_COLORS_HARD : GAME_CONFIG.AVAILABLE_COLORS;
  const code: GameColor[] = [];
  for (let i = 0; i < GAME_CONFIG.CODE_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * colors.length);
    code.push(colors[randomIndex]);
  }
  return code;
};

export const calculateFeedback = (code: GameColor[], guess: PegColor[]): FeedbackType[] => {
  if (guess.includes(null)) {
    // Should not happen in validation, but safe return
    return Array(GAME_CONFIG.CODE_LENGTH).fill(FeedbackType.NONE);
  }

  const safeGuess = guess as GameColor[];
  const feedback: FeedbackType[] = Array(GAME_CONFIG.CODE_LENGTH).fill(FeedbackType.NONE);
  
  const codeFrequency: Record<string, number> = {};
  const guessFrequency: Record<string, number> = {};

  // 1. Identify Exact Matches (Black Pegs)
  const codeMatchedIndices = new Set<number>();
  const guessMatchedIndices = new Set<number>();

  for (let i = 0; i < GAME_CONFIG.CODE_LENGTH; i++) {
    if (safeGuess[i] === code[i]) {
      feedback[i] = FeedbackType.EXACT;
      codeMatchedIndices.add(i);
      guessMatchedIndices.add(i);
    }
  }

  // 2. Count remaining frequencies for Partial Matches
  for (let i = 0; i < GAME_CONFIG.CODE_LENGTH; i++) {
    if (!codeMatchedIndices.has(i)) {
      const color = code[i];
      codeFrequency[color] = (codeFrequency[color] || 0) + 1;
    }
  }

  // 3. Identify Partial Matches (White Pegs)
  for (let i = 0; i < GAME_CONFIG.CODE_LENGTH; i++) {
    if (!guessMatchedIndices.has(i)) {
      const color = safeGuess[i];
      if (codeFrequency[color] && codeFrequency[color] > 0) {
        // We find a "white peg" slot. 
        // Note: The UI usually sorts pegs (Blacks first, then Whites).
        // But logic-wise, we just need to know the count.
        // However, this function maps index-to-feedback to help sorting later if needed,
        // or we return the raw counts. 
        // Standard Mastermind doesn't tell you WHICH position is the white peg.
        // So we will just return a sorted array of feedback later.
        // For now, let's mark it here.
        feedback[i] = FeedbackType.PARTIAL;
        codeFrequency[color]--;
      }
    }
  }

  // Sort feedback: Exact > Partial > None
  // This is crucial because the game doesn't tell you which peg corresponds to which feedback
  return feedback.sort((a, b) => {
    const score = (type: FeedbackType) => {
      if (type === FeedbackType.EXACT) return 2;
      if (type === FeedbackType.PARTIAL) return 1;
      return 0;
    };
    return score(b) - score(a);
  });
};