import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  GestureResponderEvent,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

interface CalibrationPoint {
  x: number;
  y: number;
}

interface CourtOverlayProps {
  width: number;
  height: number;
  calibrationPoints?: CalibrationPoint[];
  showLines?: boolean;
  onPointTap?: (x: number, y: number) => void;
}

const POINT_SIZE = 24;
const LINE_THICKNESS = 2;
const MAX_POINTS = 4;

const renderLineSegments = (points: CalibrationPoint[]): React.ReactNode => {
  if (points.length < MAX_POINTS) return null;
  return points.map((point, index) => {
    const next = points[(index + 1) % points.length];
    return <CourtLine key={`line-${index}`} from={point} to={next} />;
  });
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
  const handlePress = (event: GestureResponderEvent) => {
    if (!onPointTap) return;
    const { locationX, locationY } = event.nativeEvent;
    onPointTap(locationX, locationY);
  };

  const visiblePoints = calibrationPoints.slice(0, MAX_POINTS);

  return (
    <TouchableWithoutFeedback onPress={handlePress} testID="court-overlay">
      <View style={[styles.container, { width, height }]} pointerEvents="box-only">
        {showLines ? renderLineSegments(visiblePoints) : null}
        {visiblePoints.map((point, index) => (
          <CourtPoint key={`point-${index}`} index={index} point={point} />
        ))}
      </View>
    </TouchableWithoutFeedback>
  );
};

const CourtPoint: React.FC<{ index: number; point: CalibrationPoint }> = ({ index, point }) => (
  <View
    style={[
      styles.point,
      {
        left: point.x - POINT_SIZE / 2,
        top: point.y - POINT_SIZE / 2,
      },
    ]}
    testID={`court-point-${index}`}>
    <Text style={styles.pointLabel}>{index + 1}</Text>
  </View>
);

const CourtLine: React.FC<{ from: CalibrationPoint; to: CalibrationPoint }> = ({ from, to }) => {
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
