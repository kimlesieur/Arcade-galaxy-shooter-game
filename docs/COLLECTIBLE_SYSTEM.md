# Collectible System

## Overview
The collectible system adds floating objects that players can collect for various bonuses. Collectibles spawn periodically and move downward like enemies, but they provide beneficial effects when collected.

## Collectible Types

### 1. Health Pack (Green)
- **Icon**: Screwdriver (white circle on green background)
- **Effect**: Restores 1 health point (max 5 health)
- **Duration**: Permanent
- **Spawn Chance**: 15%
- **Description**: Basic health restoration item

### 2. Shield Generator (Blue)
- **Icon**: Shield (white square on blue background)
- **Effect**: Logs collection (shield system not yet implemented)
- **Duration**: Permanent (placeholder)
- **Spawn Chance**: 10%
- **Description**: Will provide shield protection in future updates

### 3. Sniper Ammo (Cyan)
- **Icon**: Sniper scope (white small circle on cyan background)
- **Effect**: Switches weapon to sniper bullets for 15 seconds
- **Duration**: 15 seconds
- **Spawn Chance**: 20%
- **Description**: Fast, precise weapon

### 4. Shotgun Ammo (Orange)
- **Icon**: Shotgun (white small circle on orange background)
- **Effect**: Switches weapon to shotgun spread for 15 seconds
- **Duration**: 15 seconds
- **Spawn Chance**: 20%
- **Description**: Wide spread weapon

### 5. Laser Ammo (Pink)
- **Icon**: Laser beam (white small circle on pink background)
- **Effect**: Switches weapon to laser beams for 15 seconds
- **Duration**: 15 seconds
- **Spawn Chance**: 15%
- **Description**: High-speed laser weapon

## Implementation Details

### Spawning System
- Collectibles spawn every 5 seconds (less frequently than enemies)
- Spawn position is random horizontally across the screen
- Spawn type is determined by weighted random selection based on spawn chances
- Total spawn chance is 80% (some randomness for variety)

### Movement
- Collectibles move downward at 60 units/second (slower than enemies for easier collection)
- They are removed when they go off-screen

### Collision Detection
- Collectibles use a 30x30 pixel collision box
- Player collision triggers collection and removes the collectible
- Haptic feedback provides light vibration on collection
- Collision spark effects are created at collection point

### Weapon System Integration
- Weapon collectibles override the current missile type for 15 seconds
- After expiration, the weapon reverts to the previously selected type
- The system automatically handles weapon switching and timing

### Health System Integration
- Health collectibles increase player health by 1 point
- Maximum health is capped at 5 points
- Health restoration is immediate and permanent

## Future Enhancements

### Shield System
- Implement actual shield protection mechanics
- Add shield durability and regeneration
- Create shield visual effects

### Visual Improvements
- Add proper icons for each collectible type
- Implement collection animations
- Add particle effects for collection

### Audio Integration
- Add collection sound effects
- Different sounds for different collectible types

### Advanced Features
- Rare collectibles with special effects
- Collectible combinations and synergies
- Achievement system for collection milestones 