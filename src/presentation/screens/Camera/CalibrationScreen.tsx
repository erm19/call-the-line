import React, { useRef, useCallback, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, StatusBar, useWindowDimensions } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, Routes } from '../../navigation/types';
import { CourtOverlay } from '../../components/CourtOverlay/CourtOverlay';
import { CalibrationViewModel } from './CalibrationViewModel';
import { useCalibrationStore } from '@presentation/state/calibrationStore';
import { diContainer, DI_TOKENS } from '@core/di/container';
import { SaveCalibration } from '@domain/useCases/SaveCalibration';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { t } from '../../i18n';

type CalibrationScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, typeof Routes.Calibration>;
  route: RouteProp<RootStackParamList, typeof Routes.Calibration>;
};

const CONTROLS_HEIGHT = 120;

export const CalibrationScreen: React.FC<CalibrationScreenProps> = ({ navigation, route }) => {
  const { sessionId } = route.params;
  const { width, height } = useWindowDimensions();

  const cornerPoints = useCalibrationStore(state => state.cornerPoints);
  const isSubmitting = useCalibrationStore(state => state.isSubmitting);
  const error = useCalibrationStore(state => state.error);

  const viewModelRef = useRef<CalibrationViewModel | null>(null);
  if (!viewModelRef.current) {
    const saveCalibration = diContainer.resolve<SaveCalibration>(DI_TOKENS.SaveCalibration);
    viewModelRef.current = new CalibrationViewModel(saveCalibration);
  }
  const viewModel = viewModelRef.current;

  useEffect(() => {
    useCalibrationStore.getState().reset();
  }, []);

  const handlePointTap = useCallback(
    (x: number, y: number) => {
      viewModel.addPoint(x, y);
    },
    [viewModel],
  );

  const handleUndo = useCallback(() => {
    viewModel.removeLastPoint();
  }, [viewModel]);

  const handleSave = useCallback(async () => {
    const result = await viewModel.saveCalibration(sessionId);
    if (result.isSuccess) {
      navigation.goBack();
    }
  }, [viewModel, sessionId, navigation]);

  const overlayHeight = height - CONTROLS_HEIGHT;

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <CourtOverlay
        width={width}
        height={overlayHeight}
        calibrationPoints={cornerPoints}
        showLines={cornerPoints.length === 4}
        onPointTap={handlePointTap}
      />
      <View style={styles.controls}>
        <Text style={styles.instruction}>
          {t('calibration.instruction')} ({cornerPoints.length}/4)
        </Text>
        {error !== null && <Text style={styles.errorText}>{error}</Text>}
        <View style={styles.buttons}>
          <Pressable
            style={[styles.undoButton, cornerPoints.length === 0 && styles.buttonDisabled]}
            onPress={handleUndo}
            disabled={cornerPoints.length === 0}>
            <Text style={styles.undoText}>{t('calibration.undoPoint')}</Text>
          </Pressable>
          <Pressable
            style={[
              styles.saveButton,
              (cornerPoints.length < 4 || isSubmitting) && styles.buttonDisabled,
            ]}
            onPress={() => {
              void handleSave();
            }}
            disabled={cornerPoints.length < 4 || isSubmitting}>
            <Text style={styles.saveText}>{t('calibration.save')}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  controls: {
    height: CONTROLS_HEIGHT,
    backgroundColor: colors.black,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    justifyContent: 'center',
  },
  instruction: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSize.xs,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
  },
  undoButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.white,
  },
  saveButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  undoText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
  },
  saveText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
});
