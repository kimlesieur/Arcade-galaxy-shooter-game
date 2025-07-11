import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Volume2, VolumeX, Zap } from 'lucide-react-native';

export default function SettingsTab() {
  const [soundEnabled, setSoundEnabled] = React.useState(true);
  const [vibrationEnabled, setVibrationEnabled] = React.useState(true);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.setting}
          onPress={() => setSoundEnabled(!soundEnabled)}
        >
          {soundEnabled ? (
            <Volume2 size={24} color="#00ffff" />
          ) : (
            <VolumeX size={24} color="#666" />
          )}
          <Text style={styles.settingText}>Sound Effects</Text>
          <View style={[styles.toggle, soundEnabled && styles.toggleActive]} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.setting}
          onPress={() => setVibrationEnabled(!vibrationEnabled)}
        >
          <Zap size={24} color={vibrationEnabled ? '#00ffff' : '#666'} />
          <Text style={styles.settingText}>Haptic Feedback</Text>
          <View
            style={[styles.toggle, vibrationEnabled && styles.toggleActive]}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.credits}>
        <Text style={styles.creditsTitle}>Arcade Galaxy Shooter</Text>
        <Text style={styles.creditsText}>Built with React Native & Skia</Text>
        <Text style={styles.creditsText}>Version 1.0.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a23',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00ffff',
    textAlign: 'center',
    marginBottom: 40,
  },
  section: {
    backgroundColor: '#1e1e3f',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  setting: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4f',
  },
  settingText: {
    flex: 1,
    fontSize: 18,
    color: '#fff',
    marginLeft: 15,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#333',
    borderWidth: 1,
    borderColor: '#555',
  },
  toggleActive: {
    backgroundColor: '#00ffff',
  },
  credits: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  creditsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00ffff',
    marginBottom: 10,
  },
  creditsText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 5,
  },
});
