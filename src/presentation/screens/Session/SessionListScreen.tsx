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
import { GetSessions } from '@domain/useCases/GetSessions';
import { EndSession } from '@domain/useCases/EndSession';
import { Session, SessionStatus } from '@domain/entities/Session';
import { useSessionStore } from '@presentation/state/sessionStore';
import { SessionListViewModel } from './SessionListViewModel';

type SessionListNavigationProp = StackNavigationProp<RootStackParamList, 'SessionList'>;

interface Props {
  navigation: SessionListNavigationProp;
}

const DATE_FORMAT_PATTERN = 'PP p';

export const SessionListScreen: React.FC<Props> = ({ navigation }) => {
  const items = useSessionStore(state => state.items);
  const isLoading = useSessionStore(state => state.isLoading);
  const error = useSessionStore(state => state.error);

  const viewModel = useMemo(() => {
    const getSessions = diContainer.resolve<GetSessions>(DI_TOKENS.GetSessions);
    const endSession = diContainer.resolve<EndSession>(DI_TOKENS.EndSession);
    return new SessionListViewModel(getSessions, endSession);
  }, []);

  useEffect(() => {
    void viewModel.loadSessions();
  }, [viewModel]);

  const handleSessionPress = (sessionId: string): void => {
    navigation.navigate(Routes.SessionDetail, { sessionId });
  };

  const renderItem: ListRenderItem<Session> = ({ item }) => (
    <Pressable style={styles.card} onPress={() => handleSessionPress(item.id)}>
      <Text style={styles.cardTitle}>{item.name}</Text>
      <Text style={styles.cardMeta}>{formatDate(item.startedAt, DATE_FORMAT_PATTERN)}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.cardStatus}>
          {item.status === SessionStatus.Active ? t('sessions.active') : t('sessions.completed')}
        </Text>
        <Text style={styles.cardClips}>{t('sessions.clips', { count: item.clipIds.length })}</Text>
      </View>
    </Pressable>
  );

  if (error && items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  if (!isLoading && items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>{t('sessions.noSessions')}</Text>
          <Text style={styles.emptySubtitle}>{t('sessions.createFirst')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  cardTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  cardMeta: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  cardStatus: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
  },
  cardClips: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  errorText: {
    fontSize: typography.fontSize.base,
    color: colors.error,
    textAlign: 'center',
  },
});
