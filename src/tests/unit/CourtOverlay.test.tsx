import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CourtOverlay } from '@presentation/components/CourtOverlay/CourtOverlay';

jest.mock('@presentation/i18n', () => ({
  t: (key: string) => key,
}));

const makePoints = (n: number) => Array.from({ length: n }, (_, i) => ({ x: i * 10, y: i * 10 }));

describe('CourtOverlay', () => {
  describe('when user taps the overlay', () => {
    it('should call onPointTap with the press coordinates', () => {
      const onPointTap = jest.fn();
      const { getByTestId } = render(
        <CourtOverlay width={300} height={400} onPointTap={onPointTap} />,
      );

      fireEvent.press(getByTestId('court-overlay'), {
        nativeEvent: { locationX: 42, locationY: 84 },
      });

      expect(onPointTap).toHaveBeenCalledWith(42, 84);
    });

    it('should not throw when onPointTap is not provided', () => {
      const { getByTestId } = render(<CourtOverlay width={300} height={400} />);

      expect(() =>
        fireEvent.press(getByTestId('court-overlay'), {
          nativeEvent: { locationX: 5, locationY: 5 },
        }),
      ).not.toThrow();
    });
  });

  describe('when rendering court line segments', () => {
    it('should not render any points when no calibration points provided', () => {
      const { queryByTestId } = render(<CourtOverlay width={300} height={400} />);

      expect(queryByTestId('court-point-0')).toBeNull();
    });

    it('should render visible points based on calibrationPoints', () => {
      const points = makePoints(2);
      const { getByTestId, queryByTestId } = render(
        <CourtOverlay width={300} height={400} calibrationPoints={points} />,
      );

      expect(getByTestId('court-point-0')).toBeTruthy();
      expect(getByTestId('court-point-1')).toBeTruthy();
      expect(queryByTestId('court-point-2')).toBeNull();
    });

    it('should clamp visible points to MAX_POINTS (4)', () => {
      const points = makePoints(6);
      const { getByTestId, queryByTestId } = render(
        <CourtOverlay width={300} height={400} calibrationPoints={points} />,
      );

      expect(getByTestId('court-point-0')).toBeTruthy();
      expect(getByTestId('court-point-3')).toBeTruthy();
      expect(queryByTestId('court-point-4')).toBeNull();
      expect(queryByTestId('court-point-5')).toBeNull();
    });
  });

  describe('CourtLineSegments rendering', () => {
    it('should not render lines when fewer than 4 points are provided', () => {
      const points = makePoints(3);
      const { toJSON } = render(
        <CourtOverlay width={300} height={400} calibrationPoints={points} showLines />,
      );

      // Snapshot acts as a defence: only point views, no lines
      const tree = JSON.stringify(toJSON());
      // 3 points expected; lines (transform with rotateZ) should be absent
      expect(tree).not.toContain('rotateZ');
    });

    it('should render line segments when exactly 4 points are provided and showLines is true', () => {
      const points = makePoints(4);
      const { toJSON } = render(
        <CourtOverlay width={300} height={400} calibrationPoints={points} showLines />,
      );

      const tree = JSON.stringify(toJSON());
      // Each line uses transform rotateZ - expect 4 segments
      const matches = tree.match(/rotateZ/g) ?? [];
      expect(matches.length).toBe(4);
    });

    it('should not render any line transforms when showLines is false', () => {
      const points = makePoints(4);
      const { toJSON } = render(
        <CourtOverlay width={300} height={400} calibrationPoints={points} />,
      );

      const tree = JSON.stringify(toJSON());
      expect(tree).not.toContain('rotateZ');
    });
  });

  describe('CourtLine angle calculation', () => {
    it('should render a horizontal line with 0deg rotation between two points on the same Y', () => {
      // Two points on the same horizontal axis -> angle 0
      const points = [
        { x: 0, y: 50 },
        { x: 100, y: 50 },
        { x: 100, y: 50 },
        { x: 0, y: 50 },
      ];
      const { toJSON } = render(
        <CourtOverlay width={200} height={100} calibrationPoints={points} showLines />,
      );

      const tree = JSON.stringify(toJSON());
      // The from->to vector (0,50)->(100,50) yields angle 0
      expect(tree).toContain('"rotateZ":"0deg"');
    });
  });
});
