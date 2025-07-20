import React from 'react';
import { Card } from '@/components/ui/card';

interface GameDashboardProps {
  speed: number;
  maxSpeed: number;
  score: number;
  level: number;
  timeRemaining: number;
  lives: number;
}

export const GameDashboard: React.FC<GameDashboardProps> = ({
  speed,
  maxSpeed,
  score,
  level,
  timeRemaining,
  lives
}) => {
  const speedPercentage = (speed / maxSpeed) * 100;
  
  const getSpeedColor = () => {
    if (speedPercentage > 80) return 'text-danger-red';
    if (speedPercentage > 60) return 'text-warning-yellow';
    return 'text-speed-green';
  };

  const getTimeColor = () => {
    if (timeRemaining < 10) return 'text-danger-red';
    if (timeRemaining < 20) return 'text-warning-yellow';
    return 'text-speed-green';
  };

  return (
    <div className="absolute top-4 left-4 right-4 z-10">
      <Card className="bg-gradient-dashboard border-border/50 p-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          {/* Speed */}
          <div>
            <div className="text-xs text-muted-foreground mb-1">SPEED</div>
            <div className={`text-lg font-bold ${getSpeedColor()}`}>
              {Math.round(speed)}
            </div>
            <div className="text-xs text-muted-foreground">km/h</div>
          </div>

          {/* Score */}
          <div>
            <div className="text-xs text-muted-foreground mb-1">SCORE</div>
            <div className="text-lg font-bold text-primary">
              {score.toLocaleString()}
            </div>
          </div>

          {/* Level */}
          <div>
            <div className="text-xs text-muted-foreground mb-1">LEVEL</div>
            <div className="text-lg font-bold text-secondary">
              {level}
            </div>
          </div>

          {/* Time */}
          <div>
            <div className="text-xs text-muted-foreground mb-1">TIME</div>
            <div className={`text-lg font-bold ${getTimeColor()}`}>
              {timeRemaining}s
            </div>
          </div>

          {/* Lives */}
          <div>
            <div className="text-xs text-muted-foreground mb-1">LIVES</div>
            <div className="text-lg">
              {'❤️'.repeat(lives)}
            </div>
          </div>
        </div>

        {/* Speed Bar */}
        <div className="mt-3">
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-100 ${
                speedPercentage > 80 ? 'bg-danger-red' :
                speedPercentage > 60 ? 'bg-warning-yellow' : 'bg-speed-green'
              }`}
              style={{ width: `${speedPercentage}%` }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};