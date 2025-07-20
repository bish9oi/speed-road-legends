import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface GameMenuProps {
  onStartGame: () => void;
  highScore: number;
}

export const GameMenu: React.FC<GameMenuProps> = ({ onStartGame, highScore }) => {
  return (
    <div className="min-h-screen bg-gradient-road flex items-center justify-center p-4">
      <Card className="p-8 text-center max-w-md w-full bg-card/90 backdrop-blur">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">🏎️ SPEED RACER</h1>
          <p className="text-muted-foreground">Ultimate Car Racing Challenge</p>
        </div>
        
        <div className="space-y-6">
          <div className="bg-dashboard rounded-lg p-4">
            <h3 className="text-lg font-semibold text-warning-yellow mb-2">🏆 High Score</h3>
            <p className="text-2xl font-bold text-primary">{highScore.toLocaleString()}</p>
          </div>
          
          <Button 
            onClick={onStartGame}
            className="w-full text-lg py-6 bg-gradient-primary hover:scale-105 transition-transform shadow-glow"
          >
            🚀 START RACE
          </Button>
          
          <div className="text-sm text-muted-foreground space-y-1">
            <p>🎮 Use Speed & Brake buttons to control</p>
            <p>🚗 Avoid collisions with other cars</p>
            <p>⏱️ Complete within time limit</p>
            <p>📱 Works on desktop & mobile</p>
          </div>
        </div>
      </Card>
    </div>
  );
};