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
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { getClients, createClient, deleteClient } from '../../api/clients.api';

const colors = {
  primary: '#2E7D32',
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

export default function ClientsScreen() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchClients = useCallback(async () => {
    try {
      const res = await getClients();
      const data = res.data.data || res.data;
      setClients(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleDelete = (id: string, clientName: string) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`Delete "${clientName}"?`)) {
        deleteClient(id).then(fetchClients).catch(handleError);
      }
      return;
    }
    Alert.alert('Delete Client', `Delete "${clientName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteClient(id);
            fetchClients();
          } catch (error) {
            handleError(error);
          }
        },
      },
    ]);
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      if (Platform.OS === 'web') window.alert('Error\nClient name is required.');
      else Alert.alert('Error', 'Client name is required.');
      return;
    }
    setSaving(true);
    const parts = name.trim().split(' ');
    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ') || '-';
    try {
      await createClient({ firstName, lastName, email: email.trim() || undefined, phone: phone.trim() || undefined });
      setModalVisible(false);
      setName(''); setEmail(''); setPhone('');
      fetchClients();
    } catch (error) {
      handleError(error);
    } finally {
      setSaving(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const fullName = item.name || `${item.firstName || ''} ${item.lastName || ''}`.trim();
    return (
    <View style={styles.clientCard}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{fullName?.charAt(0)?.toUpperCase() || '?'}</Text>
      </View>
      <View style={styles.clientInfo}>
        <Text style={styles.clientName}>{fullName}</Text>
        {item.email && <Text style={styles.clientDetail}>{item.email}</Text>}
        {item.phone && <Text style={styles.clientDetail}>{item.phone}</Text>}
      </View>
      <TouchableOpacity onPress={() => handleDelete(item.id, fullName)} style={styles.deleteBtn}>
        <Text style={styles.deleteIcon}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Clients</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <FlatList
          data={clients}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>👥</Text>
              <Text style={styles.emptyText}>No clients yet</Text>
              <Text style={styles.emptySubtext}>Tap "+ Add" to add your first client</Text>
            </View>
          }
        />
      )}

      {/* Add Client Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Client</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            <TextInput style={styles.input} placeholder="Full Name *" placeholderTextColor={colors.textLight} value={name} onChangeText={setName} />
            <TextInput style={styles.input} placeholder="Email (optional)" placeholderTextColor={colors.textLight} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <TextInput style={styles.input} placeholder="Phone (optional)" placeholderTextColor={colors.textLight} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            {saving ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 16 }} />
            ) : (
              <TouchableOpacity style={styles.createBtn} onPress={handleCreate}>
                <Text style={styles.createBtnText}>Create Client</Text>
              </TouchableOpacity>
            )}
          </View>
        </KeyboardAvoidingView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { color: colors.white, fontSize: 20, fontWeight: '700' },
  addBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  addBtnText: { color: colors.white, fontWeight: '700', fontSize: 14 },
  list: { padding: 16, paddingBottom: 100 },
  clientCard: {
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
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { color: colors.white, fontSize: 18, fontWeight: '700' },
  clientInfo: { flex: 1 },
  clientName: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 2 },
  clientDetail: { fontSize: 13, color: colors.textLight },
  deleteBtn: { padding: 6 },
  deleteIcon: { fontSize: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 6 },
  emptySubtext: { fontSize: 14, color: colors.textLight },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 28,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  closeBtn: { fontSize: 18, color: colors.textLight },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.text,
    marginBottom: 14,
    backgroundColor: colors.background,
  },
  createBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  createBtnText: { color: colors.white, fontSize: 16, fontWeight: '700' },
});
