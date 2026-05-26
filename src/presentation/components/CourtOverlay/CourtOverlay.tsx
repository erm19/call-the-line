import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Point2D } from '@domain/entities/CourtCalibration';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { t } from '../../i18n';

interface CourtOverlayProps {
  width: number;
  height: number;
  calibrationPoints?: Point2D[];
  showLines?: boolean;
  onPointTap?: (x: number, y: number) => void;
}

const POINT_SIZE = 24;
const LINE_THICKNESS = 2;
const MAX_POINTS = 4;
const CORNER_LABELS = ['top-left', 'top-right', 'bottom-right', 'bottom-left'] as const;

const CourtLineSegments: React.FC<{ points: Point2D[] }> = ({ points }) => {
  if (points.length < MAX_POINTS) return null;
  return (
    <>
      {points.map((point, index) => {
        const next = points[(index + 1) % points.length];
        const label = CORNER_LABELS[index];
        return <CourtLine key={`line-${label}`} from={point} to={next} />;
      })}
    </>
  );
};

/**
 * Court overlay (View-based).
 *
 * `react-native-svg` is not installed, so this implementation positions
 * absolute Views to draw the corner dots and connecting court lines.
 * Swap to an SVG-based renderer if/when the dependency is added.
 */
export const CourtOverlay: React.FC<CourtOverlayProps> = ({
  width,
  height,
  calibrationPoints = [],
  showLines = false,
  onPointTap,
}) => {
  const visiblePoints = calibrationPoints.slice(0, MAX_POINTS);

  return (
    <Pressable
      onPress={e => {
        if (!onPointTap) return;
        onPointTap(e.nativeEvent.locationX, e.nativeEvent.locationY);
      }}
      testID="court-overlay"
      accessibilityLabel={t('calibration.instruction')}
      accessibilityRole="button"
      style={[styles.container, { width, height }]}>
      {showLines ? <CourtLineSegments points={visiblePoints} /> : null}
      {visiblePoints.map((point, index) => (
        <CourtPoint
          key={CORNER_LABELS[index]}
          index={index}
          point={point}
          cornerLabel={CORNER_LABELS[index]}
        />
      ))}
    </Pressable>
  );
};

const CourtPoint: React.FC<{ index: number; point: Point2D; cornerLabel: string }> = ({
  index,
  point,
  cornerLabel,
}) => (
  <View
    style={[
      styles.point,
      {
        left: point.x - POINT_SIZE / 2,
        top: point.y - POINT_SIZE / 2,
      },
    ]}
    testID={`court-point-${index}`}
    accessibilityLabel={cornerLabel}>
    <Text style={styles.pointLabel}>{index + 1}</Text>
  </View>
);

const CourtLine: React.FC<{ from: Point2D; to: Point2D }> = ({ from, to }) => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angleRad = Math.atan2(dy, dx);
  const angleDeg = (angleRad * 180) / Math.PI;
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  return (
    <View
      style={[
        styles.line,
        {
          left: midX - length / 2,
          top: midY - LINE_THICKNESS / 2,
          width: length,
          transform: [{ rotateZ: `${angleDeg}deg` }],
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'transparent',
  },
  point: {
    position: 'absolute',
    width: POINT_SIZE,
    height: POINT_SIZE,
    borderRadius: POINT_SIZE / 2,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  pointLabel: {
    color: colors.white,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  line: {
    position: 'absolute',
    height: LINE_THICKNESS,
    backgroundColor: colors.secondary,
  },
});
