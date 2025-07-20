export interface Car {
  id: string;
  name: string;
  color: string;
  maxSpeed: number;
  acceleration: number;
  handling: number;
  emoji: string;
}

export interface Position {
  x: number;
  y: number;
}

export interface GameCar extends Car {
  position: Position;
  speed: number;
  lane: number;
  isPlayer: boolean;
}

export interface GameState {
  currentScreen: 'menu' | 'path-selection' | 'car-selection' | 'racing' | 'game-over';
  selectedPath: string | null;
  selectedCar: Car | null;
  level: number;
  score: number;
  lives: number;
  timeRemaining: number;
  isGameRunning: boolean;
  gameSpeed: number;
}

export interface Path {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
  emoji: string;
}