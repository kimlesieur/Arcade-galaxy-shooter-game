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

  // Create player ship path (fallback if image fails to load)
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

  // Only render, no local enemy state or game loop
  return (
    <>
      {/* Render enemies */}
      {enemies.map((enemy) => (
        <Group
          key={enemy.id}
          transform={[
            { translateX: enemy.x * screenWidth },
            { translateY: enemy.y * screenHeight },
          ]}
        >
          <Rect
            x={-ENEMY_WIDTH / 2}
            y={0}
            width={ENEMY_WIDTH}
            height={ENEMY_HEIGHT}
            color={enemy.color}
          />
        </Group>
      ))}
      {/* Render bullets */}
      {bullets.map((bullet) => (
        <Circle
          key={bullet.id}
          cx={bullet.x}
          cy={bullet.y}
          r={bullet.radius}
          color="#ffff00"
        />
      ))}
      {/* Player ship */}
      <Group transform={[{ translateX: playerX }, { translateY: playerY }]}>
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
