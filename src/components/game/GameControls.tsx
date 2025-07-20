import React from 'react';
import { Button } from '@/components/ui/button';

interface GameControlsProps {
  onAccelerate: () => void;
  onBrake: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  isAccelerating: boolean;
  isBraking: boolean;
  onPause: () => void;
}

export const GameControls: React.FC<GameControlsProps> = ({
  onAccelerate,
  onBrake,
  onMoveLeft,
  onMoveRight,
  isAccelerating,
  isBraking,
  onPause
}) => {
  return (
    <div className="absolute bottom-4 left-4 right-4 z-10">
      {/* Desktop Controls Info */}
      <div className="hidden md:block text-center mb-4">
        <div className="bg-dashboard/80 backdrop-blur rounded-lg p-2 inline-block">
          <span className="text-xs text-muted-foreground">
            Use Arrow Keys or WASD • Space for Brake • P for Pause
          </span>
        </div>
      </div>

      {/* Mobile Controls */}
      <div className="md:hidden">
        <div className="flex justify-between items-end">
          {/* Left Controls */}
          <div className="flex flex-col space-y-2">
            <Button
              onTouchStart={onMoveLeft}
              onMouseDown={onMoveLeft}
              variant="outline"
              size="lg"
              className="w-16 h-16 rounded-full bg-card/80 backdrop-blur text-2xl"
            >
              ←
            </Button>
            <Button
              onTouchStart={onMoveRight}
              onMouseDown={onMoveRight}
              variant="outline"
              size="lg"
              className="w-16 h-16 rounded-full bg-card/80 backdrop-blur text-2xl"
            >
              →
            </Button>
          </div>

          {/* Center Controls */}
          <div className="flex flex-col items-center space-y-2">
            <Button
              onClick={onPause}
              variant="outline"
              size="sm"
              className="bg-card/80 backdrop-blur"
            >
              ⏸️ PAUSE
            </Button>
          </div>

          {/* Right Controls */}
          <div className="flex flex-col space-y-2">
            <Button
              onTouchStart={onAccelerate}
              onTouchEnd={() => {}}
              onMouseDown={onAccelerate}
              onMouseUp={() => {}}
              size="lg"
              className={`w-20 h-20 rounded-full text-lg font-bold transition-all ${
                isAccelerating 
                  ? 'bg-speed-green hover:bg-speed-green scale-110' 
                  : 'bg-gradient-primary hover:scale-105'
              }`}
            >
              🚀<br/>SPEED
            </Button>
            <Button
              onTouchStart={onBrake}
              onTouchEnd={() => {}}
              onMouseDown={onBrake}
              onMouseUp={() => {}}
              variant="destructive"
              size="lg"
              className={`w-20 h-20 rounded-full text-lg font-bold transition-all ${
                isBraking 
                  ? 'bg-danger-red hover:bg-danger-red scale-110' 
                  : 'hover:scale-105'
              }`}
            >
              🛑<br/>BRAKE
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};