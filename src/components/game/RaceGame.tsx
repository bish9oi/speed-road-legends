import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameDashboard } from './GameDashboard';
import { GameControls } from './GameControls';
import { GameCar, Car, Position } from '@/types/game';
import { useToast } from '@/hooks/use-toast';

interface RaceGameProps {
  selectedCar: Car;
  level: number;
  timeLimit: number;
  onGameOver: (score: number, completed: boolean) => void;
  onPause: () => void;
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const LANES = 4;
const LANE_WIDTH = CANVAS_WIDTH / LANES;

export const RaceGame: React.FC<RaceGameProps> = ({
  selectedCar,
  level,
  timeLimit,
  onGameOver,
  onPause
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const { toast } = useToast();

  const [gameState, setGameState] = useState({
    playerCar: {
      ...selectedCar,
      position: { x: LANE_WIDTH * 1.5, y: CANVAS_HEIGHT - 100 },
      speed: 0,
      lane: 1,
      isPlayer: true
    } as GameCar,
    otherCars: [] as GameCar[],
    score: 0,
    timeRemaining: timeLimit,
    lives: 3,
    isGameRunning: true,
    roadOffset: 0,
    gameSpeed: 1 + (level - 1) * 0.3
  });

  const [controls, setControls] = useState({
    isAccelerating: false,
    isBraking: false,
    movingLeft: false,
    movingRight: false
  });

  const spawnCar = useCallback(() => {
    const lane = Math.floor(Math.random() * LANES);
    const cars = [
      { emoji: '🚗', color: '#ff6b6b' },
      { emoji: '🚙', color: '#4ecdc4' },
      { emoji: '🚐', color: '#45b7d1' },
      { emoji: '🏎️', color: '#96ceb4' },
      { emoji: '🚚', color: '#feca57' }
    ];
    const carType = cars[Math.floor(Math.random() * cars.length)];
    
    return {
      id: `car-${Date.now()}-${Math.random()}`,
      name: 'NPC Car',
      color: carType.color,
      maxSpeed: 60 + Math.random() * 40,
      acceleration: 5,
      handling: 5,
      emoji: carType.emoji,
      position: { x: lane * LANE_WIDTH + LANE_WIDTH / 2, y: -50 },
      speed: 40 + Math.random() * 30,
      lane,
      isPlayer: false
    } as GameCar;
  }, []);

  const checkCollision = useCallback((car1: GameCar, car2: GameCar) => {
    const dx = car1.position.x - car2.position.x;
    const dy = car1.position.y - car2.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < 40; // Collision threshold
  }, []);

  const updateGame = useCallback(() => {
    setGameState(prev => {
      if (!prev.isGameRunning) return prev;

      const newState = { ...prev };

      // Update player car based on controls
      if (controls.isAccelerating && newState.playerCar.speed < selectedCar.maxSpeed) {
        newState.playerCar.speed += selectedCar.acceleration * 0.5;
      } else if (controls.isBraking) {
        newState.playerCar.speed = Math.max(0, newState.playerCar.speed - 15);
      } else {
        newState.playerCar.speed = Math.max(20, newState.playerCar.speed - 2);
      }

      // Handle lane changes
      if (controls.movingLeft && newState.playerCar.lane > 0) {
        newState.playerCar.lane -= 1;
        newState.playerCar.position.x = newState.playerCar.lane * LANE_WIDTH + LANE_WIDTH / 2;
      }
      if (controls.movingRight && newState.playerCar.lane < LANES - 1) {
        newState.playerCar.lane += 1;
        newState.playerCar.position.x = newState.playerCar.lane * LANE_WIDTH + LANE_WIDTH / 2;
      }

      // Update road animation
      newState.roadOffset += newState.playerCar.speed * 0.1;

      // Spawn new cars occasionally
      if (Math.random() < 0.02 * newState.gameSpeed) {
        newState.otherCars.push(spawnCar());
      }

      // Update other cars
      newState.otherCars = newState.otherCars
        .map(car => ({
          ...car,
          position: {
            ...car.position,
            y: car.position.y + (newState.playerCar.speed - car.speed) * 0.1
          }
        }))
        .filter(car => car.position.y < CANVAS_HEIGHT + 100);

      // Check collisions
      for (const car of newState.otherCars) {
        if (checkCollision(newState.playerCar, car)) {
          newState.lives -= 1;
          newState.otherCars = newState.otherCars.filter(c => c.id !== car.id);
          toast({
            title: "Collision!",
            description: `Lives remaining: ${newState.lives}`,
            variant: "destructive"
          });
          
          if (newState.lives <= 0) {
            newState.isGameRunning = false;
            return newState;
          }
          break;
        }
      }

      // Update score and time
      newState.score += Math.floor(newState.playerCar.speed * 0.1);
      
      return newState;
    });
  }, [controls, selectedCar, spawnCar, checkCollision, toast]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw road
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw lane lines
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.setLineDash([20, 20]);
    ctx.lineDashOffset = -gameState.roadOffset % 40;

    for (let i = 1; i < LANES; i++) {
      ctx.beginPath();
      ctx.moveTo(i * LANE_WIDTH, 0);
      ctx.lineTo(i * LANE_WIDTH, CANVAS_HEIGHT);
      ctx.stroke();
    }

    // Draw side lines
    ctx.setLineDash([]);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#ffff00';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, CANVAS_HEIGHT);
    ctx.moveTo(CANVAS_WIDTH, 0);
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.stroke();

    // Draw cars
    const drawCar = (car: GameCar, isPlayer: boolean = false) => {
      ctx.font = isPlayer ? '40px Arial' : '30px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(car.emoji, car.position.x, car.position.y);
      
      if (isPlayer) {
        // Draw glow effect for player
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 10;
        ctx.fillText(car.emoji, car.position.x, car.position.y);
        ctx.shadowBlur = 0;
      }
    };

    // Draw other cars
    gameState.otherCars.forEach(car => drawCar(car));
    
    // Draw player car
    drawCar(gameState.playerCar, true);

  }, [gameState]);

  // Game loop
  useEffect(() => {
    const gameLoop = () => {
      updateGame();
      draw();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    if (gameState.isGameRunning) {
      gameLoop();
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [updateGame, draw, gameState.isGameRunning]);

  // Timer
  useEffect(() => {
    if (!gameState.isGameRunning) return;

    const timer = setInterval(() => {
      setGameState(prev => {
        const newTime = prev.timeRemaining - 1;
        if (newTime <= 0) {
          prev.isGameRunning = false;
          onGameOver(prev.score, true);
        }
        return { ...prev, timeRemaining: newTime };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.isGameRunning, onGameOver]);

  // Check game over
  useEffect(() => {
    if (!gameState.isGameRunning && gameState.lives <= 0) {
      onGameOver(gameState.score, false);
    }
  }, [gameState.isGameRunning, gameState.lives, gameState.score, onGameOver]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'arrowup':
        case 'w':
          setControls(prev => ({ ...prev, isAccelerating: true }));
          break;
        case 'arrowdown':
        case 's':
        case ' ':
          setControls(prev => ({ ...prev, isBraking: true }));
          break;
        case 'arrowleft':
        case 'a':
          setControls(prev => ({ ...prev, movingLeft: true }));
          break;
        case 'arrowright':
        case 'd':
          setControls(prev => ({ ...prev, movingRight: true }));
          break;
        case 'p':
          onPause();
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'arrowup':
        case 'w':
          setControls(prev => ({ ...prev, isAccelerating: false }));
          break;
        case 'arrowdown':
        case 's':
        case ' ':
          setControls(prev => ({ ...prev, isBraking: false }));
          break;
        case 'arrowleft':
        case 'a':
          setControls(prev => ({ ...prev, movingLeft: false }));
          break;
        case 'arrowright':
        case 'd':
          setControls(prev => ({ ...prev, movingRight: false }));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onPause]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative">
      <GameDashboard 
        speed={gameState.playerCar.speed}
        maxSpeed={selectedCar.maxSpeed}
        score={gameState.score}
        level={level}
        timeRemaining={gameState.timeRemaining}
        lives={gameState.lives}
      />
      
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border-2 border-border rounded-lg shadow-car max-w-full max-h-[70vh] object-contain"
      />
      
      <GameControls 
        onAccelerate={() => setControls(prev => ({ ...prev, isAccelerating: true }))}
        onBrake={() => setControls(prev => ({ ...prev, isBraking: true }))}
        onMoveLeft={() => setControls(prev => ({ ...prev, movingLeft: true }))}
        onMoveRight={() => setControls(prev => ({ ...prev, movingRight: true }))}
        isAccelerating={controls.isAccelerating}
        isBraking={controls.isBraking}
        onPause={onPause}
      />
    </div>
  );
};