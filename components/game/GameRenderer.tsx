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
    return (
      <Circle
        key={bullet.id}
        cx={bullet.x}
        cy={bullet.y}
        r={bullet.radius}
        color={isSpecial ? "#ff6b35" : "#ffff00"}
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
