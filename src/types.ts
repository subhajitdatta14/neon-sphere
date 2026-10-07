export type GameState = 'MENU' | 'COUNTDOWN' | 'PLAYING' | 'CRASHING' | 'GAME_OVER' | 'LEADERBOARD' | 'HOW_TO_PLAY';

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  date: string;
}

export interface GameSettings {
  soundEnabled: boolean;
  sensitivity: number;
}
