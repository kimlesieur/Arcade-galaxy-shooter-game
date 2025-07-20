import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@shopify/react-native-skia';
import CollisionSparkEffect from '../effects/CollisionSparkEffect';
import { getCollisionSparkConfig, CollisionSparkType } from '../../utils/collisionSparkConfigs';

interface CollisionSpark {
  id: string;
  x: number;
  y: number;
  configId?: CollisionSparkType; // Optional config ID
}

interface CollisionSparkOverlayProps {
  collisionSparks: CollisionSpark[];
  onSparkFinish: (id: string) => void;
}

export default function CollisionSparkOverlay({ 
  collisionSparks, 
  onSparkFinish 
}: CollisionSparkOverlayProps) {
  const [sparkProgress, setSparkProgress] = useState<Record<string, number>>({});
  const onSparkFinishRef = useRef(onSparkFinish);

  // Update ref when callback changes
  useEffect(() => {
    onSparkFinishRef.current = onSparkFinish;
  }, [onSparkFinish]);

  // Initialize new collision sparks
  useEffect(() => {
    const newSparks = collisionSparks.filter(spark => !(spark.id in sparkProgress));
    if (newSparks.length > 0) {
      setSparkProgress(prev => {
        const updated = { ...prev };
        newSparks.forEach(spark => {
          updated[spark.id] = 0;
        });
        return updated;
      });
    }
  }, [collisionSparks, sparkProgress]);

  // Animate collision sparks
  useEffect(() => {
    const animationFrame = requestAnimationFrame(() => {
      setSparkProgress(prev => {
        const updated = { ...prev };
        let hasChanges = false;
        const completedSparks: string[] = [];

        Object.keys(updated).forEach(id => {
          const spark = collisionSparks.find(s => s.id === id);
          if (spark) {
            const config = getCollisionSparkConfig(spark.configId);
            const duration = config.duration;
            const currentProgress = updated[id];
            const newProgress = Math.min(1, currentProgress + (16 / duration)); // 60fps

            if (newProgress !== currentProgress) {
              updated[id] = newProgress;
              hasChanges = true;
            }

            // Mark completed sparks for removal
            if (newProgress >= 1) {
              completedSparks.push(id);
              delete updated[id];
              hasChanges = true;
            }
          } else {
            // Remove sparks that no longer exist
            delete updated[id];
            hasChanges = true;
          }
        });

        // Call onSparkFinish for completed sparks after state update
        if (completedSparks.length > 0) {
          // Use setTimeout to defer the callback execution
          setTimeout(() => {
            completedSparks.forEach(id => {
              onSparkFinishRef.current(id);
            });
          }, 0);
        }

        return hasChanges ? updated : prev;
      });
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [collisionSparks, sparkProgress]);

  return (
    <Canvas style={{ 
      position: 'absolute', 
      left: 0, 
      top: 0, 
      width: '100%', 
      height: '100%', 
      pointerEvents: 'none', 
      zIndex: 60 
    }}>
      {collisionSparks.map((spark) => {
        const progress = sparkProgress[spark.id] || 0;
        return (
          <CollisionSparkEffect
            key={spark.id}
            x={spark.x}
            y={spark.y}
            progress={progress}
            configId={spark.configId}
            onFinish={() => onSparkFinishRef.current(spark.id)}
          />
        );
      })}
    </Canvas>
  );
} 