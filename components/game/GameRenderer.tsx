import React, { useMemo } from 'react';
import {
  Group,
  Rect,
  Circle,
  LinearGradient,
  vec,
  Text,
  useFont,
  Path,
  Skia,
} from '@shopify/react-native-skia';
import { SharedValue, useDerivedValue } from 'react-native-reanimated';
import { GameState, Enemy, Projectile, Explosion, PowerUp, Star } from './types';

interface GameRendererProps {
  gameState: GameState;
  enemies: Enemy[];
  projectiles: Projectile[];
  explosions: Explosion[];
  powerUps: PowerUp[];
  screenWidth: number;
  screenHeight: number;
  currentTime: SharedValue<number>;
}

export default function GameRenderer({
  gameState,
  enemies,
  projectiles,
  explosions,
  powerUps,
  screenWidth,
  screenHeight,
  currentTime,
}: GameRendererProps) {
  // Generate stars for background
  const stars = useMemo(() => {
    const starArray: Star[] = [];
    for (let i = 0; i < 100; i++) {
      starArray.push({
        x: Math.random() * screenWidth,
        y: Math.random() * screenHeight,
        speed: 50 + Math.random() * 100,
        size: 1 + Math.random() * 2,
        opacity: 0.3 + Math.random() * 0.7,
      });
    }
    return starArray;
  }, [screenWidth, screenHeight]);

  // Animate stars
  const animatedStars = useDerivedValue(() => {
    const time = currentTime.value / 1000;
    return stars.map(star => ({
      ...star,
      y: (star.y + star.speed * time) % (screenHeight + 50),
    }));
  });

  // Create player ship path
  const playerShipPath = useMemo(() => {
    const path = Skia.Path.Make();
    path.moveTo(0, 0);
    path.lineTo(-15, 20);
    path.lineTo(-8, 15);
    path.lineTo(0, 25);
    path.lineTo(8, 15);
    path.lineTo(15, 20);
    path.close();
    return path;
  }, []);

  return (
    <Group>
      {/* Background gradient */}
      <Rect x={0} y={0} width={screenWidth} height={screenHeight}>
        <LinearGradient
          start={vec(0, 0)}
          end={vec(0, screenHeight)}
          colors={['#0a0a23', '#1a1a3a', '#2a2a4a']}
        />
      </Rect>

      {/* Animated starfield */}
      <Group>
        {animatedStars.value.map((star, index) => (
          <Circle
            key={index}
            cx={star.x}
            cy={star.y}
            r={star.size}
            color={`rgba(255, 255, 255, ${star.opacity})`}
          />
        ))}
      </Group>

      {/* Player ship */}
      <Group
        transform={[
          { translateX: gameState.playerX },
          { translateY: gameState.playerY },
        ]}
      >
        <Path path={playerShipPath} color="#00ffff">
          <LinearGradient
            start={vec(0, 0)}
            end={vec(0, 25)}
            colors={['#00ffff', '#0088ff']}
          />
        </Path>
        {/* Engine glow */}
        <Circle cx={0} cy={25} r={3} color="rgba(0, 255, 255, 0.6)" />
      </Group>

      {/* Enemies */}
      {enemies.map(enemy => (
        <Group key={enemy.id}>
          <Rect
            x={enemy.x}
            y={enemy.y}
            width={enemy.width}
            height={enemy.height}
            color={enemy.color}
          />
          {/* Health bar for damaged enemies */}
          {enemy.health < enemy.maxHealth && (
            <Group>
              <Rect
                x={enemy.x}
                y={enemy.y - 8}
                width={enemy.width}
                height={3}
                color="rgba(255, 0, 0, 0.3)"
              />
              <Rect
                x={enemy.x}
                y={enemy.y - 8}
                width={(enemy.width * enemy.health) / enemy.maxHealth}
                height={3}
                color="#ff4444"
              />
            </Group>
          )}
        </Group>
      ))}

      {/* Projectiles */}
      {projectiles.map(projectile => (
        <Circle
          key={projectile.id}
          cx={projectile.x}
          cy={projectile.y}
          r={projectile.radius}
          color={projectile.isPlayer ? '#00ffff' : '#ff4444'}
        />
      ))}

      {/* Power-ups */}
      {powerUps.map(powerUp => {
        const colors = {
          extraLife: '#ff44ff',
          rapidFire: '#ffff44',
          shield: '#44ff44',
        };
        
        return (
          <Group key={powerUp.id}>
            <Circle
              cx={powerUp.x}
              cy={powerUp.y}
              r={powerUp.radius}
              color={colors[powerUp.type]}
              opacity={0.8}
            />
            <Circle
              cx={powerUp.x}
              cy={powerUp.y}
              r={powerUp.radius - 3}
              color={colors[powerUp.type]}
              opacity={0.4}
            />
          </Group>
        );
      })}

      {/* Explosions */}
      {explosions.map(explosion => (
        <Group key={explosion.id}>
          {/* Main explosion */}
          <Circle
            cx={explosion.x}
            cy={explosion.y}
            r={15 * explosion.scale}
            color={`rgba(255, ${explosion.type === 'enemy' ? '100' : '255'}, 0, ${explosion.opacity})`}
          />
          <Circle
            cx={explosion.x}
            cy={explosion.y}
            r={10 * explosion.scale}
            color={`rgba(255, 255, 0, ${explosion.opacity * 0.8})`}
          />
          
          {/* Particles */}
          {explosion.particles.map((particle, index) => (
            <Circle
              key={index}
              cx={explosion.x + particle.x}
              cy={explosion.y + particle.y}
              r={2}
              color={`rgba(255, 150, 0, ${explosion.opacity})`}
            />
          ))}
        </Group>
      ))}
    </Group>
  );
}