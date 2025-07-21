import React, { useState, useEffect } from 'react';
import { Animated, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ScreenShakeEffectProps {
  isShaking: boolean;
  intensity?: number; // 0-1, default 0.5
  duration?: number; // milliseconds, default 1000
  children: React.ReactNode;
}

export default function ScreenShakeEffect({ 
  isShaking, 
  intensity = 0.5, 
  duration = 1000,
  children 
}: ScreenShakeEffectProps) {
  const [shakeX] = useState(new Animated.Value(0));
  const [shakeY] = useState(new Animated.Value(0));

  useEffect(() => {
    if (isShaking) {
      // Create a complex shake pattern
      const shakeSequence = [];
      const shakeSteps = 30;
      const stepDuration = duration / shakeSteps;
      
      for (let i = 0; i < shakeSteps; i++) {
        // Random direction for each step
        const xOffset = (Math.random() - 0.5) * 2 * intensity * 15;
        const yOffset = (Math.random() - 0.5) * 2 * intensity * 10;
        
        shakeSequence.push(
          Animated.parallel([
            Animated.timing(shakeX, {
              toValue: xOffset,
              duration: stepDuration,
              useNativeDriver: true,
            }),
            Animated.timing(shakeY, {
              toValue: yOffset,
              duration: stepDuration,
              useNativeDriver: true,
            }),
          ])
        );
      }
      
      // Return to center
      shakeSequence.push(
        Animated.parallel([
          Animated.timing(shakeX, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(shakeY, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ])
      );
      
      Animated.sequence(shakeSequence).start();
    }
  }, [isShaking, intensity, duration, shakeX, shakeY]);

  return (
    <Animated.View
      style={{
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        transform: [
          { translateX: shakeX },
          { translateY: shakeY },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
} 