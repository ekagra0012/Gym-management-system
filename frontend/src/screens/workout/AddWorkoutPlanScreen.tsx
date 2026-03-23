import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createWorkoutPlan } from '../../api/workoutPlans.api';

const colors = {
  primary: '#2E7D32',
  primaryLight: '#4CAF50',
  accent: '#FF6B35',
  danger: '#F44336',
  white: '#FFFFFF',
  background: '#F5F5F5',
  border: '#E0E0E0',
  text: '#212121',
  textLight: '#757575',
};

const MAX_WORDS = 50;

interface Exercise {
  name: string;
  sets: string;
  reps: string;
}

interface Day {
  label: string;
  exercises: Exercise[];
}

const handleError = (error: any) => {
  let title = 'Error';
  let message = 'Cannot connect to server.';
  if (error.response?.status === 400) {
    title = 'Validation Error';
    const errors = error.response.data?.errors;
    message = Array.isArray(errors) ? errors.join('\n') : 'Invalid input';
  } else if (error.response?.status === 401) {
    title = 'Session Expired';
    message = 'Please log in again.';
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

export default function AddWorkoutPlanScreen() {
  const navigation = useNavigation();
  const [planName, setPlanName] = useState('');
  const [days, setDays] = useState<Day[]>([{ label: 'Chest', exercises: [] }]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const wordCount = notes.trim() === '' ? 0 : notes.trim().split(/\s+/).length;
  const wordsRemaining = MAX_WORDS - wordCount;
  const isOverLimit = wordsRemaining < 0;

  const addDay = () => {
    setDays([...days, { label: '', exercises: [] }]);
  };

  const removeDay = (index: number) => {
    setDays(days.filter((_, i) => i !== index));
  };

  const updateDayLabel = (index: number, label: string) => {
    const updated = [...days];
    updated[index].label = label;
    setDays(updated);
  };

  const addExercise = (dayIndex: number) => {
    const updated = [...days];
    updated[dayIndex].exercises.push({ name: '', sets: '', reps: '' });
    setDays(updated);
  };

  const updateExercise = (dayIndex: number, exIndex: number, field: keyof Exercise, value: string) => {
    const updated = [...days];
    updated[dayIndex].exercises[exIndex][field] = value;
    setDays(updated);
  };

  const removeExercise = (dayIndex: number, exIndex: number) => {
    const updated = [...days];
    updated[dayIndex].exercises = updated[dayIndex].exercises.filter((_, i) => i !== exIndex);
    setDays(updated);
  };

  const handleSubmit = async () => {
    if (!planName.trim()) {
      if (Platform.OS === 'web') window.alert('Error\nPlease enter a plan name.');
      else Alert.alert('Error', 'Please enter a plan name.');
      return;
    }
    if (isOverLimit) {
      if (Platform.OS === 'web') window.alert('Error\nNotes exceed 50 words. Please shorten them.');
      else Alert.alert('Error', 'Notes exceed 50 words. Please shorten them.');
      return;
    }

    const payload = {
      name: planName.trim(),
      totalDays: days.length,
      days: days.map((day, i) => ({
        dayNumber: i + 1,
        label: day.label || `Day ${i + 1}`,
        exercises: day.exercises.map((ex) => ({
          name: ex.name,
          sets: parseInt(ex.sets) || 0,
          reps: ex.reps,
        })),
      })),
      notes: notes.trim() || undefined,
    };

    setLoading(true);
    try {
      await createWorkoutPlan(payload);
      if (Platform.OS === 'web') {
        window.alert('Success\nWorkout plan created!');
        navigation.goBack();
      } else {
        Alert.alert('Success', 'Workout plan created!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Workout Plan</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Plan name */}
          <TextInput
            style={styles.planNameInput}
            placeholder="Plan name (e.g. Beginner's Workout – 3 Days)"
            placeholderTextColor={colors.textLight}
            value={planName}
            onChangeText={setPlanName}
          />

          {/* Days */}
          {days.map((day, dayIndex) => (
            <View key={dayIndex} style={styles.dayCard}>
              <View style={styles.dayHeader}>
                <View style={styles.dayPill}>
                  <Text style={styles.dayPillText}>Day {dayIndex + 1}</Text>
                </View>
                <TextInput
                  style={styles.dayLabelInput}
                  placeholder="Day label (e.g. Chest)"
                  placeholderTextColor={colors.textLight}
                  value={day.label}
                  onChangeText={(v) => updateDayLabel(dayIndex, v)}
                />
                <TouchableOpacity onPress={() => removeDay(dayIndex)} style={styles.iconBtn}>
                  <Text style={styles.dangerIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>

              {/* Exercise header */}
              {day.exercises.length > 0 && (
                <View style={styles.exHeader}>
                  <Text style={[styles.exHeaderText, { flex: 1 }]}>Exercise</Text>
                  <Text style={styles.exHeaderText}>Sets</Text>
                  <Text style={styles.exHeaderText}>Reps</Text>
                  <View style={{ width: 30 }} />
                </View>
              )}

              {/* Exercises */}
              {day.exercises.map((ex, exIndex) => (
                <View key={exIndex} style={styles.exerciseRow}>
                  <TextInput
                    style={[styles.exInput, { flex: 1 }]}
                    placeholder="Exercise"
                    placeholderTextColor={colors.textLight}
                    value={ex.name}
                    onChangeText={(v) => updateExercise(dayIndex, exIndex, 'name', v)}
                  />
                  <TextInput
                    style={[styles.exInput, styles.exSmall]}
                    placeholder="Sets"
                    placeholderTextColor={colors.textLight}
                    value={ex.sets}
                    onChangeText={(v) => updateExercise(dayIndex, exIndex, 'sets', v)}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[styles.exInput, styles.exSmall]}
                    placeholder="Reps"
                    placeholderTextColor={colors.textLight}
                    value={ex.reps}
                    onChangeText={(v) => updateExercise(dayIndex, exIndex, 'reps', v)}
                  />
                  <TouchableOpacity onPress={() => removeExercise(dayIndex, exIndex)} style={styles.iconBtn}>
                    <Text style={styles.dangerIcon}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              ))}

              {/* Add exercise button */}
              <TouchableOpacity style={styles.addExBtn} onPress={() => addExercise(dayIndex)}>
                <Text style={styles.addExText}>+ Add Exercise</Text>
              </TouchableOpacity>
            </View>
          ))}

          {/* Add Day */}
          <TouchableOpacity style={styles.addDayBtn} onPress={addDay}>
            <View style={styles.addDayCircle}>
              <Text style={styles.addDayCircleText}>+</Text>
            </View>
            <Text style={styles.addDayText}>Add Day</Text>
          </TouchableOpacity>

          {/* Notes */}
          <View style={styles.notesContainer}>
            <TextInput
              style={styles.notesInput}
              placeholder="Notes (max 50 words)..."
              placeholderTextColor={colors.textLight}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <Text style={[styles.wordCounter, isOverLimit && styles.wordCounterOver]}>
              {isOverLimit ? `${Math.abs(wordsRemaining)} words over limit` : `${wordsRemaining} words remaining`}
            </Text>
          </View>

          {/* Submit */}
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 20 }} />
          ) : (
            <TouchableOpacity
              style={[styles.submitBtn, isOverLimit && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={isOverLimit}
            >
              <Text style={styles.submitBtnText}>Submit</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 16,
    paddingBottom: 18,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: { width: 40, alignItems: 'center' },
  backText: { color: colors.white, fontSize: 22 },
  headerTitle: { color: colors.white, fontSize: 18, fontWeight: '700' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  planNameInput: {
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  dayCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  dayHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  dayPill: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  dayPillText: { color: colors.white, fontSize: 13, fontWeight: '700' },
  dayLabelInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 4,
  },
  iconBtn: { padding: 4 },
  dangerIcon: { fontSize: 18, color: colors.danger },
  exHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 6,
    gap: 6,
  },
  exHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textLight,
    width: 50,
    textAlign: 'center',
  },
  exerciseRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 },
  exInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.text,
    backgroundColor: colors.background,
  },
  exSmall: { width: 50, textAlign: 'center' },
  addExBtn: {
    paddingVertical: 10,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 8,
  },
  addExText: { color: colors.primary, fontSize: 14, fontWeight: '600' },
  addDayBtn: { alignItems: 'center', marginVertical: 12, flexDirection: 'row', justifyContent: 'center', gap: 8 },
  addDayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addDayCircleText: { color: colors.white, fontSize: 22, fontWeight: '300' },
  addDayText: { fontSize: 15, color: colors.primary, fontWeight: '600' },
  notesContainer: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  notesInput: { fontSize: 14, color: colors.text, minHeight: 80 },
  wordCounter: { textAlign: 'right', fontSize: 12, color: colors.accent, marginTop: 6, fontWeight: '600' },
  wordCounterOver: { color: colors.danger },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitBtnDisabled: { backgroundColor: '#BDBDBD' },
  submitBtnText: { color: colors.white, fontSize: 16, fontWeight: '700' },
});
