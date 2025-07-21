import React from 'react';
import { Button } from '@/components/ui/button';
import { Zap, Shield, Gauge, Square, ArrowLeft, ArrowRight, Pause } from 'lucide-react';

interface EnhancedGameControlsProps {
  onAccelerate: () => void;
  onBrake: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onNitro: () => void;
  isAccelerating: boolean;
  isBraking: boolean;
  isUsingNitro: boolean;
  nitroCount: number;
  onPause: () => void;
}

export const EnhancedGameControls: React.FC<EnhancedGameControlsProps> = ({
  onAccelerate,
  onBrake,
  onMoveLeft,
  onMoveRight,
  onNitro,
  isAccelerating,
  isBraking,
  isUsingNitro,
  nitroCount,
  onPause
}) => {
  return (
    <>
      {/* Desktop Instructions */}
      <div className="hidden md:block text-center text-sm text-muted-foreground mb-4">
        <p>🎮 <strong>Controls:</strong> WASD/Arrow Keys • <strong>Nitro:</strong> N/Shift • <strong>Pause:</strong> P</p>
      </div>

      {/* Mobile Controls */}
      <div className="md:hidden w-full max-w-md mx-auto">
        <div className="grid grid-cols-5 gap-2 mb-4">
          {/* Left Move */}
          <Button
            variant="outline"
            size="lg"
            onTouchStart={onMoveLeft}
            onMouseDown={onMoveLeft}
            className="h-16 col-span-1"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>

          {/* Accelerate */}
          <Button
            variant={isAccelerating ? "default" : "outline"}
            size="lg"
            onTouchStart={onAccelerate}
            onTouchEnd={() => {}}
            onMouseDown={onAccelerate}
            onMouseUp={() => {}}
            className="h-16 col-span-1 bg-success hover:bg-success/90"
          >
            <Gauge className="w-6 h-6" />
          </Button>

          {/* Nitro */}
          <Button
            variant={isUsingNitro ? "default" : "outline"}
            size="lg"
            onTouchStart={onNitro}
            onTouchEnd={() => {}}
            onMouseDown={onNitro}
            onMouseUp={() => {}}
            disabled={nitroCount <= 0}
            className="h-16 col-span-1 bg-warning hover:bg-warning/90 relative"
          >
            <Zap className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 text-xs bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center">
              {Math.ceil(nitroCount)}
            </span>
          </Button>

          {/* Brake */}
          <Button
            variant={isBraking ? "destructive" : "outline"}
            size="lg"
            onTouchStart={onBrake}
            onTouchEnd={() => {}}
            onMouseDown={onBrake}
            onMouseUp={() => {}}
            className="h-16 col-span-1"
          >
            <Square className="w-6 h-6" />
          </Button>

          {/* Right Move */}
          <Button
            variant="outline"
            size="lg"
            onTouchStart={onMoveRight}
            onMouseDown={onMoveRight}
            className="h-16 col-span-1"
          >
            <ArrowRight className="w-6 h-6" />
          </Button>
        </div>

        {/* Pause Button */}
        <div className="flex justify-center">
          <Button
            variant="secondary"
            size="sm"
            onClick={onPause}
            className="flex items-center gap-2"
          >
            <Pause className="w-4 h-4" />
            Pause
          </Button>
        </div>
      </div>
    </>
  );
};