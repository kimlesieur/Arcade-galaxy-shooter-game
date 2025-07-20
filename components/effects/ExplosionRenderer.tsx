import React from 'react';
import { Group, Circle } from '@shopify/react-native-skia';
import { getExplosionConfig } from '../../utils/explosionConfigs';

interface ExplosionRendererProps {
  x: number;
  y: number;
  bulletType: string;
  progress: number; // 0 to 1
  onFinish?: () => void;
}

// Base explosion renderer with particles
const BaseExplosionRenderer: React.FC<ExplosionRendererProps> = ({ 
  x, 
  y, 
  bulletType, 
  progress 
}) => {
  const config = getExplosionConfig(bulletType);
  
  // Calculate particle positions
  const particles = Array.from({ length: config.particleCount }).map((_, index) => {
    const angle = (index / config.particleCount) * Math.PI * 2;
    const speed = config.particleSpeed;
    const distance = speed * progress * config.duration / 1000;
    const particleX = x + Math.cos(angle) * distance;
    const particleY = y + Math.sin(angle) * distance;
    const color = config.colors[index % config.colors.length];
    const opacity = 1 - progress;
    const size = config.particleSize * (1 - progress * 0.5);
    
    return { x: particleX, y: particleY, color, opacity, size };
  });

  return (
    <Group>
      {particles.map((particle, index) => (
        <Circle
          key={index}
          cx={particle.x}
          cy={particle.y}
          r={particle.size}
          color={particle.color}
          opacity={particle.opacity}
        />
      ))}
    </Group>
  );
};

// Shockwave effect renderer
const ShockwaveRenderer: React.FC<ExplosionRendererProps> = ({ 
  x, 
  y, 
  progress 
}) => {
  const shockwaveRadius = 50 + progress * 100;
  const opacity = (1 - progress) * 0.6;
  
  return (
    <Circle
      cx={x}
      cy={y}
      r={shockwaveRadius}
      color="rgba(255, 255, 255, 0.3)"
      opacity={opacity}
      style="stroke"
      strokeWidth={3}
    />
  );
};

// Flash effect renderer
const FlashRenderer: React.FC<ExplosionRendererProps> = ({ 
  x, 
  y, 
  progress 
}) => {
  const flashRadius = 30 * (1 - progress);
  const opacity = (1 - progress) * 0.8;
  
  return (
    <Circle
      cx={x}
      cy={y}
      r={flashRadius}
      color="rgba(255, 255, 255, 0.8)"
      opacity={opacity}
    />
  );
};

// Smoke effect renderer
const SmokeRenderer: React.FC<ExplosionRendererProps> = ({ 
  x, 
  y, 
  bulletType, 
  progress 
}) => {
  const config = getExplosionConfig(bulletType);
  const smokeParticles = Array.from({ length: 6 }).map((_, index) => {
    const angle = (index / 6) * Math.PI * 2;
    const speed = 80;
    const distance = speed * progress * config.duration / 1000;
    const smokeX = x + Math.cos(angle) * distance;
    const smokeY = y + Math.sin(angle) * distance + progress * 20; // Smoke rises
    const opacity = (1 - progress) * 0.4;
    const size = 8 + progress * 4;
    
    return { x: smokeX, y: smokeY, opacity, size };
  });

  return (
    <Group>
      {smokeParticles.map((smoke, index) => (
        <Circle
          key={index}
          cx={smoke.x}
          cy={smoke.y}
          r={smoke.size}
          color="rgba(100, 100, 100, 0.6)"
          opacity={smoke.opacity}
        />
      ))}
    </Group>
  );
};

// Sparks effect renderer
const SparksRenderer: React.FC<ExplosionRendererProps> = ({ 
  x, 
  y, 
  bulletType, 
  progress 
}) => {
  const config = getExplosionConfig(bulletType);
  const time = Date.now() * 0.01;
  const sparks = Array.from({ length: 8 }).map((_, index) => {
    const angle = (index / 8) * Math.PI * 2 + time * 2;
    const speed = 120;
    const distance = speed * progress * config.duration / 1000;
    const sparkX = x + Math.cos(angle) * distance;
    const sparkY = y + Math.sin(angle) * distance;
    const opacity = (1 - progress) * 0.8;
    const flicker = Math.sin(time * 10 + index) * 0.3 + 0.7;
    
    return { x: sparkX, y: sparkY, opacity: opacity * flicker };
  });

  return (
    <Group>
      {sparks.map((spark, index) => (
        <Circle
          key={index}
          cx={spark.x}
          cy={spark.y}
          r={2}
          color="rgba(255, 255, 0, 0.8)"
          opacity={spark.opacity}
        />
      ))}
    </Group>
  );
};

// Main explosion renderer component
const ExplosionRenderer: React.FC<ExplosionRendererProps> = ({ 
  x, 
  y, 
  bulletType, 
  progress, 
  onFinish 
}) => {
  const config = getExplosionConfig(bulletType);
  
  // Call onFinish when explosion is complete
  React.useEffect(() => {
    if (progress >= 1 && onFinish) {
      onFinish();
    }
  }, [progress, onFinish]);

  return (
    <Group>
      {/* Base explosion particles */}
      <BaseExplosionRenderer 
        x={x} 
        y={y} 
        bulletType={bulletType} 
        progress={progress} 
      />
      
      {/* Shockwave effect */}
      {config.effects.hasShockwave && (
        <ShockwaveRenderer 
          x={x} 
          y={y} 
          bulletType={bulletType} 
          progress={progress} 
        />
      )}
      
      {/* Flash effect */}
      {config.effects.hasFlash && (
        <FlashRenderer 
          x={x} 
          y={y} 
          bulletType={bulletType} 
          progress={progress} 
        />
      )}
      
      {/* Smoke effect */}
      {config.effects.hasSmoke && (
        <SmokeRenderer 
          x={x} 
          y={y} 
          bulletType={bulletType} 
          progress={progress} 
        />
      )}
      
      {/* Sparks effect */}
      {config.effects.hasSparks && (
        <SparksRenderer 
          x={x} 
          y={y} 
          bulletType={bulletType} 
          progress={progress} 
        />
      )}
    </Group>
  );
};

export default ExplosionRenderer; 