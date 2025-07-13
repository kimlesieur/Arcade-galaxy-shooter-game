import React, { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { Canvas, Circle } from '@shopify/react-native-skia';

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

const generateStar = (width: number, height: number): Star => ({
  x: getRandom(0, width),
  y: getRandom(0, height),
  speed: getRandom(30, 100),
  size: getRandom(3, 6),
});

const generateStars = (count: number, width: number, height: number): Star[] => {
  return Array.from({ length: count }).map(() => generateStar(width, height));
};

const Starfield: React.FC<StarfieldProps> = ({ width, height, starCount = 60 }) => {
  const [stars, setStars] = React.useState<Star[]>(() => generateStars(starCount, width, height));
  const animationRef = useRef<number | null>(null);
  const lastTimestamp = useRef<number>(0);

  // Update stars per frame
  useEffect(() => {
    let running = true;
    function animate(now: number) {
      if (!running) return;
      const delta = lastTimestamp.current ? (now - lastTimestamp.current) / 1000 : 0;
      lastTimestamp.current = now;
      setStars(prevStars =>
        prevStars.map(star => {
          const newY = star.y + star.speed * delta;
          if (newY > height) {
            // Respawn at the top with new random x, speed, and size
            return {
              x: getRandom(0, width),
              y: 0,
              speed: getRandom(30, 100),
              size: getRandom(3, 6),
            };
          }
          return { ...star, y: newY };
        })
      );
      animationRef.current = requestAnimationFrame(animate);
    }
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      running = false;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [width, height]);

  // Regenerate stars if width/height/starCount changes
  useEffect(() => {
    setStars(generateStars(starCount, width, height));
  }, [starCount, width, height]);

  return (
    <Canvas style={[StyleSheet.absoluteFill, { width, height, zIndex: 0 }]}> 
      {stars.map((star: Star, i: number) => (
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
