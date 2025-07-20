import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Path } from '@/types/game';

interface PathSelectionProps {
  onSelectPath: (path: Path) => void;
  onBack: () => void;
}

const paths: Path[] = [
  {
    id: 'city',
    name: 'City Circuit',
    description: 'Navigate through busy city streets',
    difficulty: 'easy',
    timeLimit: 60,
    emoji: '🏙️'
  },
  {
    id: 'highway',
    name: 'Highway Rush',
    description: 'High-speed highway racing',
    difficulty: 'medium',
    timeLimit: 45,
    emoji: '🛣️'
  },
  {
    id: 'mountain',
    name: 'Mountain Pass',
    description: 'Dangerous mountain curves',
    difficulty: 'hard',
    timeLimit: 30,
    emoji: '⛰️'
  }
];

export const PathSelection: React.FC<PathSelectionProps> = ({ onSelectPath, onBack }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-speed-green';
      case 'medium': return 'text-warning-yellow';
      case 'hard': return 'text-danger-red';
      default: return 'text-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-road flex items-center justify-center p-4">
      <Card className="p-8 max-w-2xl w-full bg-card/90 backdrop-blur">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-primary mb-2">Choose Your Path</h2>
          <p className="text-muted-foreground">Select the racing environment</p>
        </div>
        
        <div className="grid gap-4 mb-8">
          {paths.map((path) => (
            <Card 
              key={path.id}
              className="p-6 cursor-pointer hover:scale-105 transition-transform bg-dashboard border-border hover:border-primary"
              onClick={() => onSelectPath(path)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-4xl">{path.emoji}</span>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{path.name}</h3>
                    <p className="text-muted-foreground">{path.description}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className={`font-semibold ${getDifficultyColor(path.difficulty)}`}>
                        {path.difficulty.toUpperCase()}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ⏱️ {path.timeLimit}s
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-primary">→</div>
              </div>
            </Card>
          ))}
        </div>
        
        <Button 
          onClick={onBack}
          variant="outline"
          className="w-full"
        >
          ← Back to Menu
        </Button>
      </Card>
    </div>
  );
};