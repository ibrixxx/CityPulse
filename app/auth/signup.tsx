import { registerUser } from '@/common/stores/userStore';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('user@example.com');
  const [password, setPassword] = useState('password');

  const onSignup = () => {
    registerUser(name, email, password);
    router.replace('/(tabs)');
  };
  const onGuest = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text variant="headlineMedium" style={{ marginBottom: 12 }}>Sign Up</Text>
      <TextInput mode="outlined" label="Name" value={name} onChangeText={setName} style={styles.input} />
      <TextInput mode="outlined" label="Email" value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput mode="outlined" label="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      <Button mode="contained" onPress={onSignup}>
        Create Account
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


