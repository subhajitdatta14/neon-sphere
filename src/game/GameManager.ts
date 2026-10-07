import * as THREE from 'three';
import { GameScene } from './GameScene';
import { Collision } from './Collision';
import { ScoreManager } from './ScoreManager';
import { sounds } from '../sound/SoundManager';
import { GameState } from '../types';

export interface GameCallbacks {
  onScoreChange: (score: number) => void;
  onStateChange: (state: GameState) => void;
  onSpeedUp: () => void;
  onCountdown: (val: string) => void;
  onSpeedChange?: (speedKmh: number) => void;
}

export class GameManager {
  public gameScene: GameScene;
  public scoreManager: ScoreManager;
  public state: GameState = 'MENU';

  private callbacks: GameCallbacks;
  private animFrameId: number | null = null;
  private clock: THREE.Clock;

  // Controls state
  private inputLeft: boolean = false;
  private inputRight: boolean = false;

  // Gameplay parameters
  private baseSpeed: number = 25.0; // Comfortable starting speed (~70 KM/H on HUD)
  private targetSpeed: number = 25.0;
  private currentSpeed: number = 0.0; // Speed starts at 0 (Zero) and ramps up
  private maxSpeed: number = 56.0;
  private speedLevel: number = 1;
  private distanceAccumulator: number = 0;
  private scoreDistanceThreshold: number = 85.0; // Points increase with distance

  // Survival time-based progression
  private survivalTime: number = 0.0;
  private speedUpInterval: number = 18.0; // Every 18 seconds (15-20s window), increase speed
  private lastSpeedUpTime: number = 0.0;

  // State timers
  private countdownTimer: number = 0;
  private crashTimer: number = 0;

  constructor(container: HTMLElement, callbacks: GameCallbacks) {
    this.callbacks = callbacks;
    this.gameScene = new GameScene(container);
    this.scoreManager = new ScoreManager();
    this.clock = new THREE.Clock();

    this.bindInputs();
    this.loop = this.loop.bind(this);
    this.startLoop();
  }

  private bindInputs(): void {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        this.inputLeft = true;
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        this.inputRight = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        this.inputLeft = false;
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        this.inputRight = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Store cleanup
    this.cleanupInputs = () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }

  private cleanupInputs: () => void = () => {};

  public setTouchInput(left: boolean, right: boolean): void {
    this.inputLeft = left;
    this.inputRight = right;
  }

