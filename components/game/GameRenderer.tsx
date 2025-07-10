import React, { useMemo } from 'react';
import { Group, Path, Skia, Rect } from '@shopify/react-native-skia';

interface MinimalGameRendererProps {
  playerX: number;
  playerY: number;
}

export default function GameRenderer({
  playerX,
  playerY,
}: MinimalGameRendererProps) {
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
    <>
      <Group
        transform={[
          { translateX: playerX },
          { translateY: playerY },
        ]}
      >
        <Path path={playerShipPath} color="#00ffff" />
      </Group>
    </>
  );
}