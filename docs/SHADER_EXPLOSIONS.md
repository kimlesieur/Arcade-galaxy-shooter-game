# Shader-Based Explosion System

This document explains how to use the new shader-based explosion effects in your Arcade Galaxy Shooter game.

## Overview

The shader-based explosion system provides:
- **Better Performance**: GPU-accelerated rendering instead of individual particles
- **More Complex Effects**: Procedural noise, turbulence, heat distortion, plasma effects
- **Smoother Animations**: Continuous mathematical functions instead of discrete particles
- **More Realistic Physics**: Proper shockwaves, heat waves, and energy dissipation

## Components

### 1. Basic Explosion Shader (`ExplosionShader.tsx`)
A simple shader-based explosion with:
- Base explosion wave
- Turbulence using noise
- Shockwave effects
- Heat distortion
- Color gradients
- Sparkle effects

### 2. Advanced Explosion Shader (`AdvancedExplosionShader.tsx`)
Enhanced version with:
- Improved noise functions (FBM)
- Plasma effects for special weapons
- Energy waves for laser weapons
- Multiple shockwave rings
- Enhanced heat distortion
- More sophisticated color variations

### 3. Integration Wrapper (`ExplosionShaderOverlay.tsx`)
Drop-in replacement for your current `ExplosionOverlay.tsx` that provides the same interface.

### 4. Demo Component (`ExplosionShaderDemo.tsx`)
Interactive demo to test and compare different explosion effects.

## Integration

### Option 1: Quick Replacement (Recommended)

Replace your current explosion overlay with the shader version:

```tsx
// In your GameScreen.tsx or main game component
import ExplosionShaderOverlay from './components/effects/ExplosionShaderOverlay';

// Replace this:
// <ExplosionOverlay explosions={explosions} onExplosionFinish={handleExplosionFinish} />

// With this:
<ExplosionShaderOverlay explosions={explosions} onExplosionFinish={handleExplosionFinish} />
```

### Option 2: Direct Usage

Use the shader components directly in your game renderer:

```tsx
import ExplosionShader from './components/effects/ExplosionShader';
// or
import AdvancedExplosionShader from './components/effects/AdvancedExplosionShader';

// In your render method:
{explosions.map((explosion) => (
  <ExplosionShader
    key={explosion.id}
    x={explosion.x}
    y={explosion.y}
    bulletType={explosion.bulletType || 'normal'}
    progress={explosion.progress}
    onFinish={() => handleExplosionFinish(explosion.id)}
    size={100} // Adjust based on explosion type
  />
))}
```

### Option 3: Hybrid Approach

Use shader explosions for special weapons and keep particle explosions for basic ones:

```tsx
{explosions.map((explosion) => {
  const isSpecialWeapon = ['special', 'laser'].includes(explosion.bulletType || 'normal');
  
  if (isSpecialWeapon) {
    return (
      <AdvancedExplosionShader
        key={explosion.id}
        x={explosion.x}
        y={explosion.y}
        bulletType={explosion.bulletType || 'normal'}
        progress={explosion.progress}
        onFinish={() => handleExplosionFinish(explosion.id)}
      />
    );
  } else {
    return (
      <ExplosionRenderer
        key={explosion.id}
        x={explosion.x}
        y={explosion.y}
        bulletType={explosion.bulletType || 'normal'}
        progress={explosion.progress}
        onFinish={() => handleExplosionFinish(explosion.id)}
      />
    );
  }
})}
```

## Explosion Types

The shader system supports all your existing bullet types with enhanced effects:

### Normal Explosions
- **Colors**: White core → Orange → Red
- **Effects**: Basic explosion wave, turbulence, sparkles
- **Size**: 90px radius

### Special Explosions
- **Colors**: Yellow core → Orange → Dark red
- **Effects**: Plasma effects, shockwaves, heat distortion
- **Size**: 150px radius

### Sniper Explosions
- **Colors**: Cyan core → Blue → Dark blue
- **Effects**: Plasma effects, precise energy
- **Size**: 80px radius

### Shotgun Explosions
- **Colors**: Yellow core → Orange → Red-orange
- **Effects**: Plasma effects, heat distortion
- **Size**: 100px radius

### Laser Explosions
- **Colors**: Magenta core → Pink → Purple
- **Effects**: Energy waves, plasma, shockwaves, heat distortion
- **Size**: 120px radius

## Performance Benefits

### Before (Particle System)
- 20-50 individual particles per explosion
- CPU-intensive calculations
- Multiple draw calls per explosion
- Memory allocation for particle objects

### After (Shader System)
- Single draw call per explosion
- GPU-accelerated calculations
- No memory allocation during runtime
- Smooth 60fps performance even with multiple explosions

## Customization

### Adjusting Colors
Modify the color palettes in the shader components:

```tsx
const getExplosionColors = (bulletType: string) => {
  switch (bulletType) {
    case 'normal':
      return {
        color1: [1.0, 1.0, 1.0], // White core
        color2: [1.0, 0.3, 0.0], // Orange
        color3: [0.8, 0.0, 0.0], // Red
      };
    // Add your custom colors...
  }
};
```

### Adjusting Effects
Modify the shader uniforms to control effects:

```tsx
const explosionShaderProgram = useShader(explosionShader, {
  u_center: center,
  u_progress: progressValue,
  u_size: sizeValue,
  u_time: time,
  u_color1: colors.color1,
  u_color2: colors.color2,
  u_color3: colors.color3,
  u_intensity: 1.0, // Adjust overall intensity
});
```

### Adding New Explosion Types
1. Add new color palette in `getExplosionColors()`
2. Add type mapping in `getTypeValue()`
3. Configure effect conditions in the render method