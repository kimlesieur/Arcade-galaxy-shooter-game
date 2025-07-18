import { useState } from 'react';

export const useSpecialMissile = () => {
  const [isSpecialMissileCharging, setIsSpecialMissileCharging] = useState(false);
  const [specialMissileChargeProgress, setSpecialMissileChargeProgress] = useState(0);
  const [triggerSpecialFireEffect, setTriggerSpecialFireEffect] = useState(false);

  const resetSpecialMissile = () => {
    setIsSpecialMissileCharging(false);
    setSpecialMissileChargeProgress(0);
    setTriggerSpecialFireEffect(false);
  };

  const triggerFireEffect = () => {
    setTriggerSpecialFireEffect(true);
    setTimeout(() => setTriggerSpecialFireEffect(false), 500);
  };

  return {
    isSpecialMissileCharging,
    specialMissileChargeProgress,
    triggerSpecialFireEffect,
    setIsSpecialMissileCharging,
    setSpecialMissileChargeProgress,
    resetSpecialMissile,
    triggerFireEffect,
  };
}; 