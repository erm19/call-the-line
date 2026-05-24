import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { createDbClient } from './data/db/client';
import { registerDbClient } from './data/db/register';
import { migrations } from './data/db/migrations/migrations';
import AppNavigator from './presentation/navigation/AppNavigator';

const db = createDbClient();
registerDbClient(db);

const App: React.FC = () => {
  const { success, error } = useMigrations(db, migrations);

  if (error) {
    return (
      <View>
        <Text>Database migration failed: {error.message}</Text>
      </View>
    );
  }

  if (!success) {
    return (
      <View>
        <Text>Initializing database…</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
};

export default App;
