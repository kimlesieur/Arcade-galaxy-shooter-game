# Barrier System

## Overview
The game now features a new obstacle type called barriers. Barriers are horizontal walls that move downward and act like enemies - they can hurt the player ship. Each barrier has an opening that the player must navigate through to avoid taking damage.

## Barrier Types

### 1. Classic Barrier (Gray)
- **Speed**: 60 units/second (Slowest)
- **Damage**: 1
- **Spawn Chance**: 30%
- **Difficulty**: Easy
- **Description**: Standard barrier with moderate difficulty
- **Properties**: 8 segments, 15% opening width

### 2. Fire Barrier (Red)
- **Speed**: 80 units/second (Medium)
- **Damage**: 2
- **Spawn Chance**: 25%
- **Difficulty**: Medium
- **Description**: Hot barrier that deals extra damage
- **Properties**: 10 segments, 12% opening width

### 3. Laser Barrier (Cyan)
- **Speed**: 100 units/second (Fast)
- **Damage**: 3
- **Spawn Chance**: 20%
- **Difficulty**: Hard
- **Description**: Fast laser barrier with high damage
- **Properties**: 12 segments, 10% opening width

### 4. Electric Barrier (Yellow)
- **Speed**: 70 units/second (Medium)
- **Damage**: 2
- **Spawn Chance**: 15%
- **Difficulty**: Medium
- **Description**: Electric barrier with chain damage
- **Properties**: 9 segments, 13% opening width

### 5. Plasma Barrier (Magenta)
- **Speed**: 90 units/second (Fast)
- **Damage**: 4
- **Spawn Chance**: 10%
- **Difficulty**: Hard
- **Description**: Deadly plasma barrier with maximum damage
- **Properties**: 14 segments, 8% opening width

## Implementation Details

### Configuration System
- Barrier configurations are stored in `utils/barrierConfigs.ts`
- Each barrier type has a complete configuration including speed, damage, color, and spawn chance
- The system is easily extensible for new barrier types

### Spawning System
- Barriers spawn every 3 seconds (less frequently than enemies)
- Maximum of 2 barriers visible on screen at any time
- Spawn chance is weighted based on difficulty
- Opening position is randomized for each barrier
- Barriers move downward at their configured speed

### Collision Detection
- Player-barrier collisions are checked in the game loop
- Collision occurs when the player hits a barrier segment (not the opening)
- Different barrier types deal different amounts of damage
- Barriers are removed when hit by the player

### Visual Representation
- Barriers are rendered as colored rectangles
- Each barrier consists of multiple segments with gaps
- The opening is created by skipping segments at a random position
- Different barrier types have different colors and segment counts

## Files Modified
- `utils/barrierConfigs.ts` - New barrier configuration system
- `components/game/types.ts` - Added Barrier interface
- `stores/GameObjectsStore.ts` - Updated to handle barriers
- `components/game/GameRenderer.tsx` - Added barrier rendering
- `hooks/useGameLogic.ts` - Added barrier collision detection
- `components/GameScreen.tsx` - Updated to pass barriers to renderer
- `components/interface/GameCanvas.tsx` - Updated to accept barriers

## Future Enhancements
- Barrier-specific visual effects (particles, animations)
- Barrier destruction effects
- Power-ups that can destroy barriers
- Barrier patterns and formations
- Difficulty scaling based on game level 