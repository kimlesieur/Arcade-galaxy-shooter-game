import { create } from 'zustand';
import { Bullet, EnemyShip, Barrier, Collectible } from '../components/game/types';
import { checkCollision } from '../components/game/utils';
import { PLAYER_WIDTH, PLAYER_HEIGHT, ENEMY_WIDTH, ENEMY_HEIGHT } from '../utils/constants';
import { Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSettingsStore } from './SettingsStore';
import { CollisionSparkType } from '../utils/collisionSparkConfigs';
import { ENEMY_CONFIGS } from '../utils/enemyConfigs';
import { BARRIER_CONFIGS } from '../utils/barrierConfigs';
import { selectRandomCollectible } from '../utils/collectibleConfigs';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Game object types
interface GameObjectsState {
  // Bullets
  bullets: Bullet[];
  
  // Enemies
  enemies: EnemyShip[];
  enemyTypeCounts: Record<'red' | 'purple' | 'blue' | 'green' | 'orange', number>; // Track counts for all enemy types
  spawnTimer: number;
  lastFrameTime: number | null;
  
  // Barriers
  barriers: Barrier[];
  barrierTypeCounts: Record<'classic' | 'fire' | 'laser' | 'electric' | 'plasma', number>; // Track counts for all barrier types
  barrierSpawnTimer: number;
  
  // Collectibles
  collectibles: Collectible[];
  collectibleSpawnTimer: number;
  collectibleTypeCounts: Record<'health' | 'shield' | 'sniper' | 'shotgun' | 'laser', number>;
  
  // Explosions
  explosions: { id: string; x: number; y: number; type: 'red' | 'purple' | 'blue' | 'green' | 'orange'; bulletType?: 'normal' | 'special' | 'sniper' | 'shotgun' | 'laser' }[];
  
  // Collision sparks
  collisionSparks: { id: string; x: number; y: number; configId?: CollisionSparkType }[];
  
  // Game loop
  animationFrameId: number | null;
  isGameLoopRunning: boolean;
}

interface GameObjectsActions {
  // Bullet actions
  addBullet: (bullet: Bullet) => void;
  updateBullets: (delta: number) => void;
  removeBullet: (id: string) => void;
  resetBullets: () => void;
  
  // Enemy actions
  addEnemy: (enemy: EnemyShip) => void;
  updateEnemies: (delta: number) => void;
  removeEnemy: (id: string) => void;
  resetEnemies: () => void;
  
  // Barrier actions
  addBarrier: (barrier: Barrier) => void;
  updateBarriers: (delta: number) => void;
  removeBarrier: (id: string) => void;
  resetBarriers: () => void;
  
  // Collectible actions
  addCollectible: (collectible: Collectible) => void;
  updateCollectibles: (delta: number) => void;
  removeCollectible: (id: string) => void;
  resetCollectibles: () => void;
  
  // Explosion actions
  addExplosion: (x: number, y: number, type: 'red' | 'purple' | 'blue' | 'green' | 'orange', bulletType?: 'normal' | 'special' | 'sniper' | 'shotgun' | 'laser') => void;
  removeExplosion: (id: string) => void;
  resetExplosions: () => void;
  
  // Collision spark actions
  addCollisionSpark: (x: number, y: number, configId?: CollisionSparkType) => void;
  removeCollisionSpark: (id: string) => void;
  resetCollisionSparks: () => void;
  
  // Game loop actions
  startGameLoop: () => void;
  stopGameLoop: () => void;
  
  // Collision detection - separated into two functions
  checkBulletEnemyCollisions: (params: {
    addScore: (points: number) => void;
  }) => void;
  
  checkPlayerEnemyCollisions: (params: {
    playerX: number;
    playerY: number;
    decrementHealth: () => void;
    playCollisionSound: () => void;
  }) => void;
  
  checkPlayerBarrierCollisions: (params: {
    playerX: number;
    playerY: number;
    decrementHealth: (damage: number) => void;
    playCollisionSound: () => void;
  }) => void;
  
