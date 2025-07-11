import React, { useMemo } from 'react';
import { Group, Path, Skia, Rect, Circle, Image, useImage } from '@shopify/react-native-skia';
import { EnemyShip, Bullet } from './types';

interface MinimalGameRendererProps {
  playerX: number;
  playerY: number;
  screenWidth: number;
  screenHeight: number;
  bullets: Bullet[];
  enemies: EnemyShip[];
}

const ENEMY_WIDTH = 30;
const ENEMY_HEIGHT = 20;

export default function GameRenderer({
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
            x={-20} // Center the image (assuming 40x40 image)
            y={-20}
            width={40}
            height={40}
          />
        ) : (
          <Path path={playerShipPath} color="#00ffff" />
        )}
      </Group>
    </>
  );
}
