import React, { useEffect, useState } from 'react';
import { Fill, Skia, Shader } from '@shopify/react-native-skia';
import { useSharedValue } from 'react-native-reanimated';

interface AdvancedExplosionShaderProps {
  x: number;
  y: number;
  bulletType: string;
  progress: number; // 0 to 1
  onFinish?: () => void;
  size?: number; // Explosion radius
}

// Advanced fragment shader with multiple effects
const advancedExplosionShader = `
uniform float2 u_center;
uniform float u_progress;
uniform float u_size;
uniform float u_time;
uniform float3 u_color1;
uniform float3 u_color2;
uniform float3 u_color3;
uniform float u_intensity;
uniform float u_type; // 0=normal, 1=special, 2=sniper, 3=shotgun, 4=laser

// Improved noise function
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

// Fractal Brownian Motion
float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  for (int i = 0; i < 5; i++) {
    value += amplitude * noise(p * frequency);
    amplitude *= 0.5;
    frequency *= 2.0;
  }
  return value;
}

// Plasma effect
float plasma(vec2 p, float time) {
  float v1 = sin(p.x * 10.0 + time);
  float v2 = sin(p.y * 10.0 + time * 0.5);
  float v3 = sin((p.x + p.y) * 10.0 + time * 0.3);
  return (v1 + v2 + v3) / 3.0;
}

// Energy wave effect
float energyWave(vec2 p, float time) {
  float dist = length(p);
  float wave = sin(dist * 20.0 - time * 15.0) * 0.5 + 0.5;
  wave *= exp(-dist * 2.0);
  return wave;
}

vec4 main(vec2 fragCoord) {
  vec2 uv = fragCoord;
  vec2 center = u_center;
  vec2 delta = uv - center;
  float dist = length(delta);
  
  // Normalize distance to explosion size
  float normalizedDist = dist / u_size;
  
  // Base explosion wave
  float wave = 1.0 - smoothstep(0.0, 1.0, normalizedDist - u_progress * 2.0);
  
  // Enhanced turbulence using FBM
  vec2 noiseCoord = delta * 0.01 + u_time * 0.1;
  float turbulence = fbm(noiseCoord) * 0.4;
  
  // Shockwave effect
  float shockwave = 0.0;
  if (u_progress > 0.1) {
    float shockDist = normalizedDist - (u_progress - 0.1) * 1.5;
    shockwave = exp(-shockDist * shockDist * 15.0) * 0.6;
  }
  
  // Heat distortion
  float heat = 0.0;
  if (normalizedDist < u_progress * 1.5) {
    heat = exp(-normalizedDist * 2.5) * (1.0 - u_progress) * 0.4;
  }
  
  // Plasma effect for special weapons
  float plasmaEffect = 0.0;
  if (u_type >= 1.0) { // special, sniper, shotgun, laser
    plasmaEffect = plasma(delta * 0.02, u_time) * 0.3;
    plasmaEffect *= exp(-normalizedDist * 3.0) * (1.0 - u_progress);
  }
  
  // Energy waves for laser weapons
  float energyWaves = 0.0;
  if (u_type >= 4.0) { // laser
    energyWaves = energyWave(delta * 0.01, u_time) * 0.4;
    energyWaves *= exp(-normalizedDist * 2.0) * (1.0 - u_progress * 0.5);
  }
  
  // Combine all effects
  float intensity = wave + turbulence + shockwave + heat + plasmaEffect + energyWaves;
  intensity *= u_intensity;
  
  // Enhanced color gradient
  vec3 color;
  if (normalizedDist < u_progress * 0.3) {
    // Core - bright white/yellow
    color = mix(u_color1, u_color2, normalizedDist / (u_progress * 0.3));
  } else if (normalizedDist < u_progress * 0.7) {
    // Middle - orange/red
    color = mix(u_color2, u_color3, (normalizedDist - u_progress * 0.3) / (u_progress * 0.4));
  } else {
    // Outer - dark red/black
    color = mix(u_color3, vec3(0.0), (normalizedDist - u_progress * 0.7) / (u_progress * 0.3));
  }
  
  // Enhanced sparkle effect
  float sparkle = noise(uv * 100.0 + u_time * 3.0) * noise(uv * 70.0 - u_time * 2.0);
  sparkle *= exp(-normalizedDist * 4.0) * (1.0 - u_progress) * 0.6;
  color += sparkle * u_color1;
  
  // Add plasma color variation
  if (u_type >= 1.0) {
    float plasmaColor = plasma(delta * 0.05, u_time * 0.5);
    color += plasmaColor * 0.2 * u_color1 * (1.0 - u_progress);
  }
  
  // Fade out with enhanced timing
  float alpha = intensity * (1.0 - u_progress * 0.9);
  
  return vec4(color, alpha);
}
`;

