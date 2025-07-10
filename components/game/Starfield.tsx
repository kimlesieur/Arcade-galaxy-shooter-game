import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, runOnJS } from 'react-native-reanimated';

interface Star {
  x: number;
  y: Animated.SharedValue<number>;
  speed: number;
  size: number;
}

interface StarfieldProps {
  width: number;
  height: number;
  starCount?: number;
}

const getRandom = (min: number, max: number) => Math.random() * (max - min) + min;

const Starfield: React.FC<StarfieldProps> = ({ width, height, starCount = 60 }) => {
  // Create stars with random positions, speeds, and sizes
  const stars = useRef<Star[]>(
    Array.from({ length: starCount }).map(() => {
      return {
        x: getRandom(0, width),
        y: useSharedValue(getRandom(0, height)),
        speed: getRandom(30, 100), // pixels per second
        size: getRandom(3, 6), // Increased min size for visibility
      };
    })
  ).current;

  useEffect(() => {
    let isMounted = true;
    let lastTimestamp = Date.now();

    const animate = () => {
      if (!isMounted) return;
      const now = Date.now();
      const delta = (now - lastTimestamp) / 1000; // seconds
      lastTimestamp = now;
      stars.forEach(star => {
        star.y.value += star.speed * delta;
        if (star.y.value > height) {
          star.y.value = 0;
          star.x = getRandom(0, width);
        }
      });
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
    return () => {
      isMounted = false;
    };
  }, [height, width, stars]);

  return (
    <View style={[StyleSheet.absoluteFill, { width, height, zIndex: 0, backgroundColor: 'rgba(139, 116, 197, 0.2)' }]}> 
      {stars.map((star, i) => {
        const style = useAnimatedStyle(() => ({
          position: 'absolute',
          left: star.x,
          top: star.y.value,
          width: star.size,
          height: star.size,
          borderRadius: star.size / 2,
          backgroundColor: 'white',
          opacity: 0.7,
        }));
        return <Animated.View key={i} style={style} />;
      })}
    </View>
  );
};

export default Starfield; 