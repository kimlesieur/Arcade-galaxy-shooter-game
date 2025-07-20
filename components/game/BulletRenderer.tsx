import React from 'react';
import { Group, Circle } from '@shopify/react-native-skia';
import { Bullet } from './types';
import { getMissileConfig } from '../../utils/missileConfigs';

interface BulletRendererProps {
  bullet: Bullet;
}

// Base bullet renderer for simple bullets
const SimpleBulletRenderer: React.FC<BulletRendererProps> = ({ bullet }) => {
  const config = getMissileConfig(bullet.type || 'normal');
  
  return (
    <Circle
      cx={bullet.x}
      cy={bullet.y}
      r={bullet.radius}
      color={config.visualEffects.color}
    />
  );
};

// Special missile renderer with spectacular effects
const SpecialMissileRenderer: React.FC<BulletRendererProps> = ({ bullet }) => {
  const config = getMissileConfig('special');
  const time = Date.now() * 0.01;
  const pulseScale = 1 + Math.sin(time * 8) * (config.visualEffects.pulseScale - 1);
  const sizeMultiplier = config.visualEffects.sizeMultiplier;
  
  // Color cycling effect
  const hue1 = (time * 50) % 360;
  const hue2 = (time * 30 + 180) % 360;

  return (
    <Group>
      {/* Long animated trail particles */}
      {Array.from({ length: config.visualEffects.trailLength }).map((_, index) => {
        const trailOffset = index * 4;
        const trailOpacity = (config.visualEffects.trailLength - index) / config.visualEffects.trailLength * 0.8;
        const trailScale = (1 - (index / config.visualEffects.trailLength) * 0.7) * sizeMultiplier;
        const trailHue = (hue1 + index * 10) % 360;
        
        return (
          <Circle
            key={`trail-${index}`}
            cx={bullet.x}
            cy={bullet.y + trailOffset}
            r={bullet.radius * trailScale}
            color={`hsla(${trailHue}, 100%, 70%, ${trailOpacity})`}
            style="fill"
          />
        );
      })}
      
      {/* Outer energy field */}
      <Circle
        cx={bullet.x}
        cy={bullet.y}
        r={bullet.radius * 3 * sizeMultiplier}
        color={`hsla(${hue1}, 100%, 50%, 0.15)`}
        style="fill"
      />
      
      {/* Pulsing outer ring */}
      <Circle
        cx={bullet.x}
        cy={bullet.y}
        r={bullet.radius * 2.5 * pulseScale * sizeMultiplier}
        color={`hsla(${hue2}, 100%, 60%, 0.3)`}
        style="fill"
      />
      
      {/* Middle energy ring */}
      <Circle
        cx={bullet.x}
        cy={bullet.y}
        r={bullet.radius * 2 * sizeMultiplier}
        color={`hsla(${hue1}, 100%, 70%, 0.5)`}
        style="fill"
      />
      
      {/* Inner core glow */}
      <Circle
        cx={bullet.x}
        cy={bullet.y}
        r={bullet.radius * 1.5 * sizeMultiplier}
        color="rgba(255, 255, 255, 0.8)"
        style="fill"
      />
      
      {/* Bright center */}
      <Circle
        cx={bullet.x}
        cy={bullet.y}
        r={bullet.radius * 0.8 * sizeMultiplier}
        color="rgba(255, 255, 255, 1)"
        style="fill"
      />
      
      {/* Rotating energy particles */}
      {Array.from({ length: config.visualEffects.particleCount }).map((_, index) => {
        const angle = (index / config.visualEffects.particleCount) * Math.PI * 2 + time * 3;
        const particleX = bullet.x + Math.cos(angle) * bullet.radius * 2.2 * sizeMultiplier;
        const particleY = bullet.y + Math.sin(angle) * bullet.radius * 2.2 * sizeMultiplier;
        const particleOpacity = 0.6 + Math.sin(time * 6 + index) * 0.4;
        const particleHue = (hue1 + index * (360 / config.visualEffects.particleCount)) % 360;
        
        return (
          <Circle
            key={`particle-${index}`}
            cx={particleX}
            cy={particleY}
            r={3 * sizeMultiplier}
            color={`hsla(${particleHue}, 100%, 70%, ${particleOpacity})`}
            style="fill"
          />
        );
      })}
      
      {/* Inner rotating particles */}
      {Array.from({ length: Math.floor(config.visualEffects.particleCount / 2) }).map((_, index) => {
        const angle = (index / Math.floor(config.visualEffects.particleCount / 2)) * Math.PI * 2 + time * 4;
        const particleX = bullet.x + Math.cos(angle) * bullet.radius * 1.2 * sizeMultiplier;
        const particleY = bullet.y + Math.sin(angle) * bullet.radius * 1.2 * sizeMultiplier;
        const particleOpacity = 0.8 + Math.sin(time * 8 + index) * 0.2;
        
        return (
          <Circle
            key={`inner-particle-${index}`}
            cx={particleX}
            cy={particleY}
            r={2 * sizeMultiplier}
            color={`rgba(255, 255, 255, ${particleOpacity})`}
            style="fill"
          />
        );
      })}
    </Group>
  );
};

