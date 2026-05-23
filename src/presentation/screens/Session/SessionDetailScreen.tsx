import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

type SessionDetailRouteProp = RouteProp<RootStackParamList, 'SessionDetail'>;

interface Props {
  route: SessionDetailRouteProp;
}

/**
 * Session Detail Screen
 * Shows details and clips for a session
 */
const SessionDetailScreen: React.FC<Props> = ({ route }) => {
  const { sessionId } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>Session Detail: {sessionId}</Text>
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
    fontSize: typography.fontSize.xl,
    color: colors.textPrimary,
  },
});

export default SessionDetailScreen;
