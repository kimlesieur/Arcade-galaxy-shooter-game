import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { Canvas, Circle, Paint, Path, Skia } from '@shopify/react-native-skia';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const BUTTON_SIZE = 80;
const PROGRESS_STROKE_WIDTH = 6;
const CHARGE_TIME = 1000; // 1 second to fully charge

interface SpecialMissileButtonProps {
  onSpecialMissileReady: () => void;
  onChargingStart?: () => void;
  onChargingEnd?: () => void;
  onChargeProgress?: (progress: number) => void;
  onSpecialMissileFired?: () => void;
  disabled?: boolean;
}

export default function SpecialMissileButton({ 
  onSpecialMissileReady, 
  onChargingStart,
  onChargingEnd,
  onChargeProgress,
  onSpecialMissileFired,
  disabled = false 
}: SpecialMissileButtonProps) {
  const [isCharging, setIsCharging] = useState(false);
  const [chargeProgress, setChargeProgress] = useState(0);
  const chargeAnimationRef = useRef(new Animated.Value(0)).current;
  const chargeStartTimeRef = useRef<number | null>(null);
  const chargeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (chargeIntervalRef.current) {
        clearInterval(chargeIntervalRef.current);
      }
    };
  }, []);

  const startCharging = () => {
    if (disabled) return;
    
    setIsCharging(true);
    setChargeProgress(0);
    chargeAnimationRef.setValue(0);
    chargeStartTimeRef.current = Date.now();
    
    // Notify parent component that charging has started
    if (onChargingStart) {
      onChargingStart();
    }
    
    // Haptic feedback for start charging
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Animate progress
    Animated.timing(chargeAnimationRef, {
      toValue: 1,
      duration: CHARGE_TIME,
      useNativeDriver: false,
    }).start();
    
    // Update progress every 50ms for smooth visual feedback
    chargeIntervalRef.current = setInterval(() => {
      if (chargeStartTimeRef.current) {
        const elapsed = Date.now() - chargeStartTimeRef.current;
        const progress = Math.min(elapsed / CHARGE_TIME, 1);
        setChargeProgress(progress);
        
        // Notify parent component of charge progress
        if (onChargeProgress) {
          onChargeProgress(progress);
        }
        
        if (progress >= 1) {
          // Fully charged
          runOnJS(handleFullyCharged)();
        }
      }
    }, 50);
  };

  const stopCharging = () => {
    if (!isCharging) return;
    
    setIsCharging(false);
    setChargeProgress(0);
    chargeAnimationRef.setValue(0);
    chargeStartTimeRef.current = null;
    
    // Notify parent component that charging has ended
    if (onChargingEnd) {
      onChargingEnd();
    }
    
    if (chargeIntervalRef.current) {
      clearInterval(chargeIntervalRef.current);
      chargeIntervalRef.current = null;
    }
    
    // Haptic feedback for cancel
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleFullyCharged = () => {
    setIsCharging(false);
    setChargeProgress(1);
    chargeStartTimeRef.current = null;
    
    // Notify parent component that charging has ended
    if (onChargingEnd) {
      onChargingEnd();
    }
    
    if (chargeIntervalRef.current) {
      clearInterval(chargeIntervalRef.current);
      chargeIntervalRef.current = null;
    }
    
    // Haptic feedback for ready
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Trigger special missile
    onSpecialMissileReady();

    // Notify parent component that special missile has fired
    if (onSpecialMissileFired) {
      onSpecialMissileFired();
    }
    
    // Reset after a short delay
    setTimeout(() => {
      setChargeProgress(0);
      chargeAnimationRef.setValue(0);
    }, 500);
  };

  const longPressGesture = Gesture.LongPress()
    .minDuration(100)
    .onStart(() => {
      runOnJS(startCharging)();
    })
    .onEnd(() => {
      runOnJS(stopCharging)();
    });

  const renderProgressCircle = () => {
    const center = BUTTON_SIZE / 2;
    const radius = (BUTTON_SIZE - PROGRESS_STROKE_WIDTH) / 2;
    
    // Create circular path for progress
    const createArcPath = (startAngle: number, endAngle: number) => {
      const path = Skia.Path.Make();
      
      // Convert angles to degrees for Skia
      const startAngleDeg = (startAngle * 180) / Math.PI;
      const endAngleDeg = (endAngle * 180) / Math.PI;
      
      // Create arc using Skia's addArc method
      path.addArc(
        { x: center - radius, y: center - radius, width: radius * 2, height: radius * 2 },
        startAngleDeg,
        endAngleDeg - startAngleDeg
      );
      
      return path;
    };
    
    return (
      <Canvas style={StyleSheet.absoluteFill}>
        {/* Background circle */}
        <Circle cx={center} cy={center} r={radius}>
          <Paint
            style="stroke"
            strokeWidth={PROGRESS_STROKE_WIDTH}
            color="#333333"
            strokeCap="round"
          />
        </Circle>
        
        {/* Progress circle */}
        {chargeProgress > 0 && (
          <Path
            path={createArcPath(
              -Math.PI / 2, // Start from top
              -Math.PI / 2 + (2 * Math.PI * chargeProgress) // Progress around circle
            )}
            strokeWidth={PROGRESS_STROKE_WIDTH}
            color={chargeProgress >= 1 ? "#00ff00" : "#ff6b35"}
            style="stroke"
            strokeCap="round"
          />
        )}
      </Canvas>
    );
  };

  return (
    <View style={styles.container}>
      <GestureDetector gesture={longPressGesture}>
        <TouchableOpacity
          style={[
            styles.button,
            disabled && styles.buttonDisabled,
            isCharging && styles.buttonCharging,
            chargeProgress >= 1 && styles.buttonReady,
          ]}
          activeOpacity={0.8}
          disabled={disabled}
        >
          {renderProgressCircle()}
          
          {/* Button icon/text */}
          <View style={styles.buttonContent}>
            <View style={[
              styles.missileIcon,
              chargeProgress >= 1 && styles.missileIconReady
            ]} />
          </View>
        </TouchableOpacity>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 40,
    right: 30,
    zIndex: 20,
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderWidth: 2,
    borderColor: '#444',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonDisabled: {
    opacity: 0.5,
    borderColor: '#666',
  },
  buttonCharging: {
    borderColor: '#ff6b35',
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
  },
  buttonReady: {
    borderColor: '#00ff00',
    backgroundColor: 'rgba(0, 255, 0, 0.2)',
  },
  buttonContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  missileIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#ff6b35',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fff',
  },
  missileIconReady: {
    backgroundColor: '#00ff00',
  },
}); 