// Sniper bullet renderer - precise and fast
const SniperBulletRenderer: React.FC<BulletRendererProps> = ({ bullet }) => {
  const config = getMissileConfig('sniper');
  
  return (
    <Group>
      {/* Fast trail effect */}
      {Array.from({ length: config.visualEffects.trailLength }).map((_, index) => {
        const trailOffset = index * 2;
        const trailOpacity = (config.visualEffects.trailLength - index) / config.visualEffects.trailLength * 0.6;
        const trailScale = (1 - (index / config.visualEffects.trailLength) * 0.5) * config.visualEffects.sizeMultiplier;
        
        return (
          <Circle
            key={`trail-${index}`}
            cx={bullet.x}
            cy={bullet.y + trailOffset}
            r={bullet.radius * trailScale}
            color={`hsla(180, 100%, 70%, ${trailOpacity})`}
            style="fill"
          />
        );
      })}
      
      {/* Precise targeting dot */}
      <Circle
        cx={bullet.x}
        cy={bullet.y}
        r={bullet.radius * 0.3}
        color="rgba(255, 255, 255, 1)"
        style="fill"
      />
      
      {/* Outer glow */}
      <Circle
        cx={bullet.x}
        cy={bullet.y}
        r={bullet.radius * 1.5}
        color="rgba(0, 255, 255, 0.3)"
        style="fill"
      />
      
      {/* Main bullet */}
      <Circle
        cx={bullet.x}
        cy={bullet.y}
        r={bullet.radius}
        color={config.visualEffects.color}
        style="fill"
      />
    </Group>
  );
};

// Shotgun bullet renderer - wide spread effect
const ShotgunBulletRenderer: React.FC<BulletRendererProps> = ({ bullet }) => {
  const config = getMissileConfig('shotgun');
  const time = Date.now() * 0.01;
  
  return (
    <Group>
      {/* Spread trail effect */}
      {Array.from({ length: config.visualEffects.trailLength }).map((_, index) => {
        const trailOffset = index * 3;
        const trailOpacity = (config.visualEffects.trailLength - index) / config.visualEffects.trailLength * 0.7;
        const trailScale = (1 - (index / config.visualEffects.trailLength) * 0.6) * config.visualEffects.sizeMultiplier;
        const spreadAngle = Math.sin(time * 2 + index) * 0.1; // Slight spread effect
        const spreadX = bullet.x + Math.sin(spreadAngle) * index * 0.5;
        
        return (
          <Circle
            key={`trail-${index}`}
            cx={spreadX}
            cy={bullet.y + trailOffset}
            r={bullet.radius * trailScale}
            color={`hsla(30, 100%, 60%, ${trailOpacity})`}
            style="fill"
          />
        );
      })}
      
      {/* Spread particles */}
      {Array.from({ length: config.visualEffects.particleCount }).map((_, index) => {
        const angle = (index / config.visualEffects.particleCount) * Math.PI * 2 + time * 2;
        const particleX = bullet.x + Math.cos(angle) * bullet.radius * 1.5 * config.visualEffects.sizeMultiplier;
        const particleY = bullet.y + Math.sin(angle) * bullet.radius * 1.5 * config.visualEffects.sizeMultiplier;
        const particleOpacity = 0.5 + Math.sin(time * 4 + index) * 0.3;
        
        return (
          <Circle
            key={`particle-${index}`}
            cx={particleX}
            cy={particleY}
            r={2 * config.visualEffects.sizeMultiplier}
            color={`hsla(30, 100%, 60%, ${particleOpacity})`}
            style="fill"
          />
        );
      })}
      
      {/* Main bullet */}
      <Circle
        cx={bullet.x}
        cy={bullet.y}
        r={bullet.radius}
        color={config.visualEffects.color}
        style="fill"
      />
    </Group>
  );
};

