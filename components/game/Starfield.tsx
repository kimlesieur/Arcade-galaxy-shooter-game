import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Canvas, Circle } from '@shopify/react-native-skia';
import { useSharedValue, useDerivedValue, withRepeat, withTiming, useAnimatedReaction, runOnJS } from 'react-native-reanimated';

interface StarfieldProps {
  width: number;
  height: number;
  starCount?: number;
}

const getRandom = (min: number, max: number) => Math.random() * (max - min) + min;

interface Star {
  x: number;
  y: number;
  speed: number;
  size: number;
}

const generateStars = (count: number, width: number, height: number): Star[] => {
  return Array.from({ length: count }).map(() => ({
    x: getRandom(0, width),
    y: getRandom(0, height),
    speed: getRandom(30, 100),
    size: getRandom(3, 6),
  }));
};

const Starfield: React.FC<StarfieldProps> = ({ width, height, starCount = 60 }) => {
  // Memoize stars so they don't change on every render
  const stars = React.useMemo(() => generateStars(starCount, width, height), [starCount, width, height]);

  // Shared value for time offset
  const time = useSharedValue(0);

  // Animate time value to loop
  useEffect(() => {
    time.value = withRepeat(withTiming(height, { duration: 8000 }), -1, false);
  }, [height, time]);

  // Derived value for animated stars
  const animatedStars = useDerivedValue(() => {
    return stars.map(star => {
      // Move star down by (speed / 100) * time.value, wrap around height
      const newY = (star.y + (star.speed / 100) * time.value) % height;
      return { ...star, y: newY };
    });
  }, [time, stars, height]);

  // Mirror animatedStars.value to React state
  const [starsState, setStarsState] = React.useState<Star[]>(stars);
  useAnimatedReaction(
    () => animatedStars.value,
    (current, prev) => {
      if (current !== prev) {
        runOnJS(setStarsState)(current);
      }
    },
    [animatedStars]
  );

  return (
    <Canvas style={[StyleSheet.absoluteFill, { width, height, zIndex: 0 }]}> 
      {starsState.map((star: Star, i: number) => (
        <Circle
          key={i}
          cx={star.x}
          cy={star.y}
          r={star.size / 2}
          color="white"
          opacity={0.7}
        />
      ))}
    </Canvas>
  );
};

export default Starfield;
