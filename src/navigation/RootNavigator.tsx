import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoadingView from '../components/LoadingView';
import { useAuth } from '../context/AuthContext';
import { ChatDataProvider } from '../context/ChatDataContext';
import ChatScreen from '../screens/ChatScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import colors from '../theme/colors';
import MainTabs from './MainTabs';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { user, initializing } = useAuth();
  if (initializing) {
    return <LoadingView />;
  }
  return (
    <ChatDataProvider key={user?.uid ?? 'guest'}>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        {user ? (
          <Stack.Group>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="Chat" component={ChatScreen} options={{ animation: 'slide_from_right' }} />
          </Stack.Group>
        ) : (
          <Stack.Group screenOptions={{ contentStyle: { backgroundColor: colors.surface } }}>
            <Stack.Screen name="Login" component={LoginScreen} options={{ animationTypeForReplace: 'pop' }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ animation: 'slide_from_right' }} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </ChatDataProvider>
  );
}