// Laser beam renderer - continuous beam effect
const LaserBeamRenderer: React.FC<BulletRendererProps> = ({ bullet }) => {
  const config = getMissileConfig('laser');
  const time = Date.now() * 0.01;
  const pulseScale = 1 + Math.sin(time * 10) * (config.visualEffects.pulseScale - 1);
  
  return (
    <Group>
      {/* Long laser trail */}
      {Array.from({ length: config.visualEffects.trailLength }).map((_, index) => {
        const trailOffset = index * 2;
        const trailOpacity = (config.visualEffects.trailLength - index) / config.visualEffects.trailLength * 0.9;
        const trailScale = (1 - (index / config.visualEffects.trailLength) * 0.3) * config.visualEffects.sizeMultiplier;
        const pulseEffect = pulseScale * (1 - index / config.visualEffects.trailLength * 0.5);
        
        return (
          <Circle
            key={`trail-${index}`}
            cx={bullet.x}
            cy={bullet.y + trailOffset}
            r={bullet.radius * trailScale * pulseEffect}
            color={`hsla(330, 100%, 60%, ${trailOpacity})`}
            style="fill"
          />
        );
      })}
      
      {/* Energy core */}
      <Circle
        cx={bullet.x}
        cy={bullet.y}
        r={bullet.radius * 0.6}
        color="rgba(255, 255, 255, 1)"
        style="fill"
      />
      
      {/* Outer energy field */}
      <Circle
        cx={bullet.x}
        cy={bullet.y}
        r={bullet.radius * 2 * pulseScale}
        color="rgba(255, 0, 128, 0.4)"
        style="fill"
      />
      
      {/* Rotating energy particles */}
      {Array.from({ length: config.visualEffects.particleCount }).map((_, index) => {
        const angle = (index / config.visualEffects.particleCount) * Math.PI * 2 + time * 5;
        const particleX = bullet.x + Math.cos(angle) * bullet.radius * 1.8 * config.visualEffects.sizeMultiplier;
        const particleY = bullet.y + Math.sin(angle) * bullet.radius * 1.8 * config.visualEffects.sizeMultiplier;
        const particleOpacity = 0.7 + Math.sin(time * 8 + index) * 0.3;
        
        return (
          <Circle
            key={`particle-${index}`}
            cx={particleX}
            cy={particleY}
            r={2.5 * config.visualEffects.sizeMultiplier}
            color={`hsla(330, 100%, 70%, ${particleOpacity})`}
            style="fill"
          />
        );
      })}
    </Group>
  );
};

// Main bullet renderer component with switch-like pattern
const BulletRenderer: React.FC<BulletRendererProps> = ({ bullet }) => {
  const bulletType = bullet.type || 'normal';
  
  switch (bulletType) {
    case 'special':
      return <SpecialMissileRenderer bullet={bullet} />;
    case 'sniper':
      return <SniperBulletRenderer bullet={bullet} />;
    case 'shotgun':
      return <ShotgunBulletRenderer bullet={bullet} />;
    case 'laser':
      return <LaserBeamRenderer bullet={bullet} />;
    case 'normal':
    default:
      return <SimpleBulletRenderer bullet={bullet} />;
  }
};

export default BulletRenderer; 