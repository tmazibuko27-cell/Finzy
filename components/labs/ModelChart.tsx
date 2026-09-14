import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Line, Circle } from 'react-native-svg';
import type { Lab } from '@/features/labs/catalog';

export function ModelChart({ lab, value }: { lab: Lab; value: number }) {
  const samples = Array.from({ length: 41 }, (_, i) => {
    const input = lab.min + (lab.max - lab.min) * i / 40;
    return { input, output: lab.calculate(input) };
  });
  const high = Math.max(...samples.map((point) => point.output));
  const low = Math.min(...samples.map((point) => point.output));
  const x = (input: number) => 12 + (input - lab.min) / (lab.max - lab.min) * 296;
  const y = (output: number) => 138 - (output - low) / Math.max(high - low, 1) * 110;
  const path = samples.map((p, i) => `${i ? 'L' : 'M'}${x(p.input)},${y(p.output)}`).join(' ');
  const cx = x(value);
  const cy = y(lab.calculate(value));
  return (
    <View accessible accessibilityLabel={`${lab.output} versus ${lab.control}. At ${value}${lab.unit}, the value is ${lab.calculate(value).toFixed(2)}.`}>
      <Svg width="100%" height={156} viewBox="0 0 320 156" accessible={false}>
        {[28, 83, 138].map((line) => <Line key={line} x1="12" x2="308" y1={line} y2={line} stroke="#293746" strokeDasharray="3 5" />)}
        <Path d={`${path} L308,150 L12,150 Z`} fill={lab.accent} fillOpacity={0.07} />
        <Path d={path} fill="none" stroke={lab.accent} strokeWidth={3} />
        <Line x1={cx} x2={cx} y1={cy} y2="150" stroke={lab.accent} strokeDasharray="3 4" />
        <Circle cx={cx} cy={cy} r={8} fill={lab.accent} fillOpacity={0.2} />
        <Circle cx={cx} cy={cy} r={4} fill={lab.accent} />
      </Svg>
      <View style={styles.labels}>
        <Text style={styles.label}>{lab.min}{lab.unit}</Text>
        <Text style={styles.label}>{lab.control}</Text>
        <Text style={styles.label}>{lab.max}{lab.unit}</Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  labels: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  label: { color: '#A5B4C5', fontSize: 11 },
});
