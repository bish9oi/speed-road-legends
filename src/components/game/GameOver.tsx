import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface GameOverProps {
  score: number;
  level: number;
  completed: boolean;
  isNewHighScore: boolean;
  onContinue?: () => void;
  onRestart: () => void;
  onMainMenu: () => void;
}

export const GameOver: React.FC<GameOverProps> = ({
  score,
  level,
  completed,
  isNewHighScore,
  onContinue,
  onRestart,
  onMainMenu
}) => {
  return (
    <div className="min-h-screen bg-gradient-road flex items-center justify-center p-4">
      <Card className="p-8 text-center max-w-md w-full bg-card/90 backdrop-blur">
        <div className="mb-8">
          {completed ? (
            <>
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="text-3xl font-bold text-speed-green mb-2">Level Complete!</h2>
              <p className="text-muted-foreground">Excellent driving skills!</p>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">💥</div>
              <h2 className="text-3xl font-bold text-danger-red mb-2">Game Over</h2>
              <p className="text-muted-foreground">Better luck next time!</p>
            </>
          )}
        </div>
        
        <div className="space-y-4 mb-8">
          <div className="bg-dashboard rounded-lg p-4">
            <h3 className="text-lg font-semibold text-warning-yellow mb-2">📊 Final Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Score:</span>
                <span className="font-bold text-primary">{score.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Level:</span>
                <span className="font-bold text-secondary">{level}</span>
              </div>
              {isNewHighScore && (
                <div className="flex justify-between">
                  <span className="text-speed-green">🎉 New High Score!</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          {completed && onContinue && (
            <Button 
              onClick={onContinue}
              className="w-full bg-gradient-primary hover:scale-105 transition-transform shadow-glow"
            >
              🚀 Next Level
            </Button>
          )}
          
          <Button 
            onClick={onRestart}
            variant="secondary"
            className="w-full"
          >
            🔄 Play Again
          </Button>
          
          <Button 
            onClick={onMainMenu}
            variant="outline"
            className="w-full"
          >
            🏠 Main Menu
          </Button>
        </div>
        
        <div className="mt-6 text-xs text-muted-foreground">
          <p>Share your score with friends!</p>
        </div>
      </Card>
    </div>
  );
};