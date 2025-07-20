import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@shopify/react-native-skia';
import ExplosionRenderer from '../effects/ExplosionRenderer';
import { getExplosionConfig } from '../../utils/explosionConfigs';

interface Explosion {
  id: string;
  x: number;
  y: number;
  type: 'red' | 'purple' | 'blue' | 'green' | 'orange';
  bulletType?: 'normal' | 'special' | 'sniper' | 'shotgun' | 'laser';
}

interface ExplosionOverlayProps {
  explosions: Explosion[];
  onExplosionFinish: (id: string) => void;
}

export default function ExplosionOverlay({ explosions, onExplosionFinish }: ExplosionOverlayProps) {
  const [explosionProgress, setExplosionProgress] = useState<Record<string, number>>({});
  const onExplosionFinishRef = useRef(onExplosionFinish);

  // Update ref when callback changes
  useEffect(() => {
    onExplosionFinishRef.current = onExplosionFinish;
  }, [onExplosionFinish]);

  // Initialize new explosions
  useEffect(() => {
    const newExplosions = explosions.filter(exp => !(exp.id in explosionProgress));
    if (newExplosions.length > 0) {
      setExplosionProgress(prev => {
        const updated = { ...prev };
        newExplosions.forEach(exp => {
          updated[exp.id] = 0;
        });
        return updated;
      });
    }
  }, [explosions, explosionProgress]);

  // Animate explosions
  useEffect(() => {
    const animationFrame = requestAnimationFrame(() => {
      setExplosionProgress(prev => {
        const updated = { ...prev };
        let hasChanges = false;
        const completedExplosions: string[] = [];

        Object.keys(updated).forEach(id => {
          const explosion = explosions.find(exp => exp.id === id);
          if (explosion) {
            const config = getExplosionConfig(explosion.bulletType || 'normal');
            const duration = config.duration;
            const currentProgress = updated[id];
            const newProgress = Math.min(1, currentProgress + (16 / duration)); // 60fps

            if (newProgress !== currentProgress) {
              updated[id] = newProgress;
              hasChanges = true;
            }

            // Mark completed explosions for removal
            if (newProgress >= 1) {
              completedExplosions.push(id);
              delete updated[id];
              hasChanges = true;
            }
          } else {
            // Remove explosions that no longer exist
            delete updated[id];
            hasChanges = true;
          }
        });

        // Call onExplosionFinish for completed explosions after state update
        if (completedExplosions.length > 0) {
          // Use setTimeout to defer the callback execution
          setTimeout(() => {
            completedExplosions.forEach(id => {
              onExplosionFinishRef.current(id);
            });
          }, 0);
        }

        return hasChanges ? updated : prev;
      });
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [explosions, explosionProgress]);

  return (
    <Canvas style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 50 }}>
      {explosions.map((explosion) => {
        const progress = explosionProgress[explosion.id] || 0;
        return (
          <ExplosionRenderer
            key={explosion.id}
            x={explosion.x}
            y={explosion.y}
            bulletType={explosion.bulletType || 'normal'}
            progress={progress}
            onFinish={() => onExplosionFinishRef.current(explosion.id)}
          />
        );
      })}
    </Canvas>
  );
} 