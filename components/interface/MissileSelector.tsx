import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { getMissileConfigsByType } from '../../utils/missileConfigs';
import * as Haptics from 'expo-haptics';


interface MissileSelectorProps {
  currentMissileType: string;
  onMissileTypeChange: (missileType: string) => void;
  disabled?: boolean;
}

export default function MissileSelector({ 
  currentMissileType, 
  onMissileTypeChange, 
  disabled = false 
}: MissileSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Get automatic missiles (those with fire rate > 0)
  const automaticMissiles = getMissileConfigsByType('automatic');
  
  const handleMissileSelect = (missileType: string) => {
    if (disabled) return;
    
    onMissileTypeChange(missileType);
    setIsExpanded(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const toggleExpanded = () => {
    if (disabled) return;
    
    setIsExpanded(!isExpanded);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const currentConfig = automaticMissiles.find(m => m.id === currentMissileType) || automaticMissiles[0];

  return (
    <View style={styles.container}>
      {/* Current missile display */}
      <TouchableOpacity 
        style={[styles.currentMissile, disabled && styles.disabled]} 
        onPress={toggleExpanded}
        disabled={disabled}
      >
        <View style={[styles.missileIcon, { backgroundColor: currentConfig.visualEffects.color }]} />
        <Text style={[styles.missileName, disabled && styles.disabledText]}>
          {currentConfig.name}
        </Text>
        <Text style={[styles.expandIcon, disabled && styles.disabledText]}>
          {isExpanded ? '▼' : '▲'}
        </Text>
      </TouchableOpacity>

      {/* Expanded missile list */}
      {isExpanded && (
        <View style={styles.expandedList}>
          {automaticMissiles.map((missile) => (
            <TouchableOpacity
              key={missile.id}
              style={[
                styles.missileOption,
                currentMissileType === missile.id && styles.selectedMissile
              ]}
              onPress={() => handleMissileSelect(missile.id)}
              disabled={disabled}
            >
              <View style={[styles.missileIcon, { backgroundColor: missile.visualEffects.color }]} />
              <View style={styles.missileInfo}>
                <Text style={[styles.missileName, disabled && styles.disabledText]}>
                  {missile.name}
                </Text>
                <Text style={[styles.missileDescription, disabled && styles.disabledText]}>
                  {missile.description}
                </Text>
              </View>
              <View style={styles.missileStats}>
                <Text style={[styles.statText, disabled && styles.disabledText]}>
                  DMG: {missile.damage}
                </Text>
                <Text style={[styles.statText, disabled && styles.disabledText]}>
                  SPD: {Math.abs(missile.velocityY)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    left: 20,
    zIndex: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 10,
    padding: 10,
    minWidth: 200,
  },
  currentMissile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  missileIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 10,
  },
  missileName: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
  },
  expandIcon: {
    color: 'white',
    fontSize: 12,
  },
  expandedList: {
    marginTop: 5,
  },
  missileOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginVertical: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 6,
  },
  selectedMissile: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  missileInfo: {
    flex: 1,
    marginLeft: 10,
  },
  missileDescription: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
    marginTop: 2,
  },
  missileStats: {
    alignItems: 'flex-end',
  },
  statText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    marginLeft: 5,
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.5,
  },
}); 