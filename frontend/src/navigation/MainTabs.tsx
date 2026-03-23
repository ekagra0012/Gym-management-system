import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, Platform } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import WorkoutListScreen from '../screens/workout/WorkoutListScreen';
import AddWorkoutPlanScreen from '../screens/workout/AddWorkoutPlanScreen';
import ClientsScreen from '../screens/clients/ClientsScreen';
import SetAvailabilityScreen from '../screens/availability/SetAvailabilityScreen';
import BookSlotsScreen from '../screens/bookings/BookSlotsScreen';
import WebTabNavigator from './WebTabNavigator';

const Tab = createBottomTabNavigator();
const WorkoutStack = createStackNavigator();
const WebRootStack = createStackNavigator();

function WorkoutStackNavigator() {
  return (
    <WorkoutStack.Navigator screenOptions={{ headerShown: false }}>
      <WorkoutStack.Screen name="WorkoutList" component={WorkoutListScreen} />
      <WorkoutStack.Screen name="AddWorkout" component={AddWorkoutPlanScreen} />
    </WorkoutStack.Navigator>
  );
}

function WebRoot() {
  return (
    <WebRootStack.Navigator screenOptions={{ headerShown: false, animationEnabled: false }}>
      <WebRootStack.Screen name="WebTabs" component={WebTabNavigator} />
      <WebRootStack.Screen name="AddWorkout" component={AddWorkoutPlanScreen} />
    </WebRootStack.Navigator>
  );
}

export default function MainTabs() {
  if (Platform.OS === 'web') {
    return <WebRoot />;
  }

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2E7D32',
        tabBarInactiveTintColor: '#757575',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E0E0E0',
          borderTopWidth: 1,
          height: 62,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="WorkoutTab"
        component={WorkoutStackNavigator}
        options={{
          tabBarLabel: 'Workout',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20 }}>{focused ? '💪' : '🏋️'}</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Client"
        component={ClientsScreen}
        options={{
          tabBarLabel: 'Client',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20 }}>{focused ? '👥' : '👤'}</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Availability"
        component={SetAvailabilityScreen}
        options={{
          tabBarLabel: 'Availability',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20 }}>{focused ? '📅' : '🗓️'}</Text>
          ),
        }}
      />
      <Tab.Screen
        name="BookSlots"
        component={BookSlotsScreen}
        options={{
          tabBarLabel: 'Book Slots',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20 }}>{focused ? '🟢' : '⚪'}</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}
