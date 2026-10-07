import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameManager } from '../game/GameManager';
import { GameState, LeaderboardEntry } from '../types';
import { HeaderHUD } from '../components/HeaderHUD';
import { StartScreen } from './StartScreen';
import { GameOverScreen } from './GameOverScreen';
import { LeaderboardScreen } from './LeaderboardScreen';
import { HowToPlayScreen } from './HowToPlayScreen';
import { sounds } from '../sound/SoundManager';

export const GameScreen: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gameManagerRef = useRef<GameManager | null>(null);

  const [gameState, setGameState] = useState<GameState>('MENU');
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [speedKmh, setSpeedKmh] = useState<number>(0);
  const [countdownText, setCountdownText] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [touchLeftActive, setTouchLeftActive] = useState<boolean>(false);
  const [touchRightActive, setTouchRightActive] = useState<boolean>(false);

  // Initialize Three.js Game Manager
  useEffect(() => {
    if (!containerRef.current) return;

    const gm = new GameManager(containerRef.current, {
      onScoreChange: (newScore) => {
        setScore(newScore);
        if (gameManagerRef.current) {
          setHighScore(gameManagerRef.current.scoreManager.getHighScore());
        }
      },
      onSpeedChange: (kmh) => {
        setSpeedKmh(kmh);
      },
      onStateChange: (state) => {
        setGameState(state);
      },
      onSpeedUp: () => {
        // No screen speed up popup
      },
      onCountdown: (val) => {
        setCountdownText(val);
      },
    });

    gameManagerRef.current = gm;
    setHighScore(gm.scoreManager.getHighScore());
    setLeaderboard(gm.scoreManager.getLeaderboard());

    return () => {
      gm.dispose();
    };
  }, []);

  const handleStartGame = useCallback(() => {
    if (gameManagerRef.current) {
      gameManagerRef.current.startCountdown();
    }
  }, []);

  const handlePlayAgain = useCallback(() => {
    if (gameManagerRef.current) {
      gameManagerRef.current.startCountdown();
    }
  }, []);

  const handleOpenMenu = useCallback(() => {
    if (gameManagerRef.current) {
      gameManagerRef.current.state = 'MENU';
      setGameState('MENU');
    }
  }, []);

  const handleOpenLeaderboard = useCallback(() => {
    if (gameManagerRef.current) {
      setLeaderboard(gameManagerRef.current.scoreManager.getLeaderboard());
    }
    setGameState('LEADERBOARD');
  }, []);

  const handleOpenHowToPlay = useCallback(() => {
    setGameState('HOW_TO_PLAY');
  }, []);

  const handleBackToMenu = useCallback(() => {
    if (gameManagerRef.current) {
      gameManagerRef.current.state = 'MENU';
    }
    setGameState('MENU');
  }, []);

  const handleToggleSound = useCallback(() => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    sounds.setSoundEnabled(nextState);
    if (nextState) {
      sounds.playButtonClick();
    }
  }, [soundEnabled]);

  const handleSaveScore = useCallback((name: string) => {
    if (gameManagerRef.current) {
      const updated = gameManagerRef.current.scoreManager.addLeaderboardEntry(name, score);
      setLeaderboard(updated);
      setHighScore(gameManagerRef.current.scoreManager.getHighScore());
    }
  }, [score]);

  // Mobile Touch Handlers
  const handleTouchStart = (side: 'left' | 'right') => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (gameState !== 'PLAYING') return;

    if (side === 'left') {
      setTouchLeftActive(true);
      gameManagerRef.current?.setTouchInput(true, false);
    } else {
      setTouchRightActive(true);
      gameManagerRef.current?.setTouchInput(false, true);
    }
  };

  const handleTouchEnd = (side: 'left' | 'right') => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (side === 'left') {
      setTouchLeftActive(false);
      gameManagerRef.current?.setTouchInput(false, touchRightActive);
    } else {
      setTouchRightActive(false);
      gameManagerRef.current?.setTouchInput(touchLeftActive, false);
    }
  };

  return (
    <div className="relative w-screen h-screen h-[100dvh] overflow-hidden bg-[#05020D] text-white select-none">
      {/* 3D Three.js Container */}
      <div ref={containerRef} className="absolute inset-0 z-0 w-full h-full" />

      {/* Retro CRT Scanline Overlay */}
      <div className="absolute inset-0 scanlines z-10 pointer-events-none opacity-40" />

      {/* Crash Hot Magenta Flash */}
      {gameState === 'CRASHING' && (
        <div className="absolute inset-0 bg-[#FF2BD6]/30 z-20 pointer-events-none animate-pulse" />
      )}

      {/* In-Game HUD (visible during countdown, playing, crashing) */}
      {(gameState === 'PLAYING' || gameState === 'COUNTDOWN' || gameState === 'CRASHING') && (
        <HeaderHUD
          score={score}
          highScore={highScore}
          speedKmh={speedKmh}
          countdownText={countdownText}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          onOpenMenu={handleOpenMenu}
          gameState={gameState}
        />
      )}

      {/* Transparent Touch Steering Zones for Mobile / Tablet */}
      {gameState === 'PLAYING' && (
        <div className="absolute inset-0 z-15 flex pointer-events-auto touch-none" style={{ touchAction: 'none' }}>
          {/* Left Touch Zone */}
          <div
            onTouchStart={handleTouchStart('left')}
            onTouchEnd={handleTouchEnd('left')}
            onMouseDown={handleTouchStart('left')}
            onMouseUp={handleTouchEnd('left')}
            style={{ touchAction: 'none', WebkitTapHighlightColor: 'transparent' }}
            className="flex-1 h-full cursor-pointer touch-none bg-transparent select-none outline-none"
          />
          {/* Right Touch Zone */}
          <div
            onTouchStart={handleTouchStart('right')}
            onTouchEnd={handleTouchEnd('right')}
            onMouseDown={handleTouchStart('right')}
            onMouseUp={handleTouchEnd('right')}
            style={{ touchAction: 'none', WebkitTapHighlightColor: 'transparent' }}
            className="flex-1 h-full cursor-pointer touch-none bg-transparent select-none outline-none"
          />
        </div>
      )}

      {/* Screen Overlays */}
      {gameState === 'MENU' && (
        <StartScreen
          highScore={highScore}
          onPlay={handleStartGame}
          onOpenLeaderboard={handleOpenLeaderboard}
          onOpenHowToPlay={handleOpenHowToPlay}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
        />
      )}

      {gameState === 'GAME_OVER' && (
        <GameOverScreen
          score={score}
          highScore={highScore}
          onPlayAgain={handlePlayAgain}
          onOpenLeaderboard={handleOpenLeaderboard}
          onBackToMenu={handleBackToMenu}
          onSaveScore={handleSaveScore}
        />
      )}

      {gameState === 'LEADERBOARD' && (
        <LeaderboardScreen
          entries={leaderboard}
          onBack={handleBackToMenu}
        />
      )}

      {gameState === 'HOW_TO_PLAY' && (
        <HowToPlayScreen
          onBack={handleBackToMenu}
        />
      )}
    </div>
  );
};
