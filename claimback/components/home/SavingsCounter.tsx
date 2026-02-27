import { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, View } from 'react-native';

interface SavingsCounterProps {
  amount: number;
}

export function SavingsCounter({ amount }: SavingsCounterProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const displayValue = useRef(0);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: amount,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  }, [amount]);

  return (
    <Animated.Text style={styles.amount}>
      $
      <AnimatedNumber value={animatedValue} />
    </Animated.Text>
  );
}

function AnimatedNumber({ value }: { value: Animated.Value }) {
  const textRef = useRef<Text>(null);

  useEffect(() => {
    const id = value.addListener(({ value: v }) => {
      if (textRef.current) {
        textRef.current.setNativeProps({ text: Math.round(v).toLocaleString() });
      }
    });
    return () => value.removeListener(id);
  }, [value]);

  return <Text ref={textRef} style={styles.numberText}>0</Text>;
}

const styles = StyleSheet.create({
  amount: {
    fontSize: 56,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -1,
  },
  numberText: {
    fontSize: 56,
    fontWeight: '900',
    color: '#ffffff',
  },
});
