import React from 'react';
import ExplosionParticles from '../effects/ExplosionParticles';

interface ExplosionOverlayProps {
  explosions: { id: string; x: number; y: number; type: 'red' | 'purple' }[];
  onExplosionFinish: (id: string) => void;
}

export default function ExplosionOverlay({ explosions, onExplosionFinish }: ExplosionOverlayProps) {
  return (
    <>
      {explosions.map((explosion) => (
        <ExplosionParticles
          key={explosion.id}
          x={explosion.x}
          y={explosion.y}
          type={explosion.type}
          onFinish={() => onExplosionFinish(explosion.id)}
        />
      ))}
    </>
  );
} 