// Shockwave shader with ripple effects
const advancedShockwaveShader = `
uniform float2 u_center;
uniform float u_progress;
uniform float u_size;
uniform float u_time;
uniform float u_type;

float noise(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

vec4 main(vec2 fragCoord) {
  vec2 uv = fragCoord;
  vec2 center = u_center;
  vec2 delta = uv - center;
  float dist = length(delta);
  
  float normalizedDist = dist / u_size;
  
  // Multiple expanding rings
  float ring = 0.0;
  float ringWidth = 0.08;
  float ringPos = u_progress * 2.5;
  
  // Primary ring
  if (abs(normalizedDist - ringPos) < ringWidth) {
    ring = 1.0 - abs(normalizedDist - ringPos) / ringWidth;
    ring = smoothstep(0.0, 1.0, ring);
  }
  
  // Secondary ring (for special weapons)
  if (u_type >= 1.0) {
    float ring2Pos = ringPos * 0.7;
    if (abs(normalizedDist - ring2Pos) < ringWidth * 0.8) {
      float ring2 = 1.0 - abs(normalizedDist - ring2Pos) / (ringWidth * 0.8);
      ring2 = smoothstep(0.0, 1.0, ring2) * 0.5;
      ring = max(ring, ring2);
    }
  }
  
  // Enhanced ripple effect
  float ripple = sin((normalizedDist - ringPos) * 60.0 - u_time * 12.0) * 0.5 + 0.5;
  ripple *= exp(-(normalizedDist - ringPos) * (normalizedDist - ringPos) * 150.0);
  
  // Noise distortion
  float noiseDistortion = noise(delta * 0.02 + u_time * 0.1) * 0.3;
  
  // Combine effects
  float intensity = ring * 0.8 + ripple * 0.4 + noiseDistortion;
  intensity *= (1.0 - u_progress) * 0.7;
  
  return vec4(1.0, 1.0, 1.0, intensity);
}
`;

// Heat distortion shader
const advancedHeatDistortionShader = `
uniform float2 u_center;
uniform float u_progress;
uniform float u_size;
uniform float u_time;
uniform float u_type;

float noise(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  for (int i = 0; i < 4; i++) {
    value += amplitude * noise(p * frequency);
    amplitude *= 0.5;
    frequency *= 2.0;
  }
  return value;
}

vec4 main(vec2 fragCoord) {
  vec2 uv = fragCoord;
  vec2 center = u_center;
  vec2 delta = uv - center;
  float dist = length(delta);
  
  float normalizedDist = dist / u_size;
  
  // Base heat distortion
  float heat = 0.0;
  if (normalizedDist < u_progress * 1.3) {
    heat = exp(-normalizedDist * 2.0) * (1.0 - u_progress) * 0.5;
    
    // Add FBM noise for realistic distortion
    vec2 noiseCoord = delta * 0.03 + u_time * 0.08;
    float noiseValue = fbm(noiseCoord) * 2.0 - 1.0;
    heat *= 1.0 + noiseValue * 0.4;
  }
  
  // Enhanced heat for special weapons
  if (u_type >= 1.0) {
    float specialHeat = exp(-normalizedDist * 1.5) * (1.0 - u_progress) * 0.3;
    specialHeat *= sin(u_time * 5.0 + dist * 0.1) * 0.5 + 0.5;
    heat += specialHeat;
  }
  
  return vec4(1.0, 0.6, 0.0, heat);
}
`;

