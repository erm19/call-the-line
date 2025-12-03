import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { t } from '../../i18n';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

/**
 * Home Screen
 * Main landing screen with quick actions
 */
const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const handleStartSession = () => {
    navigation.navigate('Camera' as never);
  };

  const handleViewSessions = () => {
    navigation.navigate('SessionList' as never);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('home.title')}</Text>
        <Text style={styles.subtitle}>{t('home.subtitle')}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleStartSession}>
          <Text style={styles.primaryButtonText}>{t('home.startSession')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={handleViewSessions}>
          <Text style={styles.secondaryButtonText}>{t('home.viewSessions')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
  },
  actions: {
    gap: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
  },
});

export default HomeScreen;

