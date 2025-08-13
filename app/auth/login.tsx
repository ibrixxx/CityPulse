import { biometricLoginFromSecureLink, loginUser } from '@/common/stores/userStore';
import * as LocalAuthentication from 'expo-local-authentication';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onLogin = async () => {
    const ok = await loginUser(email.trim(), password);
    if (ok) {
      router.replace('/(tabs)');
    } else {
      // basic inline error UX
      alert('Invalid email or password');
    }
  };
  const onGuest = () => {
    router.replace('/(tabs)');
  };
  const goToRegister = () => router.push('/auth/signup');
  const onBiometric = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const supported = await LocalAuthentication.supportedAuthenticationTypesAsync();
    if (!hasHardware || supported.length === 0) {
      alert('Biometric auth not available');
      return;
    }
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!enrolled) {
      alert('No biometrics enrolled');
      return;
    }
    const res = await LocalAuthentication.authenticateAsync({ promptMessage: 'Login with biometrics', cancelLabel: 'Cancel' });
    if (res.success) {
      const ok = await biometricLoginFromSecureLink();
      if (!ok) {
        alert('No account linked to biometrics. Please link in Profile first.');
        return;
      }
      router.replace('/(tabs)');
    } else if (res.error) {
      alert('Authentication canceled');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text variant="headlineMedium" style={{ marginBottom: 12 }}>Login</Text>
      <TextInput mode="outlined" label="Email" value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput mode="outlined" label="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      <Button mode="contained" onPress={onLogin}>
        Continue
      </Button>
      <Button style={{ marginTop: 8 }} mode="outlined" onPress={onBiometric}>
        Use biometrics
      </Button>
      <Button style={{ marginTop: 8 }} mode="outlined" onPress={goToRegister}>
        Create new account
      </Button>
      <Button style={{ marginTop: 8 }} mode="text" onPress={onGuest}>
        Continue as Guest
      </Button>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  input: { marginBottom: 12 },
});


