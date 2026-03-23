import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getAvailability, deleteAvailability } from '../../api/availability.api';
import { getClients } from '../../api/clients.api';
import { createBooking } from '../../api/bookings.api';

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

const DAYS_OF_WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const handleError = (error: any) => {
  let title = 'Error';
  let message = 'Cannot connect to server.';
  if (error.response?.status === 409) {
    title = 'Conflict';
    message = 'This slot is already booked.';
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

export default function BookSlotsScreen() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(formatDate(today.getFullYear(), today.getMonth(), today.getDate()));
  const [slots, setSlots] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingModal, setBookingModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [booking, setBooking] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [avRes, clRes] = await Promise.all([getAvailability(), getClients()]);
      const avData = avRes.data.data || avRes.data;
      const clData = clRes.data.data || clRes.data;
      setSlots(Array.isArray(avData) ? avData : []);
      setClients(Array.isArray(clData) ? clData : clData?.data || []);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredSlots = slots.filter((s) => {
    const slotDate = s.date?.split('T')[0] || s.date;
    return slotDate === selectedDate;
  });

  const handleDeleteSlot = (id: string) => {
    if (Platform.OS === 'web') {
      if (window.confirm('Remove this availability slot?')) {
        deleteAvailability(id).then(fetchData).catch(handleError);
      }
      return;
    }
    Alert.alert('Delete Slot', 'Remove this availability slot?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAvailability(id);
            fetchData();
          } catch (error) {
            handleError(error);
          }
        },
      },
    ]);
  };

  const handleBook = async () => {
    if (!selectedClientId) {
      if (Platform.OS === 'web') window.alert('Error\nPlease select a client.');
      else Alert.alert('Error', 'Please select a client.');
      return;
    }
    setBooking(true);
    try {
      const bookingRes = await createBooking({ availabilityId: selectedSlot.id, clientId: selectedClientId });
      // Optimistically update local slot state so UI refreshes immediately
      setSlots((prev) =>
        prev.map((s) =>
          s.id === selectedSlot.id
            ? { ...s, isBooked: true, booking: bookingRes.data?.data || bookingRes.data }
            : s
        )
      );
      if (Platform.OS === 'web') window.alert('Success\nSlot booked!');
      else Alert.alert('Success', 'Slot booked!');
      setBookingModal(false);
      setSelectedClientId('');
      setSelectedSlot(null);
    } catch (error) {
      handleError(error);
    } finally {
      setBooking(false);
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

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const renderCalendar = () => {
    const cells = [];
    for (let i = 0; i < firstDay; i++) {
      cells.push(<View key={`e-${i}`} style={styles.dayCell} />);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = formatDate(viewYear, viewMonth, d);
      const isSelected = dateStr === selectedDate;
      const hasSlot = slots.some((s) => (s.date?.split('T')[0] || s.date) === dateStr);
      cells.push(
        <TouchableOpacity key={d} style={[styles.dayCell, isSelected && styles.dayCellSelected]} onPress={() => setSelectedDate(dateStr)}>
          <Text style={[styles.dayCellText, isSelected && styles.dayCellTextSelected]}>{d}</Text>
          {hasSlot && <View style={[styles.dot, isSelected && styles.dotSelected]} />}
        </TouchableOpacity>
      );
    }
    return cells;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Book Client Slots</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Calendar */}
        <View style={styles.calendarContainer}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={prevMonth} style={styles.navBtn}><Text style={styles.navText}>‹</Text></TouchableOpacity>
            <Text style={styles.monthTitle}>{MONTHS[viewMonth]} {viewYear}</Text>
            <TouchableOpacity onPress={nextMonth} style={styles.navBtn}><Text style={styles.navText}>›</Text></TouchableOpacity>
          </View>
          <View style={styles.weekRow}>
            {DAYS_OF_WEEK.map((d, i) => (
              <View key={i} style={styles.weekDayCell}><Text style={styles.weekDayText}>{d}</Text></View>
            ))}
          </View>
          <View style={styles.daysGrid}>{renderCalendar()}</View>
        </View>

        {/* Slots list */}
        <Text style={styles.slotsHeading}>Available Slots:</Text>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : filteredSlots.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No slots for this date</Text>
          </View>
        ) : (
          filteredSlots.map((slot) => {
            const isBooked = slot.isBooked || slot.booking;
            return (
              <View key={slot.id} style={styles.slotCard}>
                <TouchableOpacity
                  style={styles.slotLeft}
                  onPress={() => {
                    if (!isBooked) {
                      setSelectedSlot(slot);
                      setSelectedClientId(clients[0]?.id || '');
                      setBookingModal(true);
                    }
                  }}
                  disabled={!!isBooked}
                >
                  <View style={styles.slotTimeBox}>
                    <Text style={styles.slotTime}>
                      {slot.startTime} – {slot.endTime}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, isBooked ? styles.statusBooked : styles.statusOpen]}>
                    <Text style={[styles.statusText, isBooked ? styles.statusTextBooked : styles.statusTextOpen]}>
                      {isBooked ? 'Booked' : 'Open'}
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteSlot(slot.id)} style={styles.deleteBtn}>
                  <Text style={styles.deleteIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Booking Modal */}
      <Modal visible={bookingModal} animationType="slide" transparent onRequestClose={() => setBookingModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Book This Slot</Text>
              <TouchableOpacity onPress={() => setBookingModal(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            {selectedSlot && (
              <Text style={styles.slotInfo}>{selectedSlot.startTime} – {selectedSlot.endTime}</Text>
            )}
            <Text style={styles.pickerLabel}>Select Client:</Text>
            <View style={styles.pickerWrapper}>
              {Platform.OS === 'web' ? (
                <select
                  value={selectedClientId}
                  onChange={(e: any) => setSelectedClientId(e.target.value)}
                  style={{ height: '50px' as any, width: '100%', fontSize: '15px' as any, padding: '8px' as any, border: 'none', backgroundColor: 'transparent' }}
                >
                  <option value="" disabled>Select client...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim()}</option>
                  ))}
                </select>
              ) : (
                <Picker
                  selectedValue={selectedClientId}
                  onValueChange={(val) => setSelectedClientId(val)}
                  style={styles.picker}
                >
                  {clients.map((c) => (
                    <Picker.Item key={c.id} label={c.name} value={c.id} />
                  ))}
                </Picker>
              )}
            </View>
            {booking ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 16 }} />
            ) : (
              <TouchableOpacity style={styles.bookBtn} onPress={handleBook}>
                <Text style={styles.bookBtnText}>Book</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
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
  scrollContent: { padding: 16, paddingBottom: 40 },
  calendarContainer: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  calendarHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  navBtn: { padding: 8 },
  navText: { fontSize: 22, color: colors.primary, fontWeight: '700' },
  monthTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  weekRow: { flexDirection: 'row', marginBottom: 6 },
  weekDayCell: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  weekDayText: { fontSize: 12, fontWeight: '600', color: colors.textLight },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.28%', alignItems: 'center', paddingVertical: 8, borderRadius: 50 },
  dayCellSelected: { backgroundColor: colors.primary },
  dayCellText: { fontSize: 14, color: colors.text },
  dayCellTextSelected: { color: colors.white, fontWeight: '700' },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.primary, marginTop: 2 },
  dotSelected: { backgroundColor: colors.white },
  slotsHeading: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 12 },
  emptyContainer: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 16, color: colors.textLight },
  slotCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  slotLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  slotTimeBox: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  slotTime: { fontSize: 13, fontWeight: '600', color: colors.primary },
  statusBadge: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  statusOpen: { backgroundColor: '#E8F5E9' },
  statusBooked: { backgroundColor: '#F5F5F5' },
  statusText: { fontSize: 12, fontWeight: '700' },
  statusTextOpen: { color: colors.primary },
  statusTextBooked: { color: colors.textLight },
  deleteBtn: { marginLeft: 8, padding: 6 },
  deleteIcon: { fontSize: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 28,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  closeBtn: { fontSize: 18, color: colors.textLight },
  slotInfo: { fontSize: 15, color: colors.textLight, marginBottom: 16 },
  pickerLabel: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 },
  pickerWrapper: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: colors.background,
  },
  picker: { height: 50 },
  bookBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  bookBtnText: { color: colors.white, fontSize: 16, fontWeight: '700' },
});
