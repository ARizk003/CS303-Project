import { useState } from 'react';
import {
  Modal, View, Text, TextInput,
  TouchableOpacity, StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import axios from 'axios';

const BASE_URL = 'http://192.168.1.8:5000';

export default function OtpModal({ visible, onClose, onVerified }) {
  const [step, setStep] = useState('email'); 
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!email) return Alert.alert('Error', 'Please enter your email');
    setLoading(true);
    try {
      await axios.post(`${BASE_URL}/api/auth/send-otp`, { email });
      setStep('otp');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.msg || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return Alert.alert('Error', 'Please enter the OTP');
    setLoading(true);
    try {
      await axios.post(`${BASE_URL}/api/auth/verify-otp`, { email, otp });
      onVerified(email);
      handleClose();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.msg || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('email');
    setEmail('');
    setOtp('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>

          <Text style={styles.title}>
            {step === 'email' ? 'Verify with Email' : 'Enter OTP Code'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 'email'
              ? 'We\'ll send a 6-digit code to your email'
              : `Code sent to ${email}`}
          </Text>

          {step === 'email' ? (
            <>
              <Text style={styles.label}>EMAIL ADDRESS</Text>
              <TextInput
                style={styles.input}
                placeholder="name@example.com"
                placeholderTextColor="#aaa"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoFocus
              />
              <TouchableOpacity style={styles.btn} onPress={handleSendOtp} disabled={loading}>
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.btnText}>Send Code</Text>}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.label}>6-DIGIT CODE</Text>
              <TextInput
                style={[styles.input, styles.otpInput]}
                placeholder="• • • • • •"
                placeholderTextColor="#aaa"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
              />
              <TouchableOpacity style={styles.btn} onPress={handleVerifyOtp} disabled={loading}>
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.btnText}>Verify</Text>}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setStep('email')} style={styles.resend}>
                <Text style={styles.resendText}>Resend code</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity onPress={handleClose} style={styles.cancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fdfaf6',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 28, paddingBottom: 40,
  },
  title: { fontSize: 22, fontWeight: '900', color: '#2c3e50', marginBottom: 6 },
  subtitle: { fontSize: 13, color: '#8e7f68', marginBottom: 24 },
  label: { fontSize: 11, fontWeight: '800', color: '#8e7f68', letterSpacing: 1.5, marginBottom: 8 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 50,
    paddingHorizontal: 20, paddingVertical: 14,
    fontSize: 15, color: '#2c3e50', marginBottom: 18,
    borderWidth: 1, borderColor: '#e0d8cc',
  },
  otpInput: { textAlign: 'center', fontSize: 22, letterSpacing: 8, fontWeight: '700' },
  btn: {
    backgroundColor: '#C5A059', borderRadius: 50,
    paddingVertical: 15, alignItems: 'center', marginBottom: 12,
  },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  resend: { alignItems: 'center', marginBottom: 8 },
  resendText: { color: '#C5A059', fontWeight: '600', fontSize: 14 },
  cancel: { alignItems: 'center', marginTop: 4 },
  cancelText: { color: '#aaa', fontSize: 14 },
});
