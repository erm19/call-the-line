import React, { useEffect, useMemo } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, ListRenderItem } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Routes } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { t } from '../../i18n';
import { formatDate } from '@core/utils/date';
import { diContainer, DI_TOKENS } from '@core/di/container';
import { StartSession } from '@domain/useCases/StartSession';
import { GetSessions } from '@domain/useCases/GetSessions';
import { Session } from '@domain/entities/Session';
import { useSessionStore } from '@presentation/state/sessionStore';
import { HomeViewModel } from './HomeViewModel';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const DATE_FORMAT_PATTERN = 'PP p';

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const items = useSessionStore(state => state.items);
  const isLoading = useSessionStore(state => state.isLoading);

  const viewModel = useMemo(() => {
    const startSession = diContainer.resolve<StartSession>(DI_TOKENS.StartSession);
    const getSessions = diContainer.resolve<GetSessions>(DI_TOKENS.GetSessions);
    return new HomeViewModel(startSession, getSessions);
  }, []);

  useEffect(() => {
    void viewModel.loadSessions();
  }, [viewModel]);

  const handleStartSession = (): void => {
    void viewModel.startSession(t('session.defaultName')).then(() => {
      navigation.navigate(Routes.Camera, {});
    });
  };

  const handleSessionPress = (sessionId: string): void => {
    navigation.navigate(Routes.SessionDetail, { sessionId });
  };

  const handleViewAllSessions = (): void => {
    navigation.navigate(Routes.SessionList);
  };

  const renderItem: ListRenderItem<Session> = ({ item }) => (
    <Pressable style={styles.sessionCard} onPress={() => handleSessionPress(item.id)}>
      <Text style={styles.sessionName}>{item.name}</Text>
      <Text style={styles.sessionDate}>{formatDate(item.startedAt, DATE_FORMAT_PATTERN)}</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('home.title')}</Text>
        <Text style={styles.subtitle}>{t('home.subtitle')}</Text>
      </View>

      <Pressable
        style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
        onPress={handleStartSession}
        disabled={isLoading}>
        <Text style={styles.primaryButtonText}>{t('home.startSession')}</Text>
      </Pressable>

      {items.length > 0 && (
        <View style={styles.recentSessions}>
          <View style={styles.recentHeader}>
            <Text style={styles.recentTitle}>{t('sessions.title')}</Text>
            <Pressable onPress={handleViewAllSessions}>
              <Text style={styles.viewAllText}>{t('home.viewSessions')}</Text>
            </Pressable>
          </View>
          <FlatList
            data={items.slice(0, 5)}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            scrollEnabled={false}
          />
        </View>
      )}
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
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  recentSessions: {
    flex: 1,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  recentTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  viewAllText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
  },
  sessionCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  sessionName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
  },
  sessionDate: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
});
