import React from 'react';
import { View, StyleSheet } from 'react-native';
import GameScreen from '@/components/GameScreen';

export default function PlayTab() {
  return (
    <View style={styles.container}>
      <GameScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
