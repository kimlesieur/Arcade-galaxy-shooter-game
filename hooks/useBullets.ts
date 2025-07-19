import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';
import { Bullet } from '../components/game/types';
import { isOffScreen } from '../components/game/utils';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const useBullets = (
  gameOver: boolean,
  isSpecialMissileCharging: boolean,
  playerPosRef: React.MutableRefObject<{ x: number; y: number }>,
  playShootSound: () => void,
  playSpecialMissileSound: () => void
) => {
  const [bullets, setBullets] = useState<Bullet[]>([]);

  const shootBullet = () => {
    setBullets((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        x: playerPosRef.current.x,
        y: playerPosRef.current.y - 30,
        velocityX: 0,
        velocityY: -500,
        isPlayer: true,
        damage: 1,
        radius: 6,
        type: 'normal',
      },
    ]);
    playShootSound();
  };

  const shootSpecialMissile = () => {
    setBullets((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        x: playerPosRef.current.x,
        y: playerPosRef.current.y - 30,
        velocityX: 0,
        velocityY: -600,
        isPlayer: true,
        damage: 3,
        radius: 10,
        type: 'special',
      },
    ]);
    playSpecialMissileSound();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  // Automatic shooting effect
  useEffect(() => {
    if (gameOver || isSpecialMissileCharging) return;
    const interval = setInterval(() => {
      shootBullet();
    }, 700);
    return () => clearInterval(interval);
  }, [gameOver, isSpecialMissileCharging]);

  // Game loop for bullets
  useEffect(() => {
    if (gameOver) return;
    let animationFrameId: number;
    let lastTime: number | null = null;
    
    const loop = (time: number) => {
      if (lastTime === null) {
        lastTime = time;
        animationFrameId = requestAnimationFrame(loop);
        return;
      }
      const delta = (time - lastTime) / 1000;
      lastTime = time;
      
      setBullets((prev) =>
        prev
          .map((b) => ({ ...b, y: b.y + b.velocityY * delta }))
          .filter((b) => !isOffScreen(b.x, b.y, SCREEN_WIDTH, SCREEN_HEIGHT))
      );
      
      animationFrameId = requestAnimationFrame(loop);
    };
    
    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameOver]);

  const resetBullets = () => {
    setBullets([]);
  };

  return {
    bullets,
    setBullets,
    shootBullet,
    shootSpecialMissile,
    resetBullets,
  };
}; 