// Color palettes for different explosion types
const getAdvancedExplosionColors = (bulletType: string) => {
  switch (bulletType) {
    case 'player':
      return {
        color1: [0.0, 1.0, 1.0], // Cyan core
        color2: [0.0, 0.8, 1.0], // Light blue
        color3: [0.0, 0.4, 0.8], // Blue
      };
    case 'normal':
      return {
        color1: [1.0, 1.0, 1.0], // White core
        color2: [1.0, 0.3, 0.0], // Orange
        color3: [0.8, 0.0, 0.0], // Red
      };
    case 'special':
      return {
        color1: [1.0, 1.0, 0.0], // Yellow core
        color2: [1.0, 0.4, 0.0], // Orange
        color3: [0.6, 0.0, 0.0], // Dark red
      };
    case 'sniper':
      return {
        color1: [0.0, 1.0, 1.0], // Cyan core
        color2: [0.0, 0.5, 1.0], // Blue
        color3: [0.0, 0.0, 0.8], // Dark blue
      };
    case 'shotgun':
      return {
        color1: [1.0, 0.8, 0.0], // Yellow core
        color2: [1.0, 0.5, 0.0], // Orange
        color3: [0.8, 0.2, 0.0], // Red-orange
      };
    case 'laser':
      return {
        color1: [1.0, 0.0, 0.5], // Magenta core
        color2: [1.0, 0.0, 0.8], // Pink
        color3: [0.5, 0.0, 0.5], // Purple
      };
    default:
      return {
        color1: [1.0, 1.0, 1.0],
        color2: [1.0, 0.3, 0.0],
        color3: [0.8, 0.0, 0.0],
      };
  }
};

// Type mapping
const getTypeValue = (bulletType: string) => {
  switch (bulletType) {
    case 'player': return 5; // Special type for player explosion
    case 'normal': return 0;
    case 'special': return 1;
    case 'sniper': return 2;
    case 'shotgun': return 3;
    case 'laser': return 4;
    default: return 0;
  }
};

const AdvancedExplosionShader: React.FC<AdvancedExplosionShaderProps> = ({
  x,
  y,
  bulletType,
  progress,
  onFinish,
  size = 100,
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const timeValue = useSharedValue(0);
  
  // Update time for animation
  useEffect(() => {
    const interval = setInterval(() => {
      const newTime = currentTime + 0.016; // 60fps
      setCurrentTime(newTime);
      timeValue.value = newTime;
    }, 16);

    return () => clearInterval(interval);
  }, [currentTime, timeValue]);
  
  // Get colors for this explosion type
  const colors = getAdvancedExplosionColors(bulletType);
  
  // Create shaders using Skia.RuntimeEffect.Make
  const explosionShaderProgram = Skia.RuntimeEffect.Make(advancedExplosionShader);
  const shockwaveShaderProgram = Skia.RuntimeEffect.Make(advancedShockwaveShader);
  const heatDistortionShaderProgram = Skia.RuntimeEffect.Make(advancedHeatDistortionShader);
  
  // Call onFinish when explosion is complete
  useEffect(() => {
    if (progress >= 1 && onFinish) {
      onFinish();
    }
  }, [progress, onFinish]);
  
  // Handle null shaders
  if (!explosionShaderProgram || !shockwaveShaderProgram || !heatDistortionShaderProgram) {
    return null;
  }
  
  // Determine which effects to show based on bullet type
  const showShockwave = bulletType === 'special' || bulletType === 'laser';
  const showHeatDistortion = bulletType === 'special' || bulletType === 'shotgun' || bulletType === 'laser';
  
  return (
    <>
      {/* Main explosion effect */}
      <Fill>
        <Shader
          source={explosionShaderProgram}
          uniforms={{
            u_center: [x, y],
            u_progress: progress,
            u_size: size,
            u_time: currentTime,
            u_color1: colors.color1,
            u_color2: colors.color2,
            u_color3: colors.color3,
            u_intensity: 1.0,
            u_type: getTypeValue(bulletType),
          }}
        />
      </Fill>
      
      {/* Shockwave effect */}
      {showShockwave && progress > 0.1 && (
        <Fill>
          <Shader
            source={shockwaveShaderProgram}
            uniforms={{
              u_center: [x, y],
              u_progress: progress,
              u_size: size,
              u_time: currentTime,
              u_type: getTypeValue(bulletType),
            }}
          />
        </Fill>
      )}
      
      {/* Heat distortion effect */}
      {showHeatDistortion && progress < 0.8 && (
        <Fill>
          <Shader
            source={heatDistortionShaderProgram}
            uniforms={{
              u_center: [x, y],
              u_progress: progress,
              u_size: size,
              u_time: currentTime,
              u_type: getTypeValue(bulletType),
            }}
          />
        </Fill>
      )}
    </>
  );
};

export default AdvancedExplosionShader; 