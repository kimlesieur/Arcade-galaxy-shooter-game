import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

interface StarProps {
  width: number;
  height: number;
  speed: number;
  size: number;
}

const getRandom = (min: number, max: number) =>
  Math.random() * (max - min) + min;

const Star: React.FC<StarProps> = ({ width, height, speed, size }) => {
  const x = useSharedValue(getRandom(0, width));
  const y = useSharedValue(getRandom(0, height));

  useEffect(() => {
    let isMounted = true;
    let lastTimestamp = Date.now();

    const animate = () => {
      if (!isMounted) return;
      const now = Date.now();
      const delta = (now - lastTimestamp) / 1000; // seconds
      lastTimestamp = now;
      y.value += speed * delta;
      if (y.value > height) {
        y.value = 0;
        x.value = getRandom(0, width);
      }
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
    return () => {
      isMounted = false;
    };
  }, [height, width, speed, x, y]);

  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    left: x.value,
    top: y.value,
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: 'white',
    opacity: 0.7,
  }));

  return <Animated.View style={style} />;
};

interface StarfieldProps {
  width: number;
  height: number;
  starCount?: number;
}

const Starfield: React.FC<StarfieldProps> = ({
  width,
  height,
  starCount = 60,
}) => {
  // Precompute random speeds and sizes for each star for stable rendering
  const stars = React.useMemo(() => {
    return Array.from({ length: starCount }).map(() => ({
      speed: getRandom(30, 100),
      size: getRandom(3, 6),
    }));
  }, [starCount]);

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        {
          width,
          height,
          zIndex: 0,
          backgroundColor: 'rgba(139, 116, 197, 0.2)',
        },
      ]}
    >
      {stars.map((star, i) => (
        <Star
          key={i}
          width={width}
          height={height}
          speed={star.speed}
          size={star.size}
        />
      ))}
    </View>
  );
};

export default Starfield;
