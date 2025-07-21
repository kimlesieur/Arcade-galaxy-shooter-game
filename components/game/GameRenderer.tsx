"use no memo";

import React, { useMemo } from 'react';
import { Group, Path, Skia, Rect, Circle, Image, useImage } from '@shopify/react-native-skia';
import { EnemyShip, Bullet, Barrier, Collectible } from './types';
import { PLAYER_WIDTH, PLAYER_HEIGHT, ENEMY_WIDTH, ENEMY_HEIGHT } from '../../utils/constants';
import BulletRenderer from './BulletRenderer';

interface MinimalGameRendererProps {
  playerX: number;
  playerY: number;
  screenWidth: number;
  screenHeight: number;
  bullets: Bullet[];
  enemies: EnemyShip[];
  barriers: Barrier[];
  collectibles: Collectible[];
  isSpecialMissileCharging?: boolean;
  specialMissileChargeProgress?: number;
  triggerSpecialFireEffect?: boolean;
}

function renderEnemies(
  enemies: EnemyShip[], 
  screenWidth: number, 
  screenHeight: number,
  enemy01Image: any,
  enemy02Image: any,
  enemy03Image: any,
  enemy04Image: any,
) {
  return enemies.map((enemy) => {
    // Memoize transform array for each enemy
    const transform = [
      { translateX: enemy.x * screenWidth },
      { translateY: enemy.y * screenHeight },
    ];
    
    // Choose image based on enemy type
    let enemyImage;
    switch (enemy.type) {
      case 'red':
        enemyImage = enemy01Image;
        break;
      case 'purple':
        enemyImage = enemy02Image;
        break;
      case 'blue':
        enemyImage = enemy03Image;
        break;
      case 'green':
        enemyImage = enemy04Image;
        break;
      default:
        enemyImage = enemy01Image; // fallback
    }
    
    return (
      <Group
        key={enemy.id}
        transform={transform}
      >
        {enemyImage ? (
          <Image
            image={enemyImage}
            x={-ENEMY_WIDTH / 2}
            y={0}
            width={ENEMY_WIDTH}
            height={ENEMY_HEIGHT}
          />
        ) : (
          // Fallback to colored rectangle if image fails to load
          <Rect
            x={-ENEMY_WIDTH / 2}
            y={0}
            width={ENEMY_WIDTH}
            height={ENEMY_HEIGHT}
            color={enemy.color}
          />
        )}
      </Group>
    );
  });
}

function renderBullets(bullets: Bullet[]) {
  return bullets.map((bullet) => (
    <BulletRenderer key={bullet.id} bullet={bullet} />
  ));
}

function renderBarriers(
  barriers: Barrier[], 
  screenWidth: number, 
  screenHeight: number,
) {
  return barriers.map((barrier) => {
    const barrierY = barrier.y * screenHeight;
    const segmentHeight = barrier.segmentHeight * screenHeight;
    const segmentGap = barrier.segmentGap * screenWidth;
    const openingStartX = barrier.openingPosition * screenWidth;
    const openingEndX = openingStartX + (barrier.openingWidth * screenWidth);
    const segmentWidth = barrier.segmentWidth * screenWidth;

    return (
      <Group key={barrier.id}>
        {/* Render barrier segments */}
        {Array.from({ length: barrier.segmentCount }, (_, index) => {
          const segmentX = index * (segmentWidth + segmentGap);
          
          // Skip segments that are in the opening
          if (segmentX + segmentWidth > openingStartX && segmentX < openingEndX) {
            return null;
          }
          
          return (
            <Rect
              key={`${barrier.id}-segment-${index}`}
              x={segmentX}
              y={barrierY}
              width={segmentWidth}
              height={segmentHeight}
              color={barrier.color}
            />
          );
        })}
      </Group>
    );
  });
}

function renderCollectibles(
  collectibles: Collectible[], 
  screenWidth: number, 
  screenHeight: number,
) {
  return collectibles.map((collectible) => {
    const transform = [
      { translateX: collectible.x * screenWidth },
      { translateY: collectible.y * screenHeight },
    ];
    
    const COLLECTIBLE_SIZE = 30;
    
    return (
      <Group
        key={collectible.id}
        transform={transform}
      >
        {/* Background circle */}
        <Circle
          cx={0}
          cy={0}
          r={COLLECTIBLE_SIZE / 2}
          color={collectible.color}
        />
        
        {/* Icon representation (simple shape for now) */}
        {collectible.type === 'health' && (
          <Circle
            cx={0}
            cy={0}
            r={COLLECTIBLE_SIZE / 4}
            color="#ffffff"
          />
        )}
        
        {collectible.type === 'shield' && (
          <Rect
            x={-COLLECTIBLE_SIZE / 4}
            y={-COLLECTIBLE_SIZE / 4}
            width={COLLECTIBLE_SIZE / 2}
            height={COLLECTIBLE_SIZE / 2}
            color="#ffffff"
          />
        )}
        
        {['sniper', 'shotgun', 'laser'].includes(collectible.type) && (
          <Circle
            cx={0}
            cy={0}
            r={COLLECTIBLE_SIZE / 6}
            color="#ffffff"
          />
        )}
      </Group>
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
  barriers,
  collectibles,
  isSpecialMissileCharging = false,
  specialMissileChargeProgress = 0,
  triggerSpecialFireEffect = false,
}: MinimalGameRendererProps) {
  // Load the player ship image
  const playerShipImage = useImage(require('../../assets/images/player_ship.png'));

  // Load enemy images
  const enemy01Image = useImage(require('../../assets/images/enemies/enemy_01.png'));
  const enemy02Image = useImage(require('../../assets/images/enemies/enemy_02.png'));
  const enemy03Image = useImage(require('../../assets/images/enemies/enemy_03.png'));
  const enemy04Image = useImage(require('../../assets/images/enemies/enemy_04.png'));

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
    () => renderEnemies(enemies, screenWidth, screenHeight, enemy01Image, enemy02Image, enemy03Image, enemy04Image),
    [enemies, screenWidth, screenHeight, enemy01Image, enemy02Image, enemy03Image, enemy04Image]
  );

  // Memoize bullet rendering
  const bulletElements = useMemo(
    () => renderBullets(bullets),
    [bullets]
  );

  // Memoize barrier rendering
  const barrierElements = useMemo(
    () => renderBarriers(barriers, screenWidth, screenHeight),
    [barriers, screenWidth, screenHeight]
  );

  // Memoize collectible rendering
  const collectibleElements = useMemo(
    () => renderCollectibles(collectibles, screenWidth, screenHeight),
    [collectibles, screenWidth, screenHeight]
  );

  // Only render, no local enemy state or game loop
  return (
    <>
      {/* Render enemies */}
      {enemyElements}
      {/* Render bullets */}
      {bulletElements}
      {/* Render barriers */}
      {barrierElements}
      {/* Render collectibles */}
      {collectibleElements}
      
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
