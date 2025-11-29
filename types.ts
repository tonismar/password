export enum GameColor {
  RED = 'red-500',
  BLUE = 'blue-500',
  GREEN = 'green-500',
  YELLOW = 'yellow-400',
  PURPLE = 'purple-500',
  ORANGE = 'orange-500',
  CYAN = 'cyan-400',
  PINK = 'pink-500',
}

export type PegColor = GameColor | null;

export enum FeedbackType {
  EXACT = 'EXACT', // Black peg (correct color, correct position)
  PARTIAL = 'PARTIAL', // White peg (correct color, wrong position)
  NONE = 'NONE'
}

export interface Guess {
  id: number;
  colors: PegColor[];
  feedback: FeedbackType[];
}

export enum GameStatus {
  PLAYING = 'PLAYING',
  WON = 'WON',
  LOST = 'LOST',
}

export interface GameState {
  secretCode: GameColor[];
  guesses: Guess[];
  currentTurn: number;
  status: GameStatus;
  selectedColor: GameColor | null; // For tapping to fill
  currentDraft: PegColor[]; // The row currently being built
  difficulty: 'normal' | 'hard';
}

export const GAME_CONFIG = {
  CODE_LENGTH: 4,
  MAX_TURNS: 10,
  AVAILABLE_COLORS: [
    GameColor.RED,
    GameColor.GREEN,
    GameColor.BLUE,
    GameColor.YELLOW,
    GameColor.PURPLE,
    GameColor.ORANGE,
  ] as GameColor[],
  AVAILABLE_COLORS_HARD: [
    GameColor.RED,
    GameColor.GREEN,
    GameColor.BLUE,
    GameColor.YELLOW,
    GameColor.PURPLE,
    GameColor.ORANGE,
    GameColor.CYAN,
    GameColor.PINK,
  ] as GameColor[],
};