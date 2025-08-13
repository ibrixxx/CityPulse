import { userStore } from '@/common/stores/userStore';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function SplashScreen() {
  useEffect(() => {
    const t = setTimeout(() => {
      const authed = userStore.isAuthenticated.get();
      router.replace(authed ? '/(tabs)' : '/auth/login');
    }, 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});


