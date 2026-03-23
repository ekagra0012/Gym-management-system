import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { registerUser, loginUser } from '../../api/auth.api';

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

const handleError = (error: any) => {
  let title = 'Error';
  let message = 'Something went wrong';
  if (error.response?.status === 400) {
    title = 'Validation Error';
    const errors = error.response.data?.errors;
    message = Array.isArray(errors) ? errors.join('\n') : 'Invalid input';
  } else if (error.response?.status === 401) {
    title = 'Session Expired';
    message = 'Please log in again.';
  } else if (error.response?.status === 403) {
    title = 'Forbidden';
    message = "You don't have permission to do this.";
  } else if (error.response?.status === 409) {
    title = 'Conflict';
    message = 'This slot is already booked.';
  } else if (error.response?.status === 500) {
    title = 'Server Error';
    message = 'Something went wrong. Please try again.';
  } else {
    title = 'Network Error';
    message = 'Cannot connect to server. Make sure the backend is running on localhost:3000.';
  }

  if (Platform.OS === 'web') {
    window.alert(`${title}\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export default function SignUpScreen() {
  const { login } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'PT' | 'OWNER'>('PT');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password) {
      if (Platform.OS === 'web') window.alert('Error\nPlease fill in all fields.');
      else Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const res = await registerUser({ email, password, role });
      const data = res.data.data || res.data;
      const tokenVal = data.access_token || data.token;
      await login(tokenVal, data.user);
      setModalVisible(false);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      if (Platform.OS === 'web') window.alert('Error\nPlease enter email and password.');
      else Alert.alert('Error', 'Please enter email and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await loginUser({ email, password });
      const data = res.data.data || res.data;
      const tokenVal = data.access_token || data.token;
      await login(tokenVal, data.user);
      setModalVisible(false);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Logo / Brand */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>WV</Text>
          </View>
          <Text style={styles.brandName}>WellVantage</Text>
        </View>

        <Text style={styles.heading}>
          Welcome! Manage, Track and Grow your Gym with WellVantage.
        </Text>

        <Text style={styles.subheading}>
          Your all-in-one gym management platform for PTs and owners.
        </Text>

        <TouchableOpacity
          style={styles.googleButton}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.googleG}>✉</Text>
          <Text style={styles.googleButtonText}>Continue with Email</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </Text>
      </View>

      {/* Auth Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContainer}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Get Started</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>


              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor={colors.textLight}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={colors.textLight}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              {/* Role Toggle */}
              <Text style={styles.roleLabel}>I am a:</Text>
              <View style={styles.roleToggle}>
                <TouchableOpacity
                  style={[styles.roleButton, role === 'PT' && styles.roleButtonActive]}
                  onPress={() => setRole('PT')}
                >
                  <Text style={[styles.roleButtonText, role === 'PT' && styles.roleButtonTextActive]}>
                    PT
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.roleButton, role === 'OWNER' && styles.roleButtonActive]}
                  onPress={() => setRole('OWNER')}
                >
                  <Text style={[styles.roleButtonText, role === 'OWNER' && styles.roleButtonTextActive]}>
                    Owner
                  </Text>
                </TouchableOpacity>
              </View>

              {loading ? (
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
              ) : (
                <View style={styles.actionButtons}>
                  <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
                    <Text style={styles.registerButtonText}>Register</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                    <Text style={styles.loginButtonText}>Login</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoText: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '800',
  },
  brandName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 1,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 12,
  },
  subheading: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 20,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 50,
    paddingVertical: 14,
    paddingHorizontal: 28,
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 20,
    width: '100%',
    justifyContent: 'center',
  },
  googleG: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4285F4',
    marginRight: 10,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  footerText: {
    fontSize: 11,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 16,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 28,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  closeButton: {
    fontSize: 18,
    color: colors.textLight,
    padding: 4,
  },
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
  roleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textLight,
    marginBottom: 10,
  },
  roleToggle: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  roleButtonActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  roleButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textLight,
  },
  roleButtonTextActive: {
    color: colors.white,
  },
  actionButtons: {
    gap: 12,
  },
  registerButton: {
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
  registerButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  loginButton: {
    backgroundColor: colors.background,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  loginButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
});
