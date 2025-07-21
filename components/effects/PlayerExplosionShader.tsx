import React, { useEffect, useState } from 'react';
import { Fill, Skia, Shader } from '@shopify/react-native-skia';
import { useSharedValue } from 'react-native-reanimated';

interface PlayerExplosionShaderProps {
  x: number;
  y: number;
  progress: number; // 0 to 1
  onFinish?: () => void;
  size?: number; // Explosion radius
}

// Dramatic player explosion shader
const playerExplosionShader = `
uniform float2 u_center;
uniform float u_progress;
uniform float u_size;
uniform float u_time;

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
  for (int i = 0; i < 6; i++) {
    value += amplitude * noise(p * frequency);
    amplitude *= 0.5;
    frequency *= 2.0;
  }
  return value;
}

// Energy pulse effect
float energyPulse(vec2 p, float time) {
  float dist = length(p);
  float pulse = sin(dist * 15.0 - time * 20.0) * 0.5 + 0.5;
  pulse *= exp(-dist * 1.5);
  return pulse;
}

// Plasma effect
float plasma(vec2 p, float time) {
  float v1 = sin(p.x * 8.0 + time);
  float v2 = sin(p.y * 8.0 + time * 0.7);
  float v3 = sin((p.x + p.y) * 8.0 + time * 0.3);
  return (v1 + v2 + v3) / 3.0;
}

vec4 main(vec2 fragCoord) {
  vec2 uv = fragCoord;
  vec2 center = u_center;
  vec2 delta = uv - center;
  float dist = length(delta);
  
  // Normalize distance to explosion size
  float normalizedDist = dist / u_size;
  
  // Dramatic explosion wave
  float wave = 1.0 - smoothstep(0.0, 1.0, normalizedDist - u_progress * 3.0);
  
  // Enhanced turbulence using FBM
  vec2 noiseCoord = delta * 0.008 + u_time * 0.15;
  float turbulence = fbm(noiseCoord) * 0.6;
  
  // Multiple shockwaves
  float shockwave1 = 0.0;
  float shockwave2 = 0.0;
  if (u_progress > 0.05) {
    float shock1Dist = normalizedDist - (u_progress - 0.05) * 2.0;
    shockwave1 = exp(-shock1Dist * shock1Dist * 20.0) * 0.8;
  }
  if (u_progress > 0.15) {
    float shock2Dist = normalizedDist - (u_progress - 0.15) * 1.5;
    shockwave2 = exp(-shock2Dist * shock2Dist * 15.0) * 0.6;
  }
  
  // Intense heat distortion
  float heat = 0.0;
  if (normalizedDist < u_progress * 2.0) {
    heat = exp(-normalizedDist * 1.8) * (1.0 - u_progress) * 0.7;
  }
  
  // Energy pulses
  float energyPulses = energyPulse(delta * 0.01, u_time) * 0.5;
  energyPulses *= exp(-normalizedDist * 2.0) * (1.0 - u_progress * 0.7);
  
  // Plasma effects
  float plasmaEffect = plasma(delta * 0.03, u_time) * 0.4;
  plasmaEffect *= exp(-normalizedDist * 2.5) * (1.0 - u_progress);
  
  // Combine all effects
  float intensity = wave + turbulence + shockwave1 + shockwave2 + heat + energyPulses + plasmaEffect;
  intensity *= 1.5; // More intense than regular explosions
  
  // Dramatic color gradient for player explosion
  vec3 color;
  if (normalizedDist < u_progress * 0.2) {
    // Core - bright white/blue
    color = mix(vec3(1.0, 1.0, 1.0), vec3(0.0, 0.8, 1.0), normalizedDist / (u_progress * 0.2));
  } else if (normalizedDist < u_progress * 0.5) {
    // Middle - blue/cyan
    color = mix(vec3(0.0, 0.8, 1.0), vec3(0.0, 1.0, 1.0), (normalizedDist - u_progress * 0.2) / (u_progress * 0.3));
  } else if (normalizedDist < u_progress * 0.8) {
    // Outer - cyan/green
    color = mix(vec3(0.0, 1.0, 1.0), vec3(0.0, 1.0, 0.5), (normalizedDist - u_progress * 0.5) / (u_progress * 0.3));
  } else {
    // Edge - green/dark
    color = mix(vec3(0.0, 1.0, 0.5), vec3(0.0, 0.3, 0.0), (normalizedDist - u_progress * 0.8) / (u_progress * 0.2));
  }
  
  // Enhanced sparkle effect
  float sparkle = noise(uv * 120.0 + u_time * 4.0) * noise(uv * 80.0 - u_time * 3.0);
  sparkle *= exp(-normalizedDist * 5.0) * (1.0 - u_progress) * 0.8;
  color += sparkle * vec3(1.0, 1.0, 1.0);
  
  // Add plasma color variation
  float plasmaColor = plasma(delta * 0.08, u_time * 0.8);
  color += plasmaColor * 0.3 * vec3(0.0, 0.8, 1.0) * (1.0 - u_progress);
  
  // Add energy pulse color
  color += energyPulses * vec3(0.0, 1.0, 1.0);
  
  // Fade out with dramatic timing
  float alpha = intensity * (1.0 - u_progress * 0.95);
  
  return vec4(color, alpha);
}
`;

