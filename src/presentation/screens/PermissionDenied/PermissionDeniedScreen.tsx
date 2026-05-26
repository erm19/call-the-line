import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { t } from '../../i18n';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { PermissionDeniedViewModel } from './PermissionDeniedViewModel';
import { diContainer, DI_TOKENS } from '@core/di/container';
import type { IPermissionService } from '@domain/services/IPermissionService';

type PermissionDeniedNavigationProp = StackNavigationProp<RootStackParamList, 'PermissionDenied'>;

interface Props {
  navigation: PermissionDeniedNavigationProp;
}

export const PermissionDeniedScreen: React.FC<Props> = ({ navigation }) => {
  const viewModel = useMemo(() => {
    const permissionService = diContainer.resolve<IPermissionService>(DI_TOKENS.PermissionService);
    return new PermissionDeniedViewModel(permissionService);
  }, []);

  const handleOpenSettings = (): void => {
    void viewModel.openSettings();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{t('permissionDenied.title')}</Text>
        <Text style={styles.body}>{t('permissionDenied.body')}</Text>
        <Text style={styles.instruction}>{t('permissionDenied.instruction')}</Text>
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.primaryButton} onPress={handleOpenSettings}>
          <Text style={styles.primaryButtonText}>{t('permissionDenied.openSettings')}</Text>
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.secondaryButtonText}>{t('common.back')}</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  body: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
    marginBottom: spacing.md,
  },
  instruction: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
  },
  actions: {
    gap: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
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
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
  },
});
