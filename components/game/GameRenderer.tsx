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

function GameRenderer({
  playerX,
  playerY,
  screenWidth,
  screenHeight,
  bullets,
  enemies,
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