// Dramatic shockwave shader for player explosion
const playerShockwaveShader = `
uniform float2 u_center;
uniform float u_progress;
uniform float u_size;
uniform float u_time;

float noise(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

vec4 main(vec2 fragCoord) {
  vec2 uv = fragCoord;
  vec2 center = u_center;
  vec2 delta = uv - center;
  float dist = length(delta);
  
  float normalizedDist = dist / u_size;
  
  // Multiple expanding rings for dramatic effect
  float ring = 0.0;
  float ringWidth = 0.06;
  float ringPos = u_progress * 3.0;
  
  // Primary ring
  if (abs(normalizedDist - ringPos) < ringWidth) {
    ring = 1.0 - abs(normalizedDist - ringPos) / ringWidth;
    ring = smoothstep(0.0, 1.0, ring);
  }
  
  // Secondary ring
  float ring2Pos = ringPos * 0.6;
  if (abs(normalizedDist - ring2Pos) < ringWidth * 0.8) {
    float ring2 = 1.0 - abs(normalizedDist - ring2Pos) / (ringWidth * 0.8);
    ring2 = smoothstep(0.0, 1.0, ring2) * 0.7;
    ring = max(ring, ring2);
  }
  
  // Tertiary ring
  float ring3Pos = ringPos * 0.3;
  if (abs(normalizedDist - ring3Pos) < ringWidth * 0.6) {
    float ring3 = 1.0 - abs(normalizedDist - ring3Pos) / (ringWidth * 0.6);
    ring3 = smoothstep(0.0, 1.0, ring3) * 0.5;
    ring = max(ring, ring3);
  }
  
  // Enhanced ripple effect
  float ripple = sin((normalizedDist - ringPos) * 80.0 - u_time * 15.0) * 0.5 + 0.5;
  ripple *= exp(-(normalizedDist - ringPos) * (normalizedDist - ringPos) * 200.0);
  
  // Noise distortion
  float noiseDistortion = noise(delta * 0.015 + u_time * 0.12) * 0.4;
  
  // Combine effects
  float intensity = ring * 0.9 + ripple * 0.5 + noiseDistortion;
  intensity *= (1.0 - u_progress) * 0.8;
  
  return vec4(0.0, 0.8, 1.0, intensity);
}
`;

// Heat distortion shader for player explosion
const playerHeatDistortionShader = `
uniform float2 u_center;
uniform float u_progress;
uniform float u_size;
uniform float u_time;

float noise(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

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

vec4 main(vec2 fragCoord) {
  vec2 uv = fragCoord;
  vec2 center = u_center;
  vec2 delta = uv - center;
  float dist = length(delta);
  
  float normalizedDist = dist / u_size;
  
  // Intense heat distortion
  float heat = 0.0;
  if (normalizedDist < u_progress * 1.8) {
    heat = exp(-normalizedDist * 1.5) * (1.0 - u_progress) * 0.8;
    
    // Add FBM noise for realistic distortion
    vec2 noiseCoord = delta * 0.025 + u_time * 0.1;
    float noiseValue = fbm(noiseCoord) * 2.0 - 1.0;
    heat *= 1.0 + noiseValue * 0.6;
    
    // Add pulsing effect
    float pulse = sin(u_time * 8.0 + dist * 0.1) * 0.5 + 0.5;
    heat *= 1.0 + pulse * 0.3;
  }
  
  return vec4(0.0, 0.8, 1.0, heat);
}
`;

const PlayerExplosionShader: React.FC<PlayerExplosionShaderProps> = ({
  x,
  y,
  progress,
  onFinish,
  size = 200, // Larger than regular explosions
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
  
  // Create shaders using Skia.RuntimeEffect.Make
  const explosionShader = Skia.RuntimeEffect.Make(playerExplosionShader);
  const shockwaveShader = Skia.RuntimeEffect.Make(playerShockwaveShader);
  const heatDistortionShader = Skia.RuntimeEffect.Make(playerHeatDistortionShader);
  
  // Call onFinish when explosion is complete
  useEffect(() => {
    if (progress >= 1 && onFinish) {
      onFinish();
    }
  }, [progress, onFinish]);
  
  // Handle null shaders
  if (!explosionShader || !shockwaveShader || !heatDistortionShader) {
    return null;
  }
  
  return (
    <>
      {/* Main explosion effect */}
      <Fill>
        <Shader
          source={explosionShader}
          uniforms={{
            u_center: [x, y],
            u_progress: progress,
            u_size: size,
            u_time: currentTime,
          }}
        />
      </Fill>
      
      {/* Shockwave effect - always show for player explosion */}
      {progress > 0.05 && (
        <Fill>
          <Shader
            source={shockwaveShader}
            uniforms={{
              u_center: [x, y],
              u_progress: progress,
              u_size: size,
              u_time: currentTime,
            }}
          />
        </Fill>
      )}
      
      {/* Heat distortion effect */}
      {progress < 0.9 && (
        <Fill>
          <Shader
            source={heatDistortionShader}
            uniforms={{
              u_center: [x, y],
              u_progress: progress,
              u_size: size,
              u_time: currentTime,
            }}
          />
        </Fill>
      )}
    </>
  );
};

export default PlayerExplosionShader; 