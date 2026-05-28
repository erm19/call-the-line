import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, StatusBar } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { RootStackParamList, Routes } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { diContainer, DI_TOKENS } from '@core/di/container';
import { RecordClip } from '@domain/useCases/RecordClip';
import { ICameraService } from '@platform/camera/CameraService';
import { IPermissionService } from '@domain/services/IPermissionService';
import { Permission, PermissionStatus } from '@domain/services/IPermissionService';
import { useCameraStore, RecordingState } from '@presentation/state/cameraStore';
import { CameraViewModel } from './CameraViewModel';

// Orientation lock to landscape requires native configuration:
// iOS: Info.plist UISupportedInterfaceOrientations — add UIInterfaceOrientationLandscapeLeft
//      and UIInterfaceOrientationLandscapeRight
// Android: AndroidManifest.xml android:screenOrientation="landscape" on the activity
// For runtime lock, install react-native-orientation-locker when native dirs exist

type CameraScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Camera'>;
  route: RouteProp<RootStackParamList, 'Camera'>;
};

const RECORD_BUTTON_SIZE = 72;

const RecordingStateLabel: Record<RecordingState, string> = {
  [RecordingState.Idle]: 'Ready',
  [RecordingState.Recording]: 'Recording…',
  [RecordingState.Saving]: 'Saving…',
  [RecordingState.Done]: 'Done',
  [RecordingState.Error]: 'Error',
};

export const CameraScreen: React.FC<CameraScreenProps> = ({ navigation, route }) => {
  const { sessionId } = route.params ?? {};
  const device = useCameraDevice('back');
  const cameraRef = useRef<Camera>(null);

  const recordingState = useCameraStore(state => state.recordingState);
  const error = useCameraStore(state => state.error);

  const viewModelRef = useRef<CameraViewModel | null>(null);
  if (!viewModelRef.current) {
    const cameraService = diContainer.resolve<ICameraService>(DI_TOKENS.CameraService);
    const recordClip = diContainer.resolve<RecordClip>(DI_TOKENS.RecordClip);
    viewModelRef.current = new CameraViewModel(cameraService, recordClip);
  }
  const viewModel = viewModelRef.current;

  useEffect(() => {
    const setup = async (): Promise<void> => {
      const permissionService = diContainer.resolve<IPermissionService>(
        DI_TOKENS.PermissionService,
      );
      const checkResult = await permissionService.checkPermission(Permission.Camera);
      if (checkResult.isFailure) {
        navigation.navigate(Routes.PermissionDenied);
        return;
      }
      if (checkResult.value !== PermissionStatus.Granted) {
        const requestResult = await permissionService.requestPermission(Permission.Camera);
        if (
          requestResult.isFailure ||
          requestResult.value !== PermissionStatus.Granted
        ) {
          navigation.navigate(Routes.PermissionDenied);
          return;
        }
      }
      await viewModel.initialize({
        device: 'back',
        resolution: { width: 1920, height: 1080 },
        fps: 60,
        quality: 'high',
        codec: 'h264',
        enableAudio: false,
        maxDuration: 0,
      });
    };

    void setup();

    return () => {
      void viewModel.release();
    };
  }, [navigation, viewModel]);

  const handleRecordPress = async (): Promise<void> => {
    if (recordingState === RecordingState.Recording) {
      await viewModel.stopRecording(sessionId ?? '');
    } else if (recordingState === RecordingState.Idle) {
      await viewModel.startRecording();
    }
  };

  const isRecording = recordingState === RecordingState.Recording;
  const canRecord =
    recordingState === RecordingState.Idle || recordingState === RecordingState.Recording;

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      {device ? (
        <Camera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={recordingState !== RecordingState.Done}
          video
        />
      ) : (
        <View style={styles.cameraPlaceholder}>
          <Text style={styles.placeholderText}>Camera unavailable</Text>
          <Text style={styles.placeholderSubtext}>
            Native camera setup required — run on a real device
          </Text>
        </View>
      )}

      <View style={styles.overlay}>
        <Text style={styles.stateLabel}>{RecordingStateLabel[recordingState]}</Text>
        {error !== null && <Text style={styles.errorText}>{error}</Text>}

        <Pressable
          style={[styles.recordButton, isRecording && styles.recordButtonActive]}
          onPress={() => {
            void handleRecordPress();
          }}
          disabled={!canRecord}
          accessibilityLabel={isRecording ? 'Stop recording' : 'Start recording'}
          accessibilityRole="button">
          <View style={[styles.recordButtonInner, isRecording && styles.recordButtonInnerActive]} />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  cameraPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  placeholderSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: spacing['2xl'],
  },
  stateLabel: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
    marginBottom: spacing.md,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  recordButton: {
    width: RECORD_BUTTON_SIZE,
    height: RECORD_BUTTON_SIZE,
    borderRadius: borderRadius.full,
    borderWidth: 4,
    borderColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButtonActive: {
    borderColor: colors.error,
  },
  recordButtonInner: {
    width: RECORD_BUTTON_SIZE - 20,
    height: RECORD_BUTTON_SIZE - 20,
    borderRadius: borderRadius.full,
    backgroundColor: colors.error,
  },
  recordButtonInnerActive: {
    borderRadius: borderRadius.sm,
    width: RECORD_BUTTON_SIZE - 28,
    height: RECORD_BUTTON_SIZE - 28,
    backgroundColor: colors.error,
  },
});
