import React from 'react';
import { Group, Circle } from '@shopify/react-native-skia';
import { getCollisionSparkConfig, CollisionSparkType } from '../../utils/collisionSparkConfigs';

interface CollisionSparkEffectProps {
  x: number;
  y: number;
  progress: number; // 0 to 1
  configId?: CollisionSparkType; // Optional config ID, defaults to DEFAULT
  onFinish?: () => void;
}

const CollisionSparkEffect: React.FC<CollisionSparkEffectProps> = ({ 
  x, 
  y, 
  progress, 
  configId = CollisionSparkType.DEFAULT,
  onFinish 
}) => {
  // Call onFinish when effect is complete
  React.useEffect(() => {
    if (progress >= 1 && onFinish) {
      onFinish();
    }
  }, [progress, onFinish]);

  // Get spark configuration
  const sparkConfig = getCollisionSparkConfig(configId);

  // Calculate spark particle positions (following explosion pattern)
  const sparkParticles = Array.from({ length: sparkConfig.particleCount }).map((_, index) => {
    const angle = (index / sparkConfig.particleCount) * Math.PI * 2;
    const speed = sparkConfig.particleSpeed;
    const distance = speed * progress * sparkConfig.duration / 1000;
    const particleX = x + Math.cos(angle) * distance;
    const particleY = y + Math.sin(angle) * distance;
    const color = sparkConfig.colors[index % sparkConfig.colors.length];
    const opacity = 1 - progress;
    const size = sparkConfig.particleSize * (1 - progress * 0.3);
    
    return { x: particleX, y: particleY, color, opacity, size };
  });

  // Additional smaller sparks for more detail (if enabled)
  const smallSparks = sparkConfig.hasSmallSparks 
    ? Array.from({ length: 8 }).map((_, index) => {
        const angle = (index / 8) * Math.PI * 2 + Math.PI / 4; // Offset angle
        const speed = sparkConfig.particleSpeed * 0.6; // Slower than main sparks
        const distance = speed * progress * sparkConfig.duration / 1000;
        const sparkX = x + Math.cos(angle) * distance;
        const sparkY = y + Math.sin(angle) * distance;
        const opacity = (1 - progress) * 0.8;
        const size = (sparkConfig.particleSize * 0.6) * (1 - progress * 0.5);
        
        return { x: sparkX, y: sparkY, opacity, size };
      })
    : [];

  // Flash effect at collision point (if enabled)
  const flashRadius = sparkConfig.hasFlash ? 25 * (1 - progress) : 0;
  const flashOpacity = sparkConfig.hasFlash ? (1 - progress) * 0.7 : 0;

  return (
    <Group>
      {/* Flash effect */}
      {sparkConfig.hasFlash && (
        <Circle
          cx={x}
          cy={y}
          r={flashRadius}
          color="rgba(255, 255, 255, 0.9)"
          opacity={flashOpacity}
        />
      )}
      
      {/* Main spark particles */}
      {sparkParticles.map((particle, index) => (
        <Circle
          key={`main-${index}`}
          cx={particle.x}
          cy={particle.y}
          r={particle.size}
          color={particle.color}
          opacity={particle.opacity}
        />
      ))}
      
      {/* Small spark particles */}
      {smallSparks.map((spark, index) => (
        <Circle
          key={`small-${index}`}
          cx={spark.x}
          cy={spark.y}
          r={spark.size}
          color="#ffff00"
          opacity={spark.opacity}
        />
      ))}
    </Group>
  );
};

export default CollisionSparkEffect; 