  public startCountdown(): void {
    this.state = 'COUNTDOWN';
    this.callbacks.onStateChange('COUNTDOWN');
    this.resetGameplay();

    // Sequence: 3, 2, 1, GO!
    let count = 3;
    this.callbacks.onCountdown('3');
    sounds.playCountdownBeep(false);

    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        this.callbacks.onCountdown(count.toString());
        sounds.playCountdownBeep(false);
      } else if (count === 0) {
        this.callbacks.onCountdown('GO!');
        sounds.playCountdownBeep(true);
      } else {
        clearInterval(interval);
        this.startGameplay();
      }
    }, 850);
  }

  private startGameplay(): void {
    this.state = 'PLAYING';
    this.callbacks.onStateChange('PLAYING');
    this.callbacks.onCountdown('');
    this.currentSpeed = 0.0; // Start at 0 KM/H and smoothly accelerate!
    this.callbacks.onSpeedChange?.(0);
  }

  public resetGameplay(): void {
    this.scoreManager.resetScore();
    this.callbacks.onScoreChange(0);
    this.currentSpeed = 0.0; // Start speed at 0 and accelerate smoothly
    this.callbacks.onSpeedChange?.(0);
    this.targetSpeed = this.baseSpeed;
    this.speedLevel = 1;
    this.survivalTime = 0.0;
    this.lastSpeedUpTime = 0.0;
    this.distanceAccumulator = 0;
    this.crashTimer = 0;
    this.inputLeft = false;
    this.inputRight = false;

    this.gameScene.player.reset();
    this.gameScene.world.reset();
    this.gameScene.obstacles.reset();
  }

  private onPlayerCollision(): void {
    if (this.state !== 'PLAYING') return;

    this.state = 'CRASHING';
    this.callbacks.onStateChange('CRASHING');
    sounds.playCrash();
    this.gameScene.triggerScreenShake(0.85);
    this.gameScene.player.explode();
    this.crashTimer = 0.75; // show explosion for 0.75s before game over screen
  }

  private onPlayerFall(): void {
    if (this.state !== 'PLAYING') return;

    this.state = 'CRASHING';
    this.callbacks.onStateChange('CRASHING');
    sounds.playCrash();
    this.crashTimer = 0.85;
  }

  private loop(): void {
    this.animFrameId = requestAnimationFrame(this.loop);

    let dt = this.clock.getDelta();
    // Prevent huge delta when tab was unfocused
    if (dt > 0.1) dt = 0.1;

    let inputX = 0;
    if (this.inputLeft) inputX -= 1;
    if (this.inputRight) inputX += 1;

    if (this.state === 'PLAYING') {
      // 1. Time-based survival progression: accumulate survival time
      this.survivalTime += dt;

      // Every 18 seconds (15-20s window), increase speed level smoothly
      if (this.survivalTime - this.lastSpeedUpTime >= this.speedUpInterval) {
        this.lastSpeedUpTime += this.speedUpInterval;
        this.speedLevel++;
        const speedIncrement = 2.4;
        this.targetSpeed = Math.min(this.maxSpeed, this.baseSpeed + (this.speedLevel - 1) * speedIncrement);
        sounds.playSpeedUp();
        this.callbacks.onSpeedUp();
      }

      // Smoothly ramp speed up towards target speed without sudden velocity jumps
      if (this.currentSpeed < this.targetSpeed) {
        this.currentSpeed = Math.min(this.targetSpeed, this.currentSpeed + dt * 8.0);
      }

      // 2. Update Player
      this.gameScene.player.update(dt, inputX, this.currentSpeed);

      // Report current speed in KM/H starting strictly from 0 and smoothly climbing
      const speedKmh = Math.round(this.currentSpeed * 2.8);
      this.callbacks.onSpeedChange?.(speedKmh);

      // Check fall off track
      if (this.gameScene.player.isFalling && this.gameScene.player.y < -3.0) {
        this.onPlayerFall();
      }

      // 3. Update World and Obstacles with smoothly scaling survival difficulty
      // Starts at 1.0 (easy/comfortable) and increases gradually over survival time
      const difficulty = 1.0 + (this.survivalTime / 18.0) * 0.42;
      this.gameScene.world.update(dt, this.currentSpeed);
      this.gameScene.obstacles.update(dt, this.currentSpeed, difficulty, this.gameScene.player.x);

      // 4. Collision Detection
      const hit = Collision.checkPlayerObstacles(this.gameScene.player, this.gameScene.obstacles);
      if (hit) {
        this.onPlayerCollision();
      }

      // 5. Scoring: Points increase with distance traversed
      const stepDist = this.currentSpeed * dt;
      this.distanceAccumulator += stepDist;

      if (this.distanceAccumulator >= this.scoreDistanceThreshold) {
        this.distanceAccumulator -= this.scoreDistanceThreshold;
        const newScore = this.scoreManager.addScore(1);
        this.callbacks.onScoreChange(newScore);
        sounds.playScoreTick();
      }
    } else if (this.state === 'CRASHING') {
      // Slowly roll/explode during crash phase
      this.gameScene.player.update(dt, 0, this.currentSpeed * 0.3);
      this.gameScene.world.update(dt, this.currentSpeed * 0.2);

      this.crashTimer -= dt;
      if (this.crashTimer <= 0) {
        this.state = 'GAME_OVER';
        const finalScore = this.scoreManager.getScore();
        this.scoreManager.recordRun(finalScore);
        this.callbacks.onStateChange('GAME_OVER');
      }
    } else if (this.state === 'MENU' || this.state === 'COUNTDOWN') {
      // Idle world animation in background
      this.gameScene.world.update(dt, 12.0);
      this.gameScene.player.update(dt, 0, 12.0);
    }

    // Camera update & render
    const speedRatio = (this.currentSpeed - this.baseSpeed) / (this.maxSpeed - this.baseSpeed);
    this.gameScene.updateCamera(dt, Math.max(0, speedRatio));
    this.gameScene.render();
  }

  private startLoop(): void {
    if (!this.animFrameId) {
      this.clock.start();
      this.loop();
    }
  }

  public dispose(): void {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    this.cleanupInputs();
    this.gameScene.dispose();
  }
}
