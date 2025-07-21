import React, { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { Canvas, Image, useImage, Group } from '@shopify/react-native-skia';

interface AsteroidBackgroundProps {
  width: number;
  height: number;
  asteroidCount?: number;
}

const getRandom = (min: number, max: number) => Math.random() * (max - min) + min;

interface Asteroid {
  x: number;
  y: number;
  speed: number;
  size: number;
  type: 'asteroid_01' | 'asteroid_02';
  rotation: number;
}

const generateAsteroid = (width: number, height: number): Asteroid => ({
  x: getRandom(0, width),
  y: getRandom(0, height),
  speed: getRandom(20, 60),
  size: getRandom(20, 70),
  type: Math.random() > 0.5 ? 'asteroid_01' : 'asteroid_02',
  rotation: getRandom(0, 360),
});

const generateAsteroids = (count: number, width: number, height: number): Asteroid[] => {
  return Array.from({ length: count }).map(() => generateAsteroid(width, height));
};

const AsteroidBackground: React.FC<AsteroidBackgroundProps> = ({ 
  width, 
  height, 
  asteroidCount = 8 
}) => {
  const [asteroids, setAsteroids] = React.useState<Asteroid[]>(() => 
    generateAsteroids(asteroidCount, width, height)
  );
  const animationRef = useRef<number | null>(null);
  const lastTimestamp = useRef<number>(0);

  // Load asteroid images
  const asteroid01Image = useImage(require('../../assets/images/background/asteroid_01.png'));
  const asteroid02Image = useImage(require('../../assets/images/background/asteroid_02.png'));

  // Update asteroids per frame
  useEffect(() => {
    let running = true;
    function animate(now: number) {
      if (!running) return;
      const delta = lastTimestamp.current ? (now - lastTimestamp.current) / 1000 : 0;
      lastTimestamp.current = now;
      
      setAsteroids(prevAsteroids =>
        prevAsteroids.map(asteroid => {
          const newY = asteroid.y + asteroid.speed * delta;
          // Rotation speed based on movement speed (faster movement = faster rotation)
          const rotationSpeed = asteroid.speed * getRandom(0, 0.02); // Random rotation speed multiplier between 0.02 and 0.10
          const newRotation = asteroid.rotation + rotationSpeed * delta;
          
          if (newY > height + asteroid.size) {
            // Respawn at the top with new random properties
            return {
              x: getRandom(0, width),
              y: -asteroid.size,
              speed: getRandom(20, 60),
              size: getRandom(40, 150),
              type: Math.random() > 0.5 ? 'asteroid_01' : 'asteroid_02',
              rotation: getRandom(0, 360),
            };
          }
          return { 
            ...asteroid, 
            y: newY,
            rotation: newRotation
          };
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

  // Regenerate asteroids if width/height/asteroidCount changes
  useEffect(() => {
    setAsteroids(generateAsteroids(asteroidCount, width, height));
  }, [asteroidCount, width, height]);

  if (!asteroid01Image || !asteroid02Image) {
    return null; // Don't render until images are loaded
  }

  return (
    <Canvas style={[StyleSheet.absoluteFill, { width, height, zIndex: 1 }]}>
      {asteroids.map((asteroid: Asteroid, i: number) => {
        const image = asteroid.type === 'asteroid_01' ? asteroid01Image : asteroid02Image;
        const halfSize = asteroid.size / 2;
        
                  return (
            <Group
              key={i}
              transform={[{ translateX: asteroid.x }, { translateY: asteroid.y }, { rotate: asteroid.rotation }]}
            >
              <Image
                image={image}
                x={-halfSize}
                y={-halfSize}
                width={asteroid.size}
                height={asteroid.size}
                opacity={0.3}
              />
            </Group>
          );
      })}
    </Canvas>
  );
};

export default AsteroidBackground; 