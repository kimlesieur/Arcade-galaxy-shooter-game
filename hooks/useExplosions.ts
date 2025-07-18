import { useState } from 'react';

export const useExplosions = () => {
  const [explosions, setExplosions] = useState<{ id: string; x: number; y: number; type: 'red' | 'purple' }[]>([]);

  const addExplosion = (x: number, y: number, type: 'red' | 'purple') => {
    setExplosions((prev) => [...prev, { 
      id: `${Date.now()}-${Math.random()}`, 
      x, 
      y, 
      type 
    }]);
  };

  const removeExplosion = (id: string) => {
    setExplosions((prev) => prev.filter((e) => e.id !== id));
  };

  const resetExplosions = () => {
    setExplosions([]);
  };

  return {
    explosions,
    addExplosion,
    removeExplosion,
    resetExplosions,
  };
}; 