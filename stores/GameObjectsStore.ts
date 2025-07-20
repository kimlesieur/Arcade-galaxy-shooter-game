import { create } from 'zustand';
import { Bullet, EnemyShip } from '../components/game/types';
import { checkCollision } from '../components/game/utils';
import { PLAYER_WIDTH, PLAYER_HEIGHT, ENEMY_WIDTH, ENEMY_HEIGHT } from '../utils/constants';
import { Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSettingsStore } from './SettingsStore';
import { CollisionSparkType } from '../utils/collisionSparkConfigs';
import { ENEMY_CONFIGS } from '../utils/enemyConfigs';

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
  
  // Spawning
  spawnEnemy: () => void;
  
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

  // Spawning
  spawnEnemy: () => {
    // This is now handled in updateEnemies
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
      explosions: [],
      collisionSparks: [],
      animationFrameId: null,
      isGameLoopRunning: false,
    });
  },
})); 