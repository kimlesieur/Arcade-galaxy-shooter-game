import { create } from 'zustand';
import { Bullet, EnemyShip } from '../components/game/types';
import { checkCollision } from '../components/game/utils';
import { PLAYER_WIDTH, PLAYER_HEIGHT, ENEMY_WIDTH, ENEMY_HEIGHT } from '../utils/constants';
import { Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Game object types
interface GameObjectsState {
  // Bullets
  bullets: Bullet[];
  
  // Enemies
  enemies: EnemyShip[];
  purpleEnemyCount: number;
  spawnTimer: number;
  lastFrameTime: number | null;
  
  // Explosions
  explosions: { id: string; x: number; y: number; type: 'red' | 'purple' }[];
  
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
  addExplosion: (x: number, y: number, type: 'red' | 'purple') => void;
  removeExplosion: (id: string) => void;
  resetExplosions: () => void;
  
  // Game loop actions
  startGameLoop: () => void;
  stopGameLoop: () => void;
  
  // Collision detection
  checkCollisions: (params: {
    playerX: number;
    playerY: number;
    addScore: (points: number) => void;
    decrementHealth: () => void;
    playCollisionSound: () => void;
    _playShootSound: () => void;
    _playSpecialMissileSound: () => void;
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
  purpleEnemyCount: 0,
  spawnTimer: 0,
  lastFrameTime: null,
  explosions: [],
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
      purpleEnemyCount: enemy.type === 'purple' 
        ? state.purpleEnemyCount + 1 
        : state.purpleEnemyCount
    }));
  },

  updateEnemies: (delta: number) => {
    const ENEMY_SPEED = 100;
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

      // Spawn new enemy if enough time has passed
      if (newSpawnTimer >= ENEMY_SPAWN_INTERVAL) {
        const totalEnemies = updatedEnemies.length;
        const purpleEnemies = state.purpleEnemyCount;
        let type: 'red' | 'purple' = 'red';
        let color = '#ff3333';
        
        // Only allow 10% purple enemies
        if (totalEnemies > 0 && purpleEnemies / totalEnemies < 0.1 && Math.random() < 0.1) {
          type = 'purple';
          color = '#a259e6';
        }
        
        const newEnemy: EnemyShip = {
          id: Math.random().toString(36).substr(2, 9),
          x: Math.random(),
          y: 0,
          speed: ENEMY_SPEED,
          type,
          color,
        };
        
        updatedEnemies.push(newEnemy);
      }

      return {
        enemies: updatedEnemies,
        spawnTimer: newSpawnTimer >= ENEMY_SPAWN_INTERVAL ? 0 : newSpawnTimer,
        purpleEnemyCount: updatedEnemies.filter(e => e.type === 'purple').length
      };
    });
  },

  removeEnemy: (id: string) => {
    set((state) => {
      const enemyToRemove = state.enemies.find(e => e.id === id);
      return {
        enemies: state.enemies.filter((enemy) => enemy.id !== id),
        purpleEnemyCount: enemyToRemove?.type === 'purple' 
          ? Math.max(0, state.purpleEnemyCount - 1)
          : state.purpleEnemyCount
      };
    });
  },

  resetEnemies: () => {
    set({ 
      enemies: [], 
      purpleEnemyCount: 0, 
      spawnTimer: 0, 
      lastFrameTime: null 
    });
  },

  // Explosion actions
  addExplosion: (x: number, y: number, type: 'red' | 'purple') => {
    set((state) => ({
      explosions: [...state.explosions, { 
        id: `${Date.now()}-${Math.random()}`, 
        x, 
        y, 
        type 
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
  checkCollisions: ({ 
    playerX, 
    playerY, 
    addScore, 
    decrementHealth, 
    playCollisionSound,
    _playShootSound,
    _playSpecialMissileSound
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

        // Regular collision detection for all bullets
        const collisionDetected = checkCollision(
          bullet.x - bullet.radius,
          bullet.y - bullet.radius,
          bullet.radius * 2,
          bullet.radius * 2,
          enemyX - ENEMY_WIDTH / 2,
          enemyY,
          ENEMY_WIDTH,
          ENEMY_HEIGHT
        );

        if (collisionDetected) {
          // Remove enemy
          newEnemies.splice(i, 1);
          enemiesChanged = true;

          // Scoring
          if (isSpecialMissile) {
            addScore(enemy.type === 'purple' ? 5 : 3);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          } else {
            addScore(enemy.type === 'purple' ? 2 : 1);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }

          // Create explosion
          get().addExplosion(enemyX, enemyY, enemy.type);

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

    // Check player-enemy collisions
    for (let i = newEnemies.length - 1; i >= 0; i--) {
      const enemy = newEnemies[i];
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
        newEnemies.splice(i, 1);
        enemiesChanged = true;
        
        // Haptic feedback on collision
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
        playCollisionSound();
        decrementHealth();
      }
    }

    // Update state if there were changes
    if (bulletsChanged) {
      set({ bullets: newBullets });
    }
    if (enemiesChanged) {
      set({ 
        enemies: newEnemies,
        purpleEnemyCount: newEnemies.filter(e => e.type === 'purple').length
      });
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
      purpleEnemyCount: 0,
      spawnTimer: 0,
      lastFrameTime: null,
      explosions: [],
      animationFrameId: null,
      isGameLoopRunning: false,
    });
  },
})); 