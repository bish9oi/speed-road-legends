import React, { useState, useEffect } from 'react';
import { GameMenu } from './game/GameMenu';
import { PathSelection } from './game/PathSelection';
import { CarSelection } from './game/CarSelection';
import { RaceGame } from './game/RaceGame';
import { GameOver } from './game/GameOver';
import { PauseMenu } from './game/PauseMenu';
import { GameState, Car, Path } from '@/types/game';
import { useToast } from '@/hooks/use-toast';

export const CarRacingGame: React.FC = () => {
  const { toast } = useToast();
  
  const [gameState, setGameState] = useState<GameState>({
    currentScreen: 'menu',
    selectedPath: null,
    selectedCar: null,
    level: 1,
    score: 0,
    lives: 3,
    timeRemaining: 60,
    isGameRunning: false,
    gameSpeed: 1
  });

  const [highScore, setHighScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTimeLimit, setCurrentTimeLimit] = useState(60);

  // Load high score from localStorage
  useEffect(() => {
    const savedHighScore = localStorage.getItem('carRacing-highScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);

  // Save high score to localStorage
  const updateHighScore = (score: number) => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('carRacing-highScore', score.toString());
      toast({
        title: "🎉 New High Score!",
        description: `Amazing! You scored ${score.toLocaleString()} points!`
      });
      return true;
    }
    return false;
  };

  const handleStartGame = () => {
    setGameState(prev => ({ ...prev, currentScreen: 'path-selection' }));
  };

  const handleSelectPath = (path: Path) => {
    setCurrentTimeLimit(path.timeLimit);
    setGameState(prev => ({ 
      ...prev, 
      currentScreen: 'car-selection',
      selectedPath: path.id,
      timeRemaining: path.timeLimit
    }));
  };

  const handleSelectCar = (car: Car) => {
    setGameState(prev => ({ 
      ...prev, 
      currentScreen: 'racing',
      selectedCar: car,
      isGameRunning: true,
      score: 0,
      lives: 3
    }));
    toast({
      title: "🏁 Race Started!",
      description: `Good luck with your ${car.name}!`
    });
  };

  const handleGameOver = (finalScore: number, completed: boolean) => {
    const isNewHighScore = updateHighScore(finalScore);
    
    setGameState(prev => ({ 
      ...prev, 
      currentScreen: 'game-over',
      score: finalScore,
      isGameRunning: false
    }));

    if (completed) {
      toast({
        title: "🏆 Level Completed!",
        description: `Great job! Score: ${finalScore.toLocaleString()}`
      });
    } else {
      toast({
        title: "💥 Game Over",
        description: `Final score: ${finalScore.toLocaleString()}`,
        variant: "destructive"
      });
    }
  };

  const handlePause = () => {
    setIsPaused(true);
    setGameState(prev => ({ ...prev, isGameRunning: false }));
  };

  const handleResume = () => {
    setIsPaused(false);
    setGameState(prev => ({ ...prev, isGameRunning: true }));
  };

  const handleContinueToNextLevel = () => {
    const nextLevel = gameState.level + 1;
    const newTimeLimit = Math.max(20, currentTimeLimit - 5); // Decrease time but not below 20s
    
    setGameState(prev => ({ 
      ...prev, 
      currentScreen: 'racing',
      level: nextLevel,
      timeRemaining: newTimeLimit,
      isGameRunning: true,
      lives: 3,
      gameSpeed: 1 + (nextLevel - 1) * 0.3
    }));
    
    setCurrentTimeLimit(newTimeLimit);
    
    toast({
      title: `🚀 Level ${nextLevel}`,
      description: `Increased difficulty! Time limit: ${newTimeLimit}s`
    });
  };

  const handleRestart = () => {
    setGameState(prev => ({ 
      ...prev, 
      currentScreen: 'racing',
      score: 0,
      lives: 3,
      timeRemaining: currentTimeLimit,
      isGameRunning: true,
      level: 1,
      gameSpeed: 1
    }));
    setIsPaused(false);
  };

  const handleBackToMenu = () => {
    setGameState({
      currentScreen: 'menu',
      selectedPath: null,
      selectedCar: null,
      level: 1,
      score: 0,
      lives: 3,
      timeRemaining: 60,
      isGameRunning: false,
      gameSpeed: 1
    });
    setIsPaused(false);
  };

  const handleBackToPathSelection = () => {
    setGameState(prev => ({ ...prev, currentScreen: 'path-selection' }));
  };

  const handleBackToCarSelection = () => {
    setGameState(prev => ({ ...prev, currentScreen: 'car-selection' }));
  };

  // Render current screen
  const renderCurrentScreen = () => {
    switch (gameState.currentScreen) {
      case 'menu':
        return (
          <GameMenu 
            onStartGame={handleStartGame}
            highScore={highScore}
          />
        );
      
      case 'path-selection':
        return (
          <PathSelection 
            onSelectPath={handleSelectPath}
            onBack={handleBackToMenu}
          />
        );
      
      case 'car-selection':
        return (
          <CarSelection 
            onSelectCar={handleSelectCar}
            onBack={handleBackToPathSelection}
          />
        );
      
      case 'racing':
        return gameState.selectedCar ? (
          <RaceGame 
            selectedCar={gameState.selectedCar}
            level={gameState.level}
            timeLimit={gameState.timeRemaining}
            onGameOver={handleGameOver}
            onPause={handlePause}
          />
        ) : null;
      
      case 'game-over':
        return (
          <GameOver 
            score={gameState.score}
            level={gameState.level}
            completed={gameState.timeRemaining > 0}
            isNewHighScore={gameState.score === highScore}
            onContinue={gameState.timeRemaining > 0 ? handleContinueToNextLevel : undefined}
            onRestart={handleRestart}
            onMainMenu={handleBackToMenu}
          />
        );
      
      default:
        return <GameMenu onStartGame={handleStartGame} highScore={highScore} />;
    }
  };

  return (
    <div className="relative">
      {renderCurrentScreen()}
      
      {/* Pause Menu Overlay */}
      {isPaused && (
        <PauseMenu 
          onResume={handleResume}
          onRestart={handleRestart}
          onMainMenu={handleBackToMenu}
        />
      )}
    </div>
  );
};