import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList, Routes } from './types';
import { t } from '../i18n';

import { HomeScreen } from '../screens/Home/HomeScreen';
import { CameraScreen } from '../screens/Camera/CameraScreen';
import { SessionListScreen } from '../screens/Session/SessionListScreen';
import { SessionDetailScreen } from '../screens/Session/SessionDetailScreen';
import ReviewScreen from '../screens/Review/ReviewScreen';
import { PermissionDeniedScreen } from '../screens/PermissionDenied/PermissionDeniedScreen';

const Stack = createStackNavigator<RootStackParamList>();

/**
 * Main app navigator
 */
export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={Routes.Home}
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1a1a1a',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}>
        <Stack.Screen
          name={Routes.Home}
          component={HomeScreen}
          options={{ title: 'Call The Line' }}
        />
        <Stack.Screen
          name={Routes.Camera}
          component={CameraScreen}
          options={{ title: 'Camera', headerShown: false }}
        />
        <Stack.Screen
          name={Routes.SessionList}
          component={SessionListScreen}
          options={{ title: 'Sessions' }}
        />
        <Stack.Screen
          name={Routes.SessionDetail}
          component={SessionDetailScreen}
          options={{ title: 'Session Details' }}
        />
        <Stack.Screen name={Routes.Review} component={ReviewScreen} options={{ title: 'Review' }} />
        <Stack.Screen
          name={Routes.PermissionDenied}
          component={PermissionDeniedScreen}
          options={{ title: t('navigation.permissionDenied') }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
