import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Bell, MessageCircle, Settings, Users } from 'lucide-react-native';

import { useChatData } from '../context/ChatDataContext';
import ContactsScreen from '../screens/ContactsScreen';
import HomeScreen from '../screens/HomeScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import colors from '../theme/colors';
import { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

interface TabIconProps {
  color: string;
  size: number;
}

const HomeIcon = ({ color, size }: TabIconProps) => <MessageCircle color={color} size={size - 2} strokeWidth={2} />;
const ContactsIcon = ({ color, size }: TabIconProps) => <Users color={color} size={size - 2} strokeWidth={2} />;
const NotificationsIcon = ({ color, size }: TabIconProps) => <Bell color={color} size={size - 2} strokeWidth={2} />;
const SettingsIcon = ({ color, size }: TabIconProps) => <Settings color={color} size={size - 2} strokeWidth={2} />;

function badgeValue(count: number) {
  if (count <= 0) {
    return undefined;
  }
  return count > 99 ? '99+' : count;
}

export default function MainTabs() {
  const { totalUnread, unreadNotifications } = useChatData();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarBadgeStyle: { backgroundColor: colors.danger, fontSize: 10, fontWeight: '700' },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Tin nhắn',
          tabBarButtonTestID: 'tab-home',
          tabBarBadge: badgeValue(totalUnread),
          tabBarIcon: HomeIcon,
        }}
      />
      <Tab.Screen
        name="Contacts"
        component={ContactsScreen}
        options={{
          title: 'Danh bạ',
          tabBarButtonTestID: 'tab-contacts',
          tabBarIcon: ContactsIcon,
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: 'Thông báo',
          tabBarButtonTestID: 'tab-notifications',
          tabBarBadge: badgeValue(unreadNotifications),
          tabBarIcon: NotificationsIcon,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Cài đặt',
          tabBarButtonTestID: 'tab-settings',
          tabBarIcon: SettingsIcon,
        }}
      />
    </Tab.Navigator>
  );
}
