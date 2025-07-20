import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface PauseMenuProps {
  onResume: () => void;
  onRestart: () => void;
  onMainMenu: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  onResume,
  onRestart,
  onMainMenu
}) => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur flex items-center justify-center z-50">
      <Card className="p-8 text-center max-w-sm w-full bg-card/90 backdrop-blur">
        <div className="mb-8">
          <div className="text-4xl mb-4">⏸️</div>
          <h2 className="text-2xl font-bold text-primary mb-2">Game Paused</h2>
          <p className="text-muted-foreground">Take a break!</p>
        </div>
        
        <div className="space-y-3">
          <Button 
            onClick={onResume}
            className="w-full bg-gradient-primary hover:scale-105 transition-transform"
          >
            ▶️ Resume
          </Button>
          
          <Button 
            onClick={onRestart}
            variant="secondary"
            className="w-full"
          >
            🔄 Restart Level
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
          <p>💡 Tip: Use WASD or arrow keys to control your car</p>
        </div>
      </Card>
    </div>
  );
};