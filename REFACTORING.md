# Game Refactoring Documentation

## Overview

The `GameScreen.tsx` component has been refactored to separate concerns into custom hooks and reusable components. This improves code organization, testability, and maintainability.

## New Structure

### Hooks (`hooks/`)

#### Core Game Logic
- **`useGameLogic.ts`** - Main orchestrator hook that combines all other hooks

#### Game Systems
- **`useBullets.ts`** - Manages bullet state, movement, and shooting logic
- **`useEnemies.ts`** - Handles enemy spawning, movement, and lifecycle
- **`useCollisionDetection.ts`** - Manages collision detection between game objects
- **`useExplosions.ts`** - Manages explosion effects and animations

### Stores (`stores/`)

#### State Management
- **`SettingsStore.ts`** - Manages game settings (sound, music, bullet state)
- **`GameLogicStore.ts`** - Manages core game state and special missile system
- **`AudioStore.ts`** - Manages all audio functionality (background music, sound effects)

### Components (`components/interface/`)

#### UI Components
- **`GameUI.tsx`** - Score display, health display, and game over overlay
- **`GameCanvas.tsx`** - Game rendering canvas with background and game objects
- **`ExplosionOverlay.tsx`** - Explosion effects overlay
- **`SpecialMissileButton.tsx`** - Special missile charging and firing button

## Usage

### Basic Usage

```tsx
import { useGameLogic } from '../hooks';
import { GameUI, GameCanvas, ExplosionOverlay, SpecialMissileButton } from './interface';

export default function GameScreen() {
  const {
    // Game state
    playerX, playerY, score, playerHealth, gameOver,
    // Game objects
    bullets, enemies, explosions,
    // Special missile state
    isSpecialMissileCharging, specialMissileChargeProgress, triggerSpecialFireEffect,
    // Actions
    setPlayerX, handleRestart, shootSpecialMissile,
    // Special missile actions
    setIsSpecialMissileCharging, setSpecialMissileChargeProgress,
    // Explosion actions
    removeExplosion,
  } = useGameLogic();

  return (
    <View>
      <GameUI
        score={score}
        playerHealth={playerHealth}
        gameOver={gameOver}
        onRestart={handleRestart}
      />
      <GameCanvas
        playerX={playerX}
        playerY={playerY}
        bullets={bullets}
        enemies={enemies}
        isSpecialMissileCharging={isSpecialMissileCharging}
        specialMissileChargeProgress={specialMissileChargeProgress}
        triggerSpecialFireEffect={triggerSpecialFireEffect}
      />
      <ExplosionOverlay
        explosions={explosions}
        onExplosionFinish={removeExplosion}
      />
      <SpecialMissileButton
        onSpecialMissileReady={shootSpecialMissile}
        onChargingStart={() => setIsSpecialMissileCharging(true)}
        onChargingEnd={() => setIsSpecialMissileCharging(false)}
        onChargeProgress={setSpecialMissileChargeProgress}
        disabled={gameOver}
      />
    </View>
  );
}
```

### Direct Store Usage

You can also use the stores directly if you need more granular control:

```tsx
import { useGameLogicStore, useAudioStore, useSettingsStore } from '../stores';
import { useBullets } from '../hooks';

function CustomGameComponent() {
  const { playerX, playerY, score, gameOver } = useGameLogicStore();
  const { playShootSound } = useAudioStore();
  const { isSoundOn } = useSettingsStore();
  const { bullets, shootBullet } = useBullets(gameOver, false, playerPosRef, playShootSound, () => {});
  
  // Custom logic here
}
```

## Benefits of Refactoring

1. **Separation of Concerns** - Each hook and component has a single responsibility
2. **Reusability** - Hooks can be reused in different components
3. **Testability** - Individual hooks and components can be tested in isolation
4. **Maintainability** - Easier to locate and fix issues
5. **Readability** - Main component is now much cleaner and easier to understand
6. **Performance** - Better optimization opportunities with isolated state
7. **State Management** - Centralized state management with Zustand stores

## Migration Notes

- The original `GameScreen.tsx` functionality is preserved
- All game mechanics work exactly the same
- The refactoring is purely structural - no behavioral changes
- All existing imports and dependencies remain the same
- Game state, special missile functionality, and audio are now managed directly through their respective stores

## Future Improvements

1. **Performance** - Add memoization to expensive calculations
2. **Testing** - Add unit tests for individual hooks and components
3. **Type Safety** - Add more comprehensive TypeScript interfaces
4. **Error Handling** - Add error boundaries and better error handling 