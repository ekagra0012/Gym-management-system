import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ClientsScreen from '../screens/clients/ClientsScreen';
import SetAvailabilityScreen from '../screens/availability/SetAvailabilityScreen';
import BookSlotsScreen from '../screens/bookings/BookSlotsScreen';
import WorkoutListScreen from '../screens/workout/WorkoutListScreen';

type TabKey = 'workout' | 'client' | 'availability' | 'bookslots';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'workout',      label: 'Workout' },
  { key: 'client',       label: 'Client' },
  { key: 'availability', label: 'Availability' },
  { key: 'bookslots',    label: 'Book Slots' },
];

export default function WebTabNavigator() {
  const [activeTab, setActiveTab] = useState<TabKey>('workout');

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
  };

  const renderScreen = () => {
    switch (activeTab) {
      case 'workout': return <WorkoutListScreen />;
      case 'client': return <ClientsScreen />;
      case 'availability': return <SetAvailabilityScreen />;
      case 'bookslots': return <BookSlotsScreen />;
      default: return <WorkoutListScreen />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.screenArea}>
        {renderScreen()}
      </View>

      {/* Custom tab bar — pure TouchableOpacity buttons, always interactive */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => handleTabChange(tab.key)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Navigate to ${tab.label}`}
            >
              <Text style={[styles.tabLabel, isActive && styles.activeLabel]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  screenArea: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    height: 50,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeTab: {
    borderTopWidth: 3,
    borderTopColor: '#2E7D32',
  },
  tabLabel: {
    fontSize: 13,
    color: '#757575',
    fontWeight: '500',
  },
  activeLabel: {
    color: '#2E7D32',
    fontWeight: '700',
  },
});
