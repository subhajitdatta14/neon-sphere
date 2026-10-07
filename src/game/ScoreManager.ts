import { LeaderboardEntry } from '../types';

const LEADERBOARD_KEY = 'neon_sphere_leaderboard_v1';
const HIGH_SCORE_KEY = 'neon_sphere_high_score_v1';

export class ScoreManager {
  private currentScore: number = 0;
  private highScore: number = 0;
  private sessionLeaderboard: LeaderboardEntry[] = [];
  private runCount: number = 0;

  constructor() {
    this.currentScore = 0;
    this.highScore = 0;
    this.sessionLeaderboard = [];
    this.runCount = 0;

    // Clear any previous records from storage so refreshing/opening the website always starts fresh with zero previous data
    try {
      localStorage.removeItem(HIGH_SCORE_KEY);
      localStorage.removeItem(LEADERBOARD_KEY);
    } catch {
      // ignore
    }
  }

  public resetScore(): void {
    this.currentScore = 0;
  }

  public addScore(amount: number = 1): number {
    this.currentScore += amount;
    if (this.currentScore > this.highScore) {
      this.highScore = this.currentScore;
    }
    return this.currentScore;
  }

  public getScore(): number {
    return this.currentScore;
  }

  public getHighScore(): number {
    return this.highScore;
  }

  public getLeaderboard(): LeaderboardEntry[] {
    return this.sessionLeaderboard;
  }

  public recordRun(score: number): LeaderboardEntry[] {
    this.runCount += 1;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newEntry: LeaderboardEntry = {
      id: `${Date.now()}_${this.runCount}`,
      name: `RUN #${this.runCount}`,
      score,
      date: timeStr,
    };
    this.sessionLeaderboard.push(newEntry);
    this.sessionLeaderboard.sort((a, b) => b.score - a.score);
    return this.sessionLeaderboard;
  }

  public addLeaderboardEntry(name: string, score: number): LeaderboardEntry[] {
    this.runCount += 1;
    const cleanName = (name.trim() || `RUN #${this.runCount}`).toUpperCase().slice(0, 12);
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newEntry: LeaderboardEntry = {
      id: `${Date.now()}_${this.runCount}`,
      name: cleanName,
      score,
      date: timeStr,
    };
    this.sessionLeaderboard.push(newEntry);
    this.sessionLeaderboard.sort((a, b) => b.score - a.score);
    return this.sessionLeaderboard;
  }

  public isHighScore(score: number): boolean {
    if (this.sessionLeaderboard.length < 10) return true;
    return score > this.sessionLeaderboard[this.sessionLeaderboard.length - 1].score;
  }
}
