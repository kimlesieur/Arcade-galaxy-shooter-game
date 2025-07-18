import { useState, useRef, useEffect } from 'react';
import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface GameState {
  playerX: number;
  playerY: number;
  score: number;
  playerHealth: number;
  gameOver: boolean;
}

export const useGameState = () => {
  const [playerX, setPlayerX] = useState(SCREEN_WIDTH / 2);
  const playerY = SCREEN_HEIGHT - 180;
  const [score, setScore] = useState(0);
  const [playerHealth, setPlayerHealth] = useState(3);
  const [gameOver, setGameOver] = useState(false);

  // Ref to always have latest player position
  const playerPosRef = useRef({ x: playerX, y: playerY });
  
  useEffect(() => {
    playerPosRef.current.x = playerX;
    playerPosRef.current.y = playerY;
  }, [playerX, playerY]);

  const resetGame = () => {
    setScore(0);
    setPlayerHealth(3);
    setGameOver(false);
    setPlayerX(SCREEN_WIDTH / 2);
  };

  const decrementHealth = () => {
    setPlayerHealth((h) => {
      const newHealth = h - 1;
      if (newHealth <= 0) {
        setGameOver(true);
      }
      return newHealth;
    });
  };

  const addScore = (points: number) => {
    setScore((s) => s + points);
  };

  return {
    // State
    playerX,
    playerY,
    score,
    playerHealth,
    gameOver,
    playerPosRef,
    
    // Actions
    setPlayerX,
    resetGame,
    decrementHealth,
    addScore,
    setGameOver,
  };
}; 