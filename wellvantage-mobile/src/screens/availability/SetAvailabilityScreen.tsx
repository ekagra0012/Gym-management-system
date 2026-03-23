import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  ScrollView,
  Switch,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { createAvailability } from '../../api/availability.api';

const colors = {
  primary: '#2E7D32',
  primaryLight: '#4CAF50',
  white: '#FFFFFF',
  background: '#F5F5F5',
  border: '#E0E0E0',
  text: '#212121',
  textLight: '#757575',
  selectedDay: '#2E7D32',
};

const DAYS_OF_WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

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

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatDate(year: number, month: number, day: number) {
  const mm = String(month + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

export default function SetAvailabilityScreen() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [sessionName, setSessionName] = useState('');
  const [isRepeat, setIsRepeat] = useState(false);
  const [loading, setLoading] = useState(false);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const toggleDate = (dateStr: string) => {
    if (!isRepeat) {
      setSelectedDates([dateStr]);
    } else {
      setSelectedDates((prev) =>
        prev.includes(dateStr) ? prev.filter((d) => d !== dateStr) : [...prev, dateStr]
      );
    }
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const handleCreate = async () => {
    if (selectedDates.length === 0) { 
      if (Platform.OS === 'web') window.alert('Error\nPlease select at least one date.');
      else Alert.alert('Error', 'Please select at least one date.'); 
      return; 
    }
    if (!startTime.trim() || !endTime.trim()) { 
      if (Platform.OS === 'web') window.alert('Error\nPlease enter start and end time.');
      else Alert.alert('Error', 'Please enter start and end time.'); 
      return; 
    }

    const primaryDate = selectedDates[0];
    const payload = {
      date: primaryDate,
      startTime: startTime.trim(),
      endTime: endTime.trim(),
      sessionName: sessionName.trim() || 'Session',
      isRepeat,
      repeatDates: isRepeat ? selectedDates : [],
    };

    console.log('[Availability] Submitting payload:', JSON.stringify(payload));
    setLoading(true);
    try {
      await createAvailability(payload);
      if (Platform.OS === 'web') window.alert('Success\nAvailability created!');
      else Alert.alert('Success', 'Availability created!');
      setSelectedDates([]);
      setStartTime('');
      setEndTime('');
      setSessionName('');
      setIsRepeat(false);
    } catch (error: any) {
      console.log('[Availability] Error:', error?.response?.status, JSON.stringify(error?.response?.data));
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const renderCalendar = () => {
    const cells = [];
    for (let i = 0; i < firstDay; i++) {
      cells.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = formatDate(viewYear, viewMonth, d);
      const isSelected = selectedDates.includes(dateStr);
      cells.push(
        <TouchableOpacity
          key={d}
          style={[styles.dayCell, isSelected && styles.dayCellSelected]}
          onPress={() => toggleDate(dateStr)}
        >
          <Text style={[styles.dayCellText, isSelected && styles.dayCellTextSelected]}>{d}</Text>
        </TouchableOpacity>
      );
    }
    return cells;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Set Availability</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Start Time *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 11:30 AM"
          placeholderTextColor={colors.textLight}
          value={startTime}
          onChangeText={setStartTime}
        />

        <Text style={styles.label}>End Time *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 11:45 AM"
          placeholderTextColor={colors.textLight}
          value={endTime}
          onChangeText={setEndTime}
        />

        {/* Repeat Sessions */}
        <View style={styles.repeatRow}>
          <Text style={styles.repeatLabel}>Repeat Sessions</Text>
          <Switch
            value={isRepeat}
            onValueChange={(val) => {
              setIsRepeat(val);
              if (!val && selectedDates.length > 1) {
                setSelectedDates([selectedDates[0]]);
              }
            }}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={isRepeat ? colors.white : colors.white}
          />
        </View>

        <Text style={styles.repeatHint}>
          {isRepeat ? 'Tap multiple dates to repeat sessions' : 'Only 1 date can be selected'}
        </Text>

        {/* Calendar */}
        <View style={styles.calendarContainer}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
              <Text style={styles.navBtnText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.monthTitle}>{MONTHS[viewMonth]} {viewYear}</Text>
            <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
              <Text style={styles.navBtnText}>›</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.weekRow}>
            {DAYS_OF_WEEK.map((d, i) => (
              <View key={i} style={styles.weekDayCell}>
                <Text style={styles.weekDayText}>{d}</Text>
              </View>
            ))}
          </View>
          <View style={styles.daysGrid}>{renderCalendar()}</View>
        </View>

        {/* Session Name */}
        <Text style={styles.label}>Session Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. PT, Morning Session"
          placeholderTextColor={colors.textLight}
          value={sessionName}
          onChangeText={setSessionName}
        />

        {/* Create Button */}
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 20 }} />
        ) : (
          <TouchableOpacity style={styles.createBtn} onPress={handleCreate}>
            <Text style={styles.createBtnText}>Create</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 16,
    paddingBottom: 18,
    paddingHorizontal: 20,
  },
  headerTitle: { color: colors.white, fontSize: 20, fontWeight: '700' },
  scrollContent: { padding: 16, paddingBottom: 140 },
  label: { fontSize: 13, fontWeight: '600', color: colors.textLight, marginBottom: 6, marginTop: 4 },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.text,
    marginBottom: 14,
  },
  repeatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  repeatLabel: { fontSize: 16, fontWeight: '600', color: colors.text },
  repeatHint: { fontSize: 12, color: colors.textLight, marginBottom: 14, marginLeft: 4 },
  calendarContainer: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  calendarHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  navBtn: { padding: 8 },
  navBtnText: { fontSize: 22, color: colors.primary, fontWeight: '700' },
  monthTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  weekRow: { flexDirection: 'row', marginBottom: 6 },
  weekDayCell: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  weekDayText: { fontSize: 12, fontWeight: '600', color: colors.textLight },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.28%', alignItems: 'center', paddingVertical: 8, borderRadius: 50 },
  dayCellSelected: { backgroundColor: colors.selectedDay },
  dayCellText: { fontSize: 14, color: colors.text },
  dayCellTextSelected: { color: colors.white, fontWeight: '700' },
  createBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginTop: 8,
  },
  createBtnText: { color: colors.white, fontSize: 16, fontWeight: '700' },
});
