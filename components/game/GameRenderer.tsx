import React, { useMemo } from 'react';
import { Group, Path, Skia, Rect, Circle, Image, useImage } from '@shopify/react-native-skia';
import { EnemyShip, Bullet } from './types';
import { PLAYER_WIDTH, PLAYER_HEIGHT, ENEMY_WIDTH, ENEMY_HEIGHT } from '../../utils/constants';

interface MinimalGameRendererProps {
  playerX: number;
  playerY: number;
  screenWidth: number;
  screenHeight: number;
  bullets: Bullet[];
  enemies: EnemyShip[];
  isSpecialMissileCharging?: boolean;
  specialMissileChargeProgress?: number;
  triggerSpecialFireEffect?: boolean;
}

function renderEnemies(enemies: EnemyShip[], screenWidth: number, screenHeight: number) {
  return enemies.map((enemy) => {
    // Memoize transform array for each enemy
    const transform = [
      { translateX: enemy.x * screenWidth },
      { translateY: enemy.y * screenHeight },
    ];
    return (
      <Group
        key={enemy.id}
        transform={transform}
      >
        <Rect
          x={-ENEMY_WIDTH / 2}
          y={0}
          width={ENEMY_WIDTH}
          height={ENEMY_HEIGHT}
          color={enemy.color}
        />
      </Group>
    );
  });
}

function renderBullets(bullets: Bullet[]) {
  return bullets.map((bullet) => {
    const isSpecial = bullet.type === 'special';
    if (isSpecial) {
      // Spectacular special missile with multiple effects
      const time = Date.now() * 0.01; // For animation
      const pulseScale = 1 + Math.sin(time * 8) * 0.2; // Pulsing effect
      const trailLength = 12; // Number of trail particles
      const sizeMultiplier = 3.0; // 100% bigger effects (double size)
      
      // Color cycling effect
      const hue1 = (time * 50) % 360; // Fast cycling
      const hue2 = (time * 30 + 180) % 360; // Slower cycling, offset

      return (
        <Group key={bullet.id}>
          {/* Long animated trail particles */}
          {Array.from({ length: trailLength }).map((_, index) => {
            const trailOffset = index * 4;
            const trailOpacity = (trailLength - index) / trailLength * 0.8;
            const trailScale = (1 - (index / trailLength) * 0.7) * sizeMultiplier;
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
          {Array.from({ length: 8 }).map((_, index) => {
            const angle = (index / 8) * Math.PI * 2 + time * 3;
            const particleX = bullet.x + Math.cos(angle) * bullet.radius * 2.2 * sizeMultiplier;
            const particleY = bullet.y + Math.sin(angle) * bullet.radius * 2.2 * sizeMultiplier;
            const particleOpacity = 0.6 + Math.sin(time * 6 + index) * 0.4;
            const particleHue = (hue1 + index * 45) % 360;
            
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
          {Array.from({ length: 4 }).map((_, index) => {
            const angle = (index / 4) * Math.PI * 2 + time * 4;
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
    }
    // Regular bullet (unchanged)
    return (
      <Circle
        key={bullet.id}
        cx={bullet.x}
        cy={bullet.y}
        r={bullet.radius}
        color="#ffff00"
      />
    );
  });
}

function renderPlayerHalo(
  playerX: number, 
  playerY: number, 
  isCharging: boolean, 
  chargeProgress: number
) {
  if (!isCharging) return null;
  
  const baseRadius = Math.max(PLAYER_WIDTH, PLAYER_HEIGHT) / 2;
  const haloRadius = baseRadius + (chargeProgress * 30); // Grow up to 30px larger
  const opacity = 0.3 + (chargeProgress * 0.4); // 0.3 to 0.7 opacity
  
  return (
    <Circle
      cx={playerX}
      cy={playerY}
      r={haloRadius}
      color={`rgba(255, 107, 53, ${opacity})`}
      style="fill"
    />
  );
}

function renderSpecialFireEffect(
  playerX: number, 
  playerY: number, 
  triggerEffect: boolean
) {
  if (!triggerEffect) return null;
  
  // Create multiple expanding circles for the fire effect
  const effects = [];
  const baseRadius = Math.max(PLAYER_WIDTH, PLAYER_HEIGHT) / 2;
  
  // Inner bright core
  effects.push(
    <Circle
      key="fire-effect-core"
      cx={playerX}
      cy={playerY}
      r={baseRadius + 5}
      color="rgba(255, 255, 255, 0.8)"
      style="fill"
    />
  );
  
  // Middle orange layer
  effects.push(
    <Circle
      key="fire-effect-middle"
      cx={playerX}
      cy={playerY}
      r={baseRadius + 15}
      color="rgba(255, 107, 53, 0.7)"
      style="fill"
    />
  );
  
  // Outer glow
  effects.push(
    <Circle
      key="fire-effect-outer"
      cx={playerX}
      cy={playerY}
      r={baseRadius + 25}
      color="rgba(255, 107, 53, 0.3)"
      style="fill"
    />
  );
  
  return <>{effects}</>;
}

function GameRenderer({
  playerX,
  playerY,
  screenWidth,
  screenHeight,
  bullets,
  enemies,
  isSpecialMissileCharging = false,
  specialMissileChargeProgress = 0,
  triggerSpecialFireEffect = false,
}: MinimalGameRendererProps) {
  // Load the player ship image
  const playerShipImage = useImage(require('../../assets/images/player_ship.png'));

  // Memoize player ship path (fallback if image fails to load)
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

  // Memoize player ship transform
  const playerShipTransform = useMemo(
    () => [
      { translateX: playerX },
      { translateY: playerY },
    ],
    [playerX, playerY]
  );

  // Memoize enemy rendering
  const enemyElements = useMemo(
    () => renderEnemies(enemies, screenWidth, screenHeight),
    [enemies, screenWidth, screenHeight]
  );

  // Memoize bullet rendering
  const bulletElements = useMemo(
    () => renderBullets(bullets),
    [bullets]
  );

  // Only render, no local enemy state or game loop
  return (
    <>
      {/* Render enemies */}
      {enemyElements}
      {/* Render bullets */}
      {bulletElements}
      
      {/* Render special fire effect (behind player) */}
      {renderSpecialFireEffect(playerX, playerY, triggerSpecialFireEffect)}
      
      {/* Render player halo (behind player) */}
      {renderPlayerHalo(playerX, playerY, isSpecialMissileCharging, specialMissileChargeProgress)}
      
      {/* Player ship */}
      <Group transform={playerShipTransform}>
        {playerShipImage ? (
          <Image
            image={playerShipImage}
            x={-PLAYER_WIDTH / 2} // Center the image
            y={-PLAYER_HEIGHT / 2}
            width={PLAYER_WIDTH}
            height={PLAYER_HEIGHT}
          />
        ) : (
          <Path path={playerShipPath} color="#00ffff" />
        )}
      </Group>
    </>
  );
}

// Wrap GameRenderer with React.memo for performance
const MemoizedGameRenderer = React.memo(GameRenderer);
export default MemoizedGameRenderer;
