import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Canvas } from '@shopify/react-native-skia';
import ScreenShakeEffect from './ScreenShakeEffect';
import AdvancedExplosionShader from '@/components/effects/AdvancedExplosionShader';
import PlayerExplosionShader from '@/components/effects/PlayerExplosionShader';

interface PlayerExplosionOverlayProps {
  isGameOver: boolean;
  playerX: number;
  playerY: number;
  onExplosionComplete?: () => void;
  variant?: 'advanced' | 'classic';
}

export default function PlayerExplosionOverlay({ 
  isGameOver, 
  playerX, 
  playerY, 
  onExplosionComplete,
  variant = 'classic'
}: PlayerExplosionOverlayProps) {
  const [showExplosion, setShowExplosion] = useState(false);
  const [explosionProgress, setExplosionProgress] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [hasExploded, setHasExploded] = useState(false);
  const onExplosionCompleteRef = useRef(onExplosionComplete);

  // Update ref when callback changes
  useEffect(() => {
    onExplosionCompleteRef.current = onExplosionComplete;
  }, [onExplosionComplete]);

  // Get explosion configuration based on variant
  const getExplosionConfig = useCallback(() => {
    switch (variant) {
      case 'advanced':
        return {
          duration: 2000,
          size: 100,
          shakeIntensity: 1.0,
          shakeDuration: 2000,
        };
      case 'classic':
      default:
        return {
          duration: 1500,
          size: 200,
          shakeIntensity: 0.8,
          shakeDuration: 1500,
        };
    }
  }, [variant]);

  // Trigger explosion when game over
  useEffect(() => {
    if (isGameOver && !showExplosion && !hasExploded) {
      setShowExplosion(true);
      setExplosionProgress(0);
      setIsShaking(true);
      setHasExploded(true);
      
      const config = getExplosionConfig();
      
      // Animate the explosion
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(1, elapsed / config.duration);
        
        setExplosionProgress(progress);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Explosion complete
          setTimeout(() => {
            setShowExplosion(false);
            setExplosionProgress(0);
            setIsShaking(false);
            if (onExplosionCompleteRef.current) {
              onExplosionCompleteRef.current();
            }
          }, 200);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [isGameOver, showExplosion, hasExploded, variant, getExplosionConfig]); // Added variant to dependencies

  // Reset when game is not over
  useEffect(() => {
    if (!isGameOver) {
      setShowExplosion(false);
      setExplosionProgress(0);
      setIsShaking(false);
      setHasExploded(false); // Reset the explosion flag
    }
  }, [isGameOver]);

  if (!showExplosion) {
    return null;
  }

  const config = getExplosionConfig();

  return (
    <ScreenShakeEffect 
      isShaking={isShaking} 
      intensity={config.shakeIntensity} 
      duration={config.shakeDuration}
    >
      <Canvas style={{ 
        position: 'absolute', 
        left: 0, 
        top: 0, 
        width: '100%', 
        height: '100%', 
        pointerEvents: 'none', 
        zIndex: 100 // Higher than other effects
      }}>
        {variant === 'advanced' ? (
        <AdvancedExplosionShader
          x={playerX}
          y={playerY}
          progress={explosionProgress}
          size={config.size}
          bulletType="player"
        />
        ) : (
          <PlayerExplosionShader
            x={playerX}
            y={playerY}
            progress={explosionProgress}
            size={config.size}
          />
        )}
      </Canvas>
    </ScreenShakeEffect>
  );
} 