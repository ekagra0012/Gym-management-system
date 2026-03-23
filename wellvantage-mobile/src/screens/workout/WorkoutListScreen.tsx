import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getWorkoutPlans, deleteWorkoutPlan } from '../../api/workoutPlans.api';
import { useAuth } from '../../context/AuthContext';

const colors = {
  primary: '#2E7D32',
  primaryLight: '#4CAF50',
  danger: '#F44336',
  white: '#FFFFFF',
  background: '#F5F5F5',
  border: '#E0E0E0',
  text: '#212121',
  textLight: '#757575',
};

const handleError = (error: any) => {
  let title = 'Error';
  let message = 'Cannot connect to server.';
  if (error.response?.status === 401) {
    title = 'Session Expired';
    message = 'Please log in again.';
  } else if (error.response?.status === 403) {
    title = 'Forbidden';
    message = "You don't have permission to do this.";
  } else if (error.response?.status === 500) {
    title = 'Server Error';
    message = 'Something went wrong. Please try again.';
  }

  if (Platform.OS === 'web') {
    window.alert(`${title}\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export default function WorkoutListScreen() {
  const navigation = useNavigation<any>();
  const { logout } = useAuth();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPlans = useCallback(async () => {
    try {
      const res = await getWorkoutPlans();
      const data = res.data.data || res.data;
      setPlans(Array.isArray(data) ? data : []);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPlans();
    }, [fetchPlans])
  );

  const handleDelete = (id: string, name: string) => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Delete "${name}"? This cannot be undone.`);
      if (confirmed) {
        deleteWorkoutPlan(id).then(fetchPlans).catch(handleError);
      }
      return;
    }
    Alert.alert(
      'Delete Plan',
      `Delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteWorkoutPlan(id);
              fetchPlans();
            } catch (error) {
              handleError(error);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.planItem}>
      <View style={styles.planLeft}>
        <Text style={styles.planName}>{item.name}</Text>
        {item.isPrebuilt && (
          <View style={styles.prebuiltBadge}>
            <Text style={styles.prebuiltText}>Prebuilt</Text>
          </View>
        )}
      </View>
      {!item.isPrebuilt && (
        <TouchableOpacity
          onPress={() => handleDelete(item.id, item.name)}
          style={styles.deleteButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.deleteIcon}>🗑️</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Workout Management</Text>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={plans}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchPlans();
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>💪</Text>
              <Text style={styles.emptyText}>No workout plans yet</Text>
              <Text style={styles.emptySubtext}>Tap + to create your first plan</Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddWorkout')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 16,
    paddingBottom: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  headerTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  logoutText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  planItem: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  planLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  planName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  prebuiltBadge: {
    backgroundColor: '#E8F5E9',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  prebuiltText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  deleteButton: {
    marginLeft: 12,
  },
  deleteIcon: {
    fontSize: 20,
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    color: colors.white,
    fontSize: 30,
    fontWeight: '300',
    lineHeight: 34,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textLight,
  },
});
