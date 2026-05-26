import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface VideoPlayerProps {
  uri: string;
  onClose?: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Video player placeholder.
 *
 * No video playback library is installed yet (`react-native-video` is
 * intentionally absent from dependencies). This component renders the clip
 * URI and a "coming soon" message so consumers can wire it into screens
 * without blocking on the playback implementation.
 *
 * Replace the inner render with the real player when the dependency lands.
 */
export const VideoPlayer: React.FC<VideoPlayerProps> = ({ uri, onClose, style }) => {
  return (
    <View style={[styles.container, style]} testID="video-player">
      <View style={styles.body}>
        <Text style={styles.title}>Video Playback (Coming Soon)</Text>
        <Text style={styles.uri} numberOfLines={2}>
          {uri}
        </Text>
      </View>
      {onClose ? (
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          accessibilityRole="button"
          testID="video-player-close">
          <Text style={styles.closeText}>Close</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.gray900,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.sm,
  },
  uri: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.mono,
    textAlign: 'center',
  },
  closeButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
  },
  closeText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },
});