  checkBulletBarrierCollisions: (params: {
    addScore: (points: number) => void;
  }) => void;
  
  checkPlayerCollectibleCollisions: (params: {
    playerX: number;
    playerY: number;
    onCollectHealth: () => void;
    onCollectShield: () => void;
    onCollectWeapon: (weaponType: string) => void;
  }) => void;
  
  // Spawning
  spawnEnemy: () => void;
  spawnBarrier: () => void;
  spawnCollectible: () => void;
  
  // Reset all
  resetAll: () => void;
}

export const useGameObjectsStore = create<GameObjectsState & GameObjectsActions>((set, get) => ({
  // Initial state
  bullets: [],
  enemies: [],
  enemyTypeCounts: { red: 0, purple: 0, blue: 0, green: 0, orange: 0 },
  spawnTimer: 0,
  lastFrameTime: null,
  barriers: [],
  barrierTypeCounts: { classic: 0, fire: 0, laser: 0, electric: 0, plasma: 0 },
  barrierSpawnTimer: 0,
  collectibles: [],
  collectibleSpawnTimer: 0,
  collectibleTypeCounts: { health: 0, shield: 0, sniper: 0, shotgun: 0, laser: 0 },
  explosions: [],
  collisionSparks: [],
  animationFrameId: null,
  isGameLoopRunning: false,

  // Bullet actions
  addBullet: (bullet: Bullet) => {
    set((state) => ({
      bullets: [...state.bullets, bullet]
    }));
  },

  updateBullets: (delta: number) => {
    set((state) => ({
      bullets: state.bullets
        .map((bullet) => ({
          ...bullet,
          y: bullet.y + bullet.velocityY * delta
        }))
        .filter((bullet) => {
          // Remove bullets that are off screen
          return bullet.y > -50 && bullet.y < SCREEN_HEIGHT + 50;
        })
    }));
  },

  removeBullet: (id: string) => {
    set((state) => ({
      bullets: state.bullets.filter((bullet) => bullet.id !== id)
    }));
  },

  resetBullets: () => {
    set({ bullets: [] });
  },

  // Enemy actions
  addEnemy: (enemy: EnemyShip) => {
    set((state) => ({
      enemies: [...state.enemies, enemy],
      enemyTypeCounts: {
        ...state.enemyTypeCounts,
        [enemy.type]: state.enemyTypeCounts[enemy.type] + 1
      }
    }));
  },

  updateEnemies: (delta: number) => {
    const ENEMY_SPAWN_INTERVAL = 1200;
    
    set((state) => {
      // Update spawn timer
      const newSpawnTimer = state.spawnTimer + delta * 1000;
      
      // Move enemies and handle off-screen removal
      let updatedEnemies = state.enemies.map((enemy) => ({
        ...enemy,
        y: enemy.y + (enemy.speed * delta) / SCREEN_HEIGHT,
      }));

      // Remove enemies that are off screen
      updatedEnemies = updatedEnemies.filter((enemy) => {
        return enemy.y * SCREEN_HEIGHT < SCREEN_HEIGHT + ENEMY_HEIGHT;
      });

      // Spawn new enemies if enough time has passed
      if (newSpawnTimer >= ENEMY_SPAWN_INTERVAL) {
        // Get enemies multiplier from settings
        const enemiesMultiplier = useSettingsStore.getState().enemiesMultiplier;
        
        // Get enemy types from configuration
        const enemyTypes = Object.values(ENEMY_CONFIGS);
        
        // Spawn multiple enemies based on multiplier
        for (let i = 0; i < enemiesMultiplier; i++) {
          // Select enemy type based on spawn chances
          const random = Math.random();
          let cumulativeChance = 0;
          let selectedEnemy = enemyTypes[0]; // default to first enemy
          
          for (const enemyType of enemyTypes) {
            cumulativeChance += enemyType.spawnChance;
            if (random <= cumulativeChance) {
              selectedEnemy = enemyType;
              break;
            }
          }
          
          const newEnemy: EnemyShip = {
            id: Math.random().toString(36).substr(2, 9),
            x: Math.random(),
            y: 0,
            speed: selectedEnemy.speed, // Use speed from configuration
            type: selectedEnemy.id as 'red' | 'purple' | 'blue' | 'green' | 'orange',
            color: selectedEnemy.color,
            health: selectedEnemy.health, // Use health from configuration
            maxHealth: selectedEnemy.health, // Set max health same as current health
            points: selectedEnemy.points, // Use points from configuration
          };
          
          updatedEnemies.push(newEnemy);
        }
      }

      // Calculate enemy type counts
      const newEnemyTypeCounts = { red: 0, purple: 0, blue: 0, green: 0, orange: 0 };
      updatedEnemies.forEach(enemy => {
        newEnemyTypeCounts[enemy.type]++;
      });

      return {
        enemies: updatedEnemies,
        spawnTimer: newSpawnTimer >= ENEMY_SPAWN_INTERVAL ? 0 : newSpawnTimer,
        enemyTypeCounts: newEnemyTypeCounts
      };
    });
  },

  removeEnemy: (id: string) => {
    set((state) => {
      const updatedEnemies = state.enemies.filter((enemy) => enemy.id !== id);
      
      // Calculate new enemy type counts
      const newEnemyTypeCounts = { red: 0, purple: 0, blue: 0, green: 0, orange: 0 };
      updatedEnemies.forEach(enemy => {
        newEnemyTypeCounts[enemy.type]++;
      });
      
      return {
        enemies: updatedEnemies,
        enemyTypeCounts: newEnemyTypeCounts
      };
    });
  },

  resetEnemies: () => {
    set({ 
      enemies: [], 
      enemyTypeCounts: { red: 0, purple: 0, blue: 0, green: 0, orange: 0 }, 
      spawnTimer: 0, 
      lastFrameTime: null 
    });
  },

  // Barrier actions
  addBarrier: (barrier: Barrier) => {
    set((state) => ({
      barriers: [...state.barriers, barrier],
      barrierTypeCounts: {
        ...state.barrierTypeCounts,
        [barrier.type]: state.barrierTypeCounts[barrier.type] + 1
      }
    }));
  },

  updateBarriers: (delta: number) => {
    const BARRIER_SPAWN_INTERVAL = 3000; // Spawn barriers less frequently than enemies
    
    set((state) => {
      // Update spawn timer
      const newBarrierSpawnTimer = state.barrierSpawnTimer + delta * 1000;
      
      // Move barriers and handle off-screen removal
      let updatedBarriers = state.barriers.map((barrier) => ({
        ...barrier,
        y: barrier.y + (barrier.speed * delta) / SCREEN_HEIGHT,
      }));

      // Remove barriers that are off screen
      updatedBarriers = updatedBarriers.filter((barrier) => {
        return barrier.y * SCREEN_HEIGHT < SCREEN_HEIGHT + 50; // Keep some margin
      });

      // Spawn new barriers if enough time has passed and there are fewer than 2 barriers on screen
      if (newBarrierSpawnTimer >= BARRIER_SPAWN_INTERVAL && updatedBarriers.length < 2) {
        // Check if there's enough distance between existing barriers (40% of screen height minimum)
        const MIN_BARRIER_DISTANCE = 0.4; // 40% of screen height
        let canSpawn = true;
        
        if (updatedBarriers.length > 0) {
          // Check distance from the closest existing barrier
          const closestBarrier = updatedBarriers.reduce((closest, barrier) => {
            return barrier.y < closest.y ? barrier : closest;
          });
          
          // If the closest barrier is too close to the top (where new barrier would spawn), don't spawn
          if (closestBarrier.y < MIN_BARRIER_DISTANCE) {
            canSpawn = false;
          }
        }
        
        if (canSpawn) {
          // Get barrier types from configuration
          const barrierTypes = Object.values(BARRIER_CONFIGS);
          
          // Select barrier type based on spawn chances
          const random = Math.random();
          let cumulativeChance = 0;
          let selectedBarrier = barrierTypes[0]; // default to first barrier
          
          for (const barrierType of barrierTypes) {
            cumulativeChance += barrierType.spawnChance;
            if (random <= cumulativeChance) {
              selectedBarrier = barrierType;
              break;
            }
          }
          
          // Calculate opening position (random position for the opening)
          const openingPosition = Math.random() * (1 - selectedBarrier.properties.openingWidth);
          
          const newBarrier: Barrier = {
            id: Math.random().toString(36).substr(2, 9),
            y: 0,
            speed: selectedBarrier.speed,
            type: selectedBarrier.id as 'classic' | 'fire' | 'laser' | 'electric' | 'plasma',
            color: selectedBarrier.color,
            damage: selectedBarrier.damage,
            openingPosition,
            openingWidth: selectedBarrier.properties.openingWidth,
            segmentCount: selectedBarrier.properties.segmentCount,
            segmentWidth: selectedBarrier.properties.segmentWidth,
            segmentGap: selectedBarrier.properties.segmentGap,
            segmentHeight: selectedBarrier.properties.segmentHeight,
          };
          
          updatedBarriers.push(newBarrier);
        }
      }

      // Calculate barrier type counts
      const newBarrierTypeCounts = { classic: 0, fire: 0, laser: 0, electric: 0, plasma: 0 };
      updatedBarriers.forEach(barrier => {
        newBarrierTypeCounts[barrier.type]++;
      });

      return {
        barriers: updatedBarriers,
        barrierSpawnTimer: newBarrierSpawnTimer >= BARRIER_SPAWN_INTERVAL ? 0 : newBarrierSpawnTimer,
        barrierTypeCounts: newBarrierTypeCounts
      };
    });
  },

  removeBarrier: (id: string) => {
    set((state) => {
      const updatedBarriers = state.barriers.filter((barrier) => barrier.id !== id);
      
      // Calculate new barrier type counts
      const newBarrierTypeCounts = { classic: 0, fire: 0, laser: 0, electric: 0, plasma: 0 };
      updatedBarriers.forEach(barrier => {
        newBarrierTypeCounts[barrier.type]++;
      });
      
      return {
        barriers: updatedBarriers,
        barrierTypeCounts: newBarrierTypeCounts
      };
    });
  },

  resetBarriers: () => {
    set({ 
      barriers: [], 
      barrierTypeCounts: { classic: 0, fire: 0, laser: 0, electric: 0, plasma: 0 }, 
      barrierSpawnTimer: 0
    });
  },

  // Collectible actions
  addCollectible: (collectible: Collectible) => {
    set((state) => ({
      collectibles: [...state.collectibles, collectible]
    }));
  },

  updateCollectibles: (delta: number) => {
    const COLLECTIBLE_SPAWN_INTERVAL = 5000; // Spawn collectibles less frequently than enemies
    
    set((state) => {
      // Update spawn timer
      const newCollectibleSpawnTimer = state.collectibleSpawnTimer + delta * 1000;
      
      // Move collectibles and handle off-screen removal
      let updatedCollectibles = state.collectibles.map((collectible) => ({
        ...collectible,
        y: collectible.y + (collectible.speed * delta) / SCREEN_HEIGHT,
      }));

      // Remove collectibles that are off screen
      updatedCollectibles = updatedCollectibles.filter((collectible) => {
        return collectible.y * SCREEN_HEIGHT < SCREEN_HEIGHT + 50; // Keep some margin
      });

      // Spawn new collectibles if enough time has passed
      if (newCollectibleSpawnTimer >= COLLECTIBLE_SPAWN_INTERVAL) {
        // Select collectible type based on spawn chances
        const selectedCollectible = selectRandomCollectible();
        
        const newCollectible: Collectible = {
          id: Math.random().toString(36).substr(2, 9),
          x: Math.random(),
          y: 0,
          speed: selectedCollectible.speed,
          type: selectedCollectible.type,
          color: selectedCollectible.color,
          icon: selectedCollectible.icon,
          bonusValue: selectedCollectible.bonusValue,
          duration: selectedCollectible.duration,
          spawnChance: selectedCollectible.spawnChance,
        };
        
        updatedCollectibles.push(newCollectible);
      }

      // Calculate collectible type counts
      const newCollectibleTypeCounts = { health: 0, shield: 0, sniper: 0, shotgun: 0, laser: 0 };
      updatedCollectibles.forEach(collectible => {
        newCollectibleTypeCounts[collectible.type]++;
      });

      return {
        collectibles: updatedCollectibles,
        collectibleSpawnTimer: newCollectibleSpawnTimer >= COLLECTIBLE_SPAWN_INTERVAL ? 0 : newCollectibleSpawnTimer,
        collectibleTypeCounts: newCollectibleTypeCounts
      };
    });
  },

  removeCollectible: (id: string) => {
    set((state) => ({
      collectibles: state.collectibles.filter((collectible) => collectible.id !== id)
    }));
  },

  resetCollectibles: () => {
    set({ 
      collectibles: [], 
      collectibleTypeCounts: { health: 0, shield: 0, sniper: 0, shotgun: 0, laser: 0 }, 
      collectibleSpawnTimer: 0
    });
  },

  // Explosion actions
  addExplosion: (x: number, y: number, type: 'red' | 'purple' | 'blue' | 'green' | 'orange', bulletType?: 'normal' | 'special' | 'sniper' | 'shotgun' | 'laser') => {
    set((state) => ({
      explosions: [...state.explosions, { 
        id: `${Date.now()}-${Math.random()}`, 
        x, 
        y, 
        type,
        bulletType 
      }]
    }));
  },

  removeExplosion: (id: string) => {
    set((state) => ({
      explosions: state.explosions.filter((e) => e.id !== id)
    }));
  },

  resetExplosions: () => {
    set({ explosions: [] });
  },

  // Collision spark actions
  addCollisionSpark: (x: number, y: number, configId?: CollisionSparkType) => {
    const spark = {
      id: Math.random().toString(36).substr(2, 9),
      x,
      y,
      configId,
    };
    set((state) => ({
      collisionSparks: [...state.collisionSparks, spark]
    }));
  },

  removeCollisionSpark: (id: string) => {
    set((state) => ({
      collisionSparks: state.collisionSparks.filter((spark) => spark.id !== id)
    }));
  },

  resetCollisionSparks: () => {
    set({ collisionSparks: [] });
  },

  // Game loop actions
  startGameLoop: () => {
    const state = get();
    if (state.isGameLoopRunning) return;

    set({ isGameLoopRunning: true, lastFrameTime: null });
    
    const loop = (timestamp: number) => {
      const currentState = get();
      if (!currentState.isGameLoopRunning) return;

      if (currentState.lastFrameTime === null) {
        set({ lastFrameTime: timestamp });
        const animationFrameId = requestAnimationFrame(loop);
        set({ animationFrameId });
        return;
      }

      const delta = (timestamp - currentState.lastFrameTime) / 1000;
      set({ lastFrameTime: timestamp });

      // Update game objects
      get().updateBullets(delta);
      get().updateEnemies(delta);
      get().updateBarriers(delta);
      get().updateCollectibles(delta); // Update collectibles

      const animationFrameId = requestAnimationFrame(loop);
      set({ animationFrameId });
    };

    const animationFrameId = requestAnimationFrame(loop);
    set({ animationFrameId });
  },

  stopGameLoop: () => {
    const state = get();
    if (state.animationFrameId) {
      cancelAnimationFrame(state.animationFrameId);
    }
    set({ 
      isGameLoopRunning: false, 
      animationFrameId: null,
      lastFrameTime: null 
    });
  },

  // Collision detection
  checkBulletEnemyCollisions: ({ 
    addScore, 
  }) => {
    const state = get();
    
    // Check bullet-enemy collisions
    const newBullets = [...state.bullets];
    const newEnemies = [...state.enemies];
    let bulletsChanged = false;
    let enemiesChanged = false;

    // Process bullets
    for (let j = newBullets.length - 1; j >= 0; j--) {
      const bullet = newBullets[j];
      const isSpecialMissile = bullet.type === 'special';
      let bulletDestroyed = false;

      // Check collision with all enemies
      for (let i = newEnemies.length - 1; i >= 0; i--) {
        const enemy = newEnemies[i];
        const enemyX = enemy.x * SCREEN_WIDTH;
        const enemyY = enemy.y * SCREEN_HEIGHT;

        // Use dynamic collision radius based on bullet properties
        const effectiveRadius = bullet.radius * bullet.collisionRadiusMultiplier;
        const collisionDetected = checkCollision(
          bullet.x - effectiveRadius,
          bullet.y - effectiveRadius,
          effectiveRadius * 2,
          effectiveRadius * 2,
          enemyX - ENEMY_WIDTH / 2,
          enemyY,
          ENEMY_WIDTH,
          ENEMY_HEIGHT
        );

        if (collisionDetected) {
          // Remove enemy
          newEnemies.splice(i, 1);
          enemiesChanged = true;

          // Scoring based on enemy points
          if (isSpecialMissile) {
            addScore(enemy.points * 2); // Special missiles give double points
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          } else {
            addScore(enemy.points);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }

          // Create explosion with bullet type information
          get().addExplosion(enemyX, enemyY, enemy.type, bullet.type);

          // For regular bullets, destroy the bullet and break
          if (!isSpecialMissile) {
            newBullets.splice(j, 1);
            bulletsChanged = true;
            bulletDestroyed = true;
            break;
          }
          // For special missiles, continue checking other enemies
        }
      }

      // Remove special missile if it was destroyed
      if (isSpecialMissile && bulletDestroyed) {
        newBullets.splice(j, 1);
        bulletsChanged = true;
      }
    }

    // Update state if there were changes
    if (bulletsChanged) {
      set({ bullets: newBullets });
    }
    if (enemiesChanged) {
      // Calculate new enemy type counts
      const newEnemyTypeCounts = { red: 0, purple: 0, blue: 0, green: 0, orange: 0 };
      newEnemies.forEach(enemy => {
        newEnemyTypeCounts[enemy.type]++;
      });
      
      set({ 
        enemies: newEnemies,
        enemyTypeCounts: newEnemyTypeCounts
      });
    }
  },

  checkPlayerEnemyCollisions: ({ 
    playerX, 
    playerY, 
    decrementHealth, 
    playCollisionSound,
  }) => {
    const state = get();
    
    // Check player-enemy collisions
    for (let i = state.enemies.length - 1; i >= 0; i--) {
      const enemy = state.enemies[i];
      const enemyX = enemy.x * SCREEN_WIDTH;
      const enemyY = enemy.y * SCREEN_HEIGHT;

      // Enemy-player collision (rectangle-rectangle)
      if (
        checkCollision(
          playerX - PLAYER_WIDTH / 2,
          playerY - PLAYER_HEIGHT / 2,
          PLAYER_WIDTH,
          PLAYER_HEIGHT,
          enemyX - ENEMY_WIDTH / 2,
          enemyY,
          ENEMY_WIDTH,
          ENEMY_HEIGHT
        )
      ) {
        // Remove enemy and decrement health
        const newEnemies = state.enemies.filter((e, index) => index !== i);
        
        // Calculate new enemy type counts
        const newEnemyTypeCounts = { red: 0, purple: 0, blue: 0, green: 0, orange: 0 };
        newEnemies.forEach(enemy => {
          newEnemyTypeCounts[enemy.type]++;
        });
        
        set({ 
          enemies: newEnemies,
          enemyTypeCounts: newEnemyTypeCounts
        });
        
        // Haptic feedback on collision
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
        playCollisionSound();
        decrementHealth();
        
        // Add collision spark effect at player position
        get().addCollisionSpark(playerX, playerY, CollisionSparkType.SUBTLE);
      }
    }
  },

  checkPlayerCollectibleCollisions: ({ 
    playerX, 
    playerY, 
    onCollectHealth, 
    onCollectShield, 
    onCollectWeapon,
  }) => {
    const state = get();
    
    // Check player-collectible collisions
    for (let i = state.collectibles.length - 1; i >= 0; i--) {
      const collectible = state.collectibles[i];
      const collectibleX = collectible.x * SCREEN_WIDTH;
      const collectibleY = collectible.y * SCREEN_HEIGHT;
      const COLLECTIBLE_SIZE = 30; // Size of collectible for collision detection

      // Collectible-player collision (rectangle-rectangle)
      if (
        checkCollision(
          playerX - PLAYER_WIDTH / 2,
          playerY - PLAYER_HEIGHT / 2,
          PLAYER_WIDTH,
          PLAYER_HEIGHT,
          collectibleX - COLLECTIBLE_SIZE / 2,
          collectibleY - COLLECTIBLE_SIZE / 2,
          COLLECTIBLE_SIZE,
          COLLECTIBLE_SIZE
        )
      ) {
        // Remove collectible
        const newCollectibles = state.collectibles.filter((c, index) => index !== i);
        
        // Calculate new collectible type counts
        const newCollectibleTypeCounts = { health: 0, shield: 0, sniper: 0, shotgun: 0, laser: 0 };
        newCollectibles.forEach(collectible => {
          newCollectibleTypeCounts[collectible.type]++;
        });
        
        set({ 
          collectibles: newCollectibles,
          collectibleTypeCounts: newCollectibleTypeCounts
        });
        
        // Handle collectible effect based on type
        switch (collectible.type) {
          case 'health':
            onCollectHealth();
            break;
          case 'shield':
            onCollectShield();
            break;
          case 'sniper':
          case 'shotgun':
          case 'laser':
            onCollectWeapon(collectible.type);
            break;
        }
        
        // Haptic feedback on collection
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        
        // Add collision spark effect at collectible position
        get().addCollisionSpark(collectibleX, collectibleY, CollisionSparkType.SUBTLE);
      }
    }
  },

  checkPlayerBarrierCollisions: ({ 
    playerX, 
    playerY, 
    decrementHealth, 
    playCollisionSound,
  }) => {
    const state = get();
    
    // Check player-barrier collisions
    for (let i = state.barriers.length - 1; i >= 0; i--) {
      const barrier = state.barriers[i];
      const barrierY = barrier.y * SCREEN_HEIGHT;
      const barrierHeight = barrier.segmentHeight * SCREEN_HEIGHT;

      // Check if player is at the same vertical level as the barrier
      if (
        playerY - PLAYER_HEIGHT / 2 < barrierY + barrierHeight &&
        playerY + PLAYER_HEIGHT / 2 > barrierY
      ) {
        // Check if player is hitting a barrier segment (not the opening)
        const playerCenterX = playerX;
        const openingStartX = barrier.openingPosition * SCREEN_WIDTH;
        const openingEndX = openingStartX + (barrier.openingWidth * SCREEN_WIDTH);

        // Check if player is outside the opening
        if (playerCenterX < openingStartX || playerCenterX > openingEndX) {
          // Player hit a barrier segment
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
          playCollisionSound();
          decrementHealth(barrier.damage);
          
          // Add collision spark effect at player position
          get().addCollisionSpark(playerX, playerY, CollisionSparkType.SUBTLE);
          
          // Remove the barrier that was hit
          const newBarriers = state.barriers.filter((b, index) => index !== i);
          
          // Calculate new barrier type counts
          const newBarrierTypeCounts = { classic: 0, fire: 0, laser: 0, electric: 0, plasma: 0 };
          newBarriers.forEach(barrier => {
            newBarrierTypeCounts[barrier.type]++;
          });
          
          set({ 
            barriers: newBarriers,
            barrierTypeCounts: newBarrierTypeCounts
          });
          
          break; // Only hit one barrier at a time
        }
      }
    }
  },

  checkBulletBarrierCollisions: ({ 
    addScore, 
  }) => {
    const state = get();
    
    // Check bullet-barrier collisions (only for special missiles)
    const newBullets = [...state.bullets];
    const newBarriers = [...state.barriers];
    let barriersChanged = false;

    // Process bullets
    for (let j = newBullets.length - 1; j >= 0; j--) {
      const bullet = newBullets[j];
      const isSpecialMissile = bullet.type === 'special';
      
      // Only special missiles can destroy barriers
      if (!isSpecialMissile) continue;

      // Check collision with all barriers
      for (let i = newBarriers.length - 1; i >= 0; i--) {
        const barrier = newBarriers[i];
        const barrierY = barrier.y * SCREEN_HEIGHT;
        const barrierHeight = barrier.segmentHeight * SCREEN_HEIGHT;

        // Check if bullet is at the same vertical level as the barrier
        if (
          bullet.y - bullet.radius < barrierY + barrierHeight &&
          bullet.y + bullet.radius > barrierY
        ) {
          // Check if bullet is hitting a barrier segment (not the opening)
          const bulletCenterX = bullet.x;
          const openingStartX = barrier.openingPosition * SCREEN_WIDTH;
          const openingEndX = openingStartX + (barrier.openingWidth * SCREEN_WIDTH);

          // Check if bullet is outside the opening
          if (bulletCenterX < openingStartX || bulletCenterX > openingEndX) {
            // Special missile hit a barrier segment
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            
            // Add score for destroying barrier segment
            addScore(barrier.damage); // Award points based on barrier damage
            
            // Create explosion effect at bullet position
            get().addExplosion(bullet.x, bullet.y, 'red', bullet.type); // Use red as default for barrier explosions
            
            // Add collision spark effect at bullet position
            get().addCollisionSpark(bullet.x, bullet.y, CollisionSparkType.SUBTLE);
            
            // Remove the barrier that was hit
            newBarriers.splice(i, 1);
            barriersChanged = true;
            
            // Special missiles continue through barriers, so don't destroy the bullet
            break; // Only hit one barrier at a time
          }
        }
      }
    }

    // Update state if there were changes
    if (barriersChanged) {
      // Calculate new barrier type counts
      const newBarrierTypeCounts = { classic: 0, fire: 0, laser: 0, electric: 0, plasma: 0 };
      newBarriers.forEach(barrier => {
        newBarrierTypeCounts[barrier.type]++;
      });
      
      set({ 
        barriers: newBarriers,
        barrierTypeCounts: newBarrierTypeCounts
      });
    }
  },

  // Spawning
  spawnEnemy: () => {
    // This is now handled in updateEnemies
  },

  spawnBarrier: () => {
    // This is now handled in updateBarriers
  },

  spawnCollectible: () => {
    // This is now handled in updateCollectibles
  },

  // Reset all
  resetAll: () => {
    const state = get();
    if (state.animationFrameId) {
      cancelAnimationFrame(state.animationFrameId);
    }
    set({
      bullets: [],
      enemies: [],
      enemyTypeCounts: { red: 0, purple: 0, blue: 0, green: 0, orange: 0 },
      spawnTimer: 0,
      lastFrameTime: null,
      barriers: [],
      barrierTypeCounts: { classic: 0, fire: 0, laser: 0, electric: 0, plasma: 0 },
      barrierSpawnTimer: 0,
      collectibles: [],
      collectibleSpawnTimer: 0,
      collectibleTypeCounts: { health: 0, shield: 0, sniper: 0, shotgun: 0, laser: 0 },
      explosions: [],
      collisionSparks: [],
      animationFrameId: null,
      isGameLoopRunning: false,
    });
  },
})); 