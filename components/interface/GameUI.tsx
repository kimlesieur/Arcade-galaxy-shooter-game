import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface GameUIProps {
  score: number;
  playerHealth: number;
  gameOver: boolean;
  onRestart: () => void;
}

export default function GameUI({ score, playerHealth, gameOver, onRestart }: GameUIProps) {
  return (
    <>
      {/* Score Display */}
      <View style={styles.scoreContainer}>
        <View style={styles.uiPanel}>
          <Text style={styles.uiText}>Score: {score}</Text>
        </View>
      </View>
      
      {/* Health Display */}
      <View style={styles.healthContainer}>
        <View style={styles.uiPanel}>
          <Text style={styles.uiText}>Health: {playerHealth}</Text>
        </View>
      </View>
      
      {/* Game Over Overlay */}
      {gameOver && (
        <View style={styles.gameOverOverlay}>
          <Text style={styles.gameOverTitle}>Game Over</Text>
          <Text style={styles.gameOverScore}>Score: {score}</Text>
          <TouchableOpacity onPress={onRestart} style={styles.restartButton}>
            <Text style={styles.restartButtonText}>Restart</Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  scoreContainer: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  healthContainer: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },
  uiPanel: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    padding: 8,
  },
  uiText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  gameOverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  gameOverTitle: {
    color: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  gameOverScore: {
    color: '#fff',
    fontSize: 24,
    marginBottom: 40,
  },
  restartButton: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginBottom: 10,
  },
  restartButtonText: {
    color: '#0a0a23',
    fontSize: 22,
    fontWeight: 'bold',
  },
}); 