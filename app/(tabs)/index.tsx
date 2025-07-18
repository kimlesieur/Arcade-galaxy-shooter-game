import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.accountSection}>
        {/* Placeholder for account info */}
        <Text style={styles.accountText}>Welcome, Player!</Text>
      </View>
      <TouchableOpacity style={styles.startButton} onPress={() => router.push('/game')}>
        <Text style={styles.startButtonText}>Start Game</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountSection: {
    marginBottom: 60,
    alignItems: 'center',
  },
  accountText: {
    color: '#00ffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  startButton: {
    backgroundColor: '#00ffff',
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 32,
    elevation: 2,
  },
  startButtonText: {
    color: '#0a0a23',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
