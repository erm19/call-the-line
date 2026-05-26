import React from 'react';
import { View, Text, Pressable, StyleProp, ViewStyle } from 'react-native';
import { t } from '../../i18n';
import { styles } from './VideoPlayer.styles';

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
        <Text style={styles.title}>{t('videoPlayer.comingSoon')}</Text>
        <Text style={styles.uri} numberOfLines={2}>
          {uri}
        </Text>
      </View>
      {onClose ? (
        <Pressable
          style={styles.closeButton}
          onPress={onClose}
          accessibilityRole="button"
          testID="video-player-close">
          <Text style={styles.closeText}>{t('videoPlayer.close')}</Text>
        </Pressable>
      ) : null}
    </View>
  );
};
