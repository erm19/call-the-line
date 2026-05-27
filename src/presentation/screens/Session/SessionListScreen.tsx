import React, { useEffect, useRef } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, ListRenderItem } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Routes } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { t } from '../../i18n';
import { formatSessionDateTime } from '@core/utils/date';
import { diContainer, DI_TOKENS } from '@core/di/container';
import { GetSessions } from '@domain/useCases/GetSessions';
import { EndSession } from '@domain/useCases/EndSession';
import { Session, SessionStatus } from '@domain/entities/Session';
import { useSessionStore } from '@presentation/state/sessionStore';
import { SessionListViewModel } from './SessionListViewModel';

type SessionListNavigationProp = StackNavigationProp<RootStackParamList, Routes.SessionList>;

interface Props {
  navigation: SessionListNavigationProp;
}

export const SessionListScreen: React.FC<Props> = ({ navigation }) => {
  const items = useSessionStore(state => state.items);
  const isLoading = useSessionStore(state => state.isLoading);
  const error = useSessionStore(state => state.error);

  const viewModelRef = useRef<SessionListViewModel | null>(null);
  if (!viewModelRef.current) {
    const getSessions = diContainer.resolve<GetSessions>(DI_TOKENS.GetSessions);
    const endSession = diContainer.resolve<EndSession>(DI_TOKENS.EndSession);
    viewModelRef.current = new SessionListViewModel(getSessions, endSession);
  }
  const viewModel = viewModelRef.current;

  useEffect(() => {
    void viewModel.loadSessions();
  }, [viewModel]);

  const handleSessionPress = (sessionId: string): void => {
    navigation.navigate(Routes.SessionDetail, { sessionId });
  };

  const renderItem: ListRenderItem<Session> = ({ item }) => (
    <Pressable style={styles.card} onPress={() => handleSessionPress(item.id)}>
      <Text style={styles.cardTitle}>{item.name}</Text>
      <Text style={styles.cardMeta}>{formatSessionDateTime(item.startedAt)}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.cardStatus}>
          {item.status === SessionStatus.Active ? t('sessions.active') : t('sessions.completed')}
        </Text>
        <Text style={styles.cardClips}>{t('sessions.clips', { count: item.clipIds.length })}</Text>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      {!isLoading && items.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>{t('sessions.noSessions')}</Text>
          <Text style={styles.emptySubtitle}>{t('sessions.createFirst')}</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
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
  errorBanner: {
    backgroundColor: colors.error,
    padding: spacing.md,
  },
  errorText: {
    fontSize: typography.fontSize.base,
    color: colors.white,
    textAlign: 'center',
  },
});
