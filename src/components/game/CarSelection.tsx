import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Car } from '@/types/game';

interface CarSelectionProps {
  onSelectCar: (car: Car) => void;
  onBack: () => void;
}

const cars: Car[] = [
  {
    id: 'sports',
    name: 'Sports Car',
    color: '#ff4444',
    maxSpeed: 200,
    acceleration: 8,
    handling: 9,
    emoji: '🏎️'
  },
  {
    id: 'muscle',
    name: 'Muscle Car',
    color: '#44ff44',
    maxSpeed: 180,
    acceleration: 9,
    handling: 7,
    emoji: '🚗'
  },
  {
    id: 'truck',
    name: 'Pickup Truck',
    color: '#4444ff',
    maxSpeed: 150,
    acceleration: 6,
    handling: 8,
    emoji: '🚚'
  },
  {
    id: 'supercar',
    name: 'Supercar',
    color: '#ff44ff',
    maxSpeed: 250,
    acceleration: 10,
    handling: 10,
    emoji: '🏁'
  }
];

export const CarSelection: React.FC<CarSelectionProps> = ({ onSelectCar, onBack }) => {
  const getStatColor = (value: number) => {
    if (value >= 9) return 'text-speed-green';
    if (value >= 7) return 'text-warning-yellow';
    return 'text-danger-red';
  };

  const renderStatBar = (value: number) => {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-20 bg-muted rounded-full h-2">
          <div 
            className="h-2 bg-primary rounded-full transition-all"
            style={{ width: `${value * 10}%` }}
          />
        </div>
        <span className={`text-sm font-semibold ${getStatColor(value)}`}>
          {value}/10
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-road flex items-center justify-center p-4">
      <Card className="p-8 max-w-4xl w-full bg-card/90 backdrop-blur">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-primary mb-2">Choose Your Car</h2>
          <p className="text-muted-foreground">Select your racing machine</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {cars.map((car) => (
            <Card 
              key={car.id}
              className="p-6 cursor-pointer hover:scale-105 transition-transform bg-dashboard border-border hover:border-primary"
              onClick={() => onSelectCar(car)}
            >
              <div className="text-center mb-4">
                <span className="text-6xl mb-2 block">{car.emoji}</span>
                <h3 className="text-xl font-bold text-foreground">{car.name}</h3>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-muted-foreground">Top Speed</span>
                    <span className="text-sm font-semibold text-primary">{car.maxSpeed} km/h</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-muted-foreground">Acceleration</span>
                  </div>
                  {renderStatBar(car.acceleration)}
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-muted-foreground">Handling</span>
                  </div>
                  {renderStatBar(car.handling)}
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        <Button 
          onClick={onBack}
          variant="outline"
          className="w-full"
        >
          ← Back to Path Selection
        </Button>
      </Card>
    </div>
  );
};