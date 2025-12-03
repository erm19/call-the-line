import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { t } from '../../i18n';

type ReviewRouteProp = RouteProp<RootStackParamList, 'Review'>;

interface Props {
  route: ReviewRouteProp;
}

/**
 * Review Screen
 * Shows AI analysis results for a clip
 */
const ReviewScreen: React.FC<Props> = ({ route }) => {
  const { clipId } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>{t('review.title')}</Text>
      <Text style={styles.subtext}>Clip ID: {clipId}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  subtext: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
});

export default ReviewScreen;

