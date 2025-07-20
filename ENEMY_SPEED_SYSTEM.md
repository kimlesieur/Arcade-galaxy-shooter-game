# Enemy Speed System

## Overview
The game now features different enemy types with varying speeds, health, and point values. Each enemy type has its own configuration that determines its behavior and difficulty.

## Enemy Types and Their Properties

### 1. Basic Fighter (Red)
- **Speed**: 80 units/second (Slowest)
- **Health**: 1
- **Points**: 1
- **Spawn Chance**: 40%
- **Difficulty**: Easy
- **Description**: Standard enemy with moderate speed, easiest to hit

### 2. Elite Fighter (Purple)
- **Speed**: 120 units/second (Fast)
- **Health**: 2
- **Points**: 2
- **Spawn Chance**: 10%
- **Difficulty**: Hard
- **Description**: Fast enemy with higher health and points

### 3. Interceptor (Blue)
- **Speed**: 100 units/second (Medium)
- **Health**: 1
- **Points**: 1
- **Spawn Chance**: 20%
- **Difficulty**: Medium
- **Description**: Balanced enemy with standard stats

### 4. Scout (Green)
- **Speed**: 140 units/second (Fastest)
- **Health**: 1
- **Points**: 2
- **Spawn Chance**: 15%
- **Difficulty**: Medium
- **Description**: Fast but fragile enemy

### 5. Heavy Fighter (Orange)
- **Speed**: 60 units/second (Slowest)
- **Health**: 3
- **Points**: 3
- **Spawn Chance**: 15%
- **Difficulty**: Hard
- **Description**: Slow but heavily armored enemy

## Implementation Details

### Configuration System
- Enemy configurations are stored in `utils/enemyConfigs.ts`
- Each enemy type has a complete configuration including speed, health, points, and spawn chance
- The system is easily extensible for new enemy types

### Speed Variation
- Speed ranges from 60 (slowest) to 140 (fastest) units per second
- This creates a 2.33x speed difference between the slowest and fastest enemies
- Speed affects how quickly enemies move down the screen

### Scoring System
- Points are awarded based on enemy type when destroyed
- Special missiles give double points
- Higher difficulty enemies give more points

### Health System
- Health varies from 1 to 3 points
- Currently all enemies are destroyed in one hit, but the system is ready for multi-hit enemies

## Files Modified
- `utils/enemyConfigs.ts` - New enemy configuration system
- `stores/GameObjectsStore.ts` - Updated enemy spawning and scoring logic
- `components/game/types.ts` - Updated EnemyShip interface

## Future Enhancements
- Multi-hit enemies (using the health system)
- Enemy-specific behaviors (shooting, movement patterns)
- Difficulty scaling based on game level
- Enemy-specific visual effects 