import React, { useEffect } from 'react';
import { Canvas, Circle } from '@shopify/react-native-skia';
import { useSharedValue, withTiming, useAnimatedReaction, runOnJS } from 'react-native-reanimated';

interface ExplosionParticlesProps {
  x: number;
  y: number;
  type: 'red' | 'purple';
  onFinish?: () => void;
}

interface Particle {
  angle: number;
  speed: number;
  size: number;
  color: string;
  startX: number;
  startY: number;
}

const PARTICLE_COUNT = 20;
const DURATION = 500; // ms

function getColorPalette(type: 'red' | 'purple') {
  if (type === 'purple') {
    return ['#a259e6', '#7f53ac', '#b8a1f7', '#ffffff', '#5e60ce'];
  }
  return ['#ffec99', '#ffb347', '#ff3333', '#ffd700', '#ff9800'];
}

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

const ExplosionParticles: React.FC<ExplosionParticlesProps> = ({ x, y, type, onFinish }) => {
  // Generate particles on mount
  const particles = React.useMemo<Particle[]>(() => {
    const palette = getColorPalette(type);
    return Array.from({ length: PARTICLE_COUNT }).map(() => {
      const angle = randomBetween(0, 2 * Math.PI);
      const speed = randomBetween(100, 200); // px/sec (explosion area)
      const size = randomBetween(3, 10);
      const color = palette[Math.floor(Math.random() * palette.length)];
      return { angle, speed, size, color, startX: x, startY: y };
    });
  }, [x, y, type]);

  // Animation progress (0 to 1)
  const progress = useSharedValue(0);
  const [progressState, setProgressState] = React.useState(0);

  useEffect(() => {
    progress.value = withTiming(1, { duration: DURATION });
  }, [progress]);

  useAnimatedReaction(
    () => progress.value,
    (current, prev) => {
      if (current !== prev) {
        runOnJS(setProgressState)(current);
      }
    },
    [progress]
  );

  // Call onFinish when done
  useEffect(() => {
    if (!onFinish) return;
    if (progressState >= 1) {
      onFinish();
    }
  }, [progressState, onFinish]);

  return (
    <Canvas style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 50 }}>
      {particles.map((p, i) => {
        // Calculate position
        const dist = p.speed * progressState * DURATION / 1000; // px
        const px = p.startX + Math.cos(p.angle) * dist;
        const py = p.startY + Math.sin(p.angle) * dist;
        // Fade out
        const opacity = 1 - progressState;
        return (
          <Circle
            key={i}
            cx={px}
            cy={py}
            r={p.size / 2}
            color={p.color}
            opacity={opacity}
          />
        );
      })}
    </Canvas>
  );
};

export default ExplosionParticles; 