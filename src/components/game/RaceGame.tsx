import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameDashboard } from './GameDashboard';
import { EnhancedGameControls } from './EnhancedGameControls';
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
    powerUps: [] as Array<{id: string, type: 'boost' | 'shield' | 'points', position: Position, collected: boolean}>,
    score: 0,
    timeRemaining: timeLimit,
    lives: 3,
    isGameRunning: true,
    roadOffset: 0,
    gameSpeed: 1 + (level - 1) * 0.3,
    boost: 0,
    shield: 0,
    combo: 0,
    weather: 'clear' as 'clear' | 'rain' | 'fog',
    nitroCount: 3
  });

  const [controls, setControls] = useState({
    isAccelerating: false,
    isBraking: false,
    movingLeft: false,
    movingRight: false,
    usingNitro: false
  });

  const spawnCar = useCallback(() => {
    const lane = Math.floor(Math.random() * LANES);
    const cars = [
      { emoji: '🚗', color: '#ff6b6b', aggressive: false },
      { emoji: '🚙', color: '#4ecdc4', aggressive: false },
      { emoji: '🚐', color: '#45b7d1', aggressive: false },
      { emoji: '🏎️', color: '#96ceb4', aggressive: true },
      { emoji: '🚚', color: '#feca57', aggressive: false },
      { emoji: '🏁', color: '#e74c3c', aggressive: true },
      { emoji: '🚓', color: '#3498db', aggressive: true }
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
      speed: carType.aggressive ? 50 + Math.random() * 40 : 40 + Math.random() * 30,
      lane,
      isPlayer: false
    } as GameCar;
  }, []);

  const spawnPowerUp = useCallback(() => {
    const lane = Math.floor(Math.random() * LANES);
    const types = ['boost', 'shield', 'points'] as const;
    const type = types[Math.floor(Math.random() * types.length)];
    
    return {
      id: `powerup-${Date.now()}-${Math.random()}`,
      type,
      position: { x: lane * LANE_WIDTH + LANE_WIDTH / 2, y: -30 },
      collected: false
    };
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
      let speedMultiplier = 1;

      // Apply boost effects
      if (newState.boost > 0) {
        speedMultiplier = 1.5;
        newState.boost -= 1;
      }

      // Apply nitro effects
      if (controls.usingNitro && newState.nitroCount > 0) {
        speedMultiplier = 2;
        newState.nitroCount -= 0.1;
      }

      // Weather effects
      if (newState.weather === 'rain') {
        speedMultiplier *= 0.8;
      } else if (newState.weather === 'fog') {
        speedMultiplier *= 0.9;
      }

      // Update player car based on controls
      const maxSpeed = selectedCar.maxSpeed * speedMultiplier;
      if (controls.isAccelerating && newState.playerCar.speed < maxSpeed) {
        newState.playerCar.speed += selectedCar.acceleration * 0.5 * speedMultiplier;
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

      // Spawn power-ups occasionally
      if (Math.random() < 0.008) {
        newState.powerUps.push(spawnPowerUp());
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

      // Update power-ups
      newState.powerUps = newState.powerUps
        .map(powerUp => ({
          ...powerUp,
          position: {
            ...powerUp.position,
            y: powerUp.position.y + newState.playerCar.speed * 0.1
          }
        }))
        .filter(powerUp => powerUp.position.y < CANVAS_HEIGHT + 50);

      // Check power-up collection
      for (const powerUp of newState.powerUps) {
        const dx = newState.playerCar.position.x - powerUp.position.x;
        const dy = newState.playerCar.position.y - powerUp.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 30 && !powerUp.collected) {
          powerUp.collected = true;
          
          switch (powerUp.type) {
            case 'boost':
              newState.boost = 180; // 3 seconds at 60fps
              toast({ title: "Speed Boost!", description: "3 seconds of extra speed!" });
              break;
            case 'shield':
              newState.shield = 300; // 5 seconds
              toast({ title: "Shield Activated!", description: "5 seconds of protection!" });
              break;
            case 'points':
              newState.score += 500;
              toast({ title: "Bonus Points!", description: "+500 points!" });
              break;
          }
        }
      }

      // Remove collected power-ups
      newState.powerUps = newState.powerUps.filter(p => !p.collected);

      // Check collisions (with shield protection)
      if (newState.shield > 0) {
        newState.shield -= 1;
      } else {
        for (const car of newState.otherCars) {
          if (checkCollision(newState.playerCar, car)) {
            newState.lives -= 1;
            newState.combo = 0; // Reset combo on collision
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
      }

      // Update score and combo system
      const basePoints = Math.floor(newState.playerCar.speed * 0.1);
      newState.combo += 1;
      const comboMultiplier = Math.min(Math.floor(newState.combo / 100), 5);
      newState.score += basePoints * (1 + comboMultiplier);

      // Random weather changes
      if (Math.random() < 0.001) {
        const weathers = ['clear', 'rain', 'fog'] as const;
        newState.weather = weathers[Math.floor(Math.random() * weathers.length)];
      }
      
      return newState;
    });
  }, [controls, selectedCar, spawnCar, spawnPowerUp, checkCollision, toast]);

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

    // Draw power-ups
    gameState.powerUps.forEach(powerUp => {
      const emoji = powerUp.type === 'boost' ? '⚡' : powerUp.type === 'shield' ? '🛡️' : '💎';
      ctx.font = '25px Arial';
      ctx.textAlign = 'center';
      
      // Add glow effect for power-ups
      ctx.shadowColor = powerUp.type === 'boost' ? '#ffff00' : powerUp.type === 'shield' ? '#00ff00' : '#ff00ff';
      ctx.shadowBlur = 5;
      ctx.fillText(emoji, powerUp.position.x, powerUp.position.y);
      ctx.shadowBlur = 0;
    });

    // Draw cars
    const drawCar = (car: GameCar, isPlayer: boolean = false) => {
      ctx.font = isPlayer ? '40px Arial' : '30px Arial';
      ctx.textAlign = 'center';
      
      if (isPlayer) {
        // Draw shield effect
        if (gameState.shield > 0) {
          ctx.strokeStyle = '#00ff00';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(car.position.x, car.position.y - 10, 35, 0, 2 * Math.PI);
          ctx.stroke();
        }
        
        // Draw boost effect
        if (gameState.boost > 0) {
          ctx.fillStyle = '#ffff00';
          for (let i = 0; i < 3; i++) {
            ctx.fillRect(car.position.x - 20 + i * 20, car.position.y + 20, 5, 15);
          }
        }
        
        // Draw nitro effect
        if (controls.usingNitro && gameState.nitroCount > 0) {
          ctx.fillStyle = '#ff4444';
          for (let i = 0; i < 5; i++) {
            ctx.fillRect(car.position.x - 30 + i * 15, car.position.y + 25, 3, 20);
          }
        }
      }
      
      ctx.fillStyle = car.color;
      ctx.fillText(car.emoji, car.position.x, car.position.y);
      
      if (isPlayer) {
        // Draw glow effect for player
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 10;
        ctx.fillText(car.emoji, car.position.x, car.position.y);
        ctx.shadowBlur = 0;
      }
    };

    // Weather effects
    if (gameState.weather === 'rain') {
      ctx.strokeStyle = '#87ceeb';
      ctx.lineWidth = 1;
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * CANVAS_WIDTH;
        const y = (Math.random() * CANVAS_HEIGHT + gameState.roadOffset * 2) % CANVAS_HEIGHT;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 5, y + 15);
        ctx.stroke();
      }
    } else if (gameState.weather === 'fog') {
      ctx.fillStyle = 'rgba(200, 200, 200, 0.3)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    // Draw other cars
    gameState.otherCars.forEach(car => drawCar(car));
    
    // Draw player car
    drawCar(gameState.playerCar, true);

    // Draw HUD info
    ctx.font = '16px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    
    if (gameState.combo > 50) {
      ctx.fillText(`Combo: x${Math.floor(gameState.combo / 100) + 1}`, 10, 30);
    }
    
    if (gameState.nitroCount > 0) {
      ctx.fillText(`Nitro: ${Math.ceil(gameState.nitroCount)}`, 10, 50);
    }
    
    ctx.fillText(`Weather: ${gameState.weather}`, 10, 70);
    
    if (gameState.boost > 0) {
      ctx.fillStyle = '#ffff00';
      ctx.fillText(`BOOST: ${Math.ceil(gameState.boost / 60)}s`, CANVAS_WIDTH - 120, 30);
    }
    
    if (gameState.shield > 0) {
      ctx.fillStyle = '#00ff00';
      ctx.fillText(`SHIELD: ${Math.ceil(gameState.shield / 60)}s`, CANVAS_WIDTH - 120, 50);
    }

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
        case 'n':
        case 'shift':
          if (gameState.nitroCount > 0) {
            setControls(prev => ({ ...prev, usingNitro: true }));
          }
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
        case 'n':
        case 'shift':
          setControls(prev => ({ ...prev, usingNitro: false }));
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
      
      <EnhancedGameControls 
        onAccelerate={() => setControls(prev => ({ ...prev, isAccelerating: true }))}
        onBrake={() => setControls(prev => ({ ...prev, isBraking: true }))}
        onMoveLeft={() => setControls(prev => ({ ...prev, movingLeft: true }))}
        onMoveRight={() => setControls(prev => ({ ...prev, movingRight: true }))}
        onNitro={() => setControls(prev => ({ ...prev, usingNitro: true }))}
        isAccelerating={controls.isAccelerating}
        isBraking={controls.isBraking}
        isUsingNitro={controls.usingNitro}
        nitroCount={gameState.nitroCount}
        onPause={onPause}
      />
    </div>
  );
};