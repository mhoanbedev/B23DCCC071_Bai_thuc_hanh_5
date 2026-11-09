import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';
import { MapPin } from 'lucide-react-native';

import colors from '../../theme/colors';

interface LocationPreviewProps {
  width: number;
  height: number;
  tint: 'light' | 'dark';
}

export default function LocationPreview({ width, height, tint }: LocationPreviewProps) {
  const base = tint === 'dark' ? '#3567D6' : '#E8EEF8';
  const grid = tint === 'dark' ? 'rgba(255,255,255,0.10)' : 'rgba(33,85,205,0.08)';
  const road = tint === 'dark' ? 'rgba(255,255,255,0.32)' : '#FFFFFF';
  const water = tint === 'dark' ? 'rgba(255,255,255,0.12)' : '#D4E2F7';
  const park = tint === 'dark' ? 'rgba(255,255,255,0.08)' : '#DDEEDF';
  const columns = Math.ceil(width / 24);
  const rows = Math.ceil(height / 24);
  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <Rect x={0} y={0} width={width} height={height} fill={base} />
        {Array.from({ length: columns }).map((_, index) => (
          <Line key={`c${index}`} x1={index * 24} y1={0} x2={index * 24} y2={height} stroke={grid} strokeWidth={1} />
        ))}
        {Array.from({ length: rows }).map((_, index) => (
          <Line key={`r${index}`} x1={0} y1={index * 24} x2={width} y2={index * 24} stroke={grid} strokeWidth={1} />
        ))}
        <Rect x={width * 0.06} y={height * 0.12} width={width * 0.22} height={height * 0.3} rx={6} fill={park} />
        <Path
          d={`M0 ${height * 0.78} C ${width * 0.25} ${height * 0.7}, ${width * 0.45} ${height * 0.95}, ${width} ${height * 0.82} L ${width} ${height} L 0 ${height} Z`}
          fill={water}
        />
        <Path
          d={`M0 ${height * 0.55} C ${width * 0.3} ${height * 0.5}, ${width * 0.6} ${height * 0.62}, ${width} ${height * 0.4}`}
          stroke={road}
          strokeWidth={7}
          fill="none"
        />
        <Line x1={width * 0.62} y1={0} x2={width * 0.5} y2={height} stroke={road} strokeWidth={5} />
        <Line x1={width * 0.18} y1={height * 0.55} x2={width * 0.32} y2={height} stroke={road} strokeWidth={3} />
        <Circle cx={width / 2} cy={height / 2 + 12} r={10} fill={colors.primary} opacity={0.18} />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.pinWrap]} pointerEvents="none">
        <View style={styles.pin}>
          <MapPin size={20} color={colors.onPrimary} fill={colors.danger} strokeWidth={1.8} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pinWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pin: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.surface,
    marginBottom: 6,
  },
});
