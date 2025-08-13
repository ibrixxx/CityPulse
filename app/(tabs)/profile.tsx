import { useFavoriteEvents } from '@/common/hooks/useEvents';
import { enableBiometricsForCurrentUser, getBiometricLinkedEmail, isBiometricsLinkedForCurrentUser, mockLogout, setLanguage, userStore } from '@/common/stores/userStore';
import { observer } from '@legendapp/state/react';
import { FlashList } from '@shopify/flash-list';
import * as LocalAuthentication from 'expo-local-authentication';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, List, SegmentedButtons, Snackbar, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const ProfileTab = observer(function ProfileTabInner() {
  const isAuthed = userStore.isAuthenticated.get();
  const profile = userStore.profile.get();
  const language = userStore.language.get();
  const favs = userStore.favorites.get();
  // Re-observe favorites via extraData to sync
  const extra = favs.join('|');
  const { data: favEvents } = useFavoriteEvents(favs);

  const [bioLinked, setBioLinked] = React.useState(false);
  const [linkedEmail, setLinkedEmail] = React.useState<string | null>(null);
  const [linking, setLinking] = React.useState(false);
  const [snack, setSnack] = React.useState<{ visible: boolean; text: string }>({ visible: false, text: '' });
  React.useEffect(() => {
    (async () => {
      const linked = await isBiometricsLinkedForCurrentUser();
      setBioLinked(linked);
      setLinkedEmail(linked ? await getBiometricLinkedEmail() : null);
    })();
  }, [isAuthed, profile?.email]);

  return (
    <SafeAreaView style={styles.container}>
      <Text variant="headlineMedium" style={{ marginBottom: 12 }}>
        {isAuthed ? `Welcome, ${profile?.name || profile?.email || 'User'}` : 'Guest'}
      </Text>
      <SegmentedButtons
        value={language}
        onValueChange={(v) => setLanguage(v as 'en' | 'ar')}
        buttons={[{ value: 'en', label: 'English' }, { value: 'ar', label: 'Arabic' }]}
      />
      <View style={{ marginTop: 12 }}>
        {isAuthed ? (
          <>
            <Button mode="outlined" onPress={mockLogout}>Logout</Button>
            {!bioLinked ? (
              <Button
                style={{ marginTop: 8 }}
                mode="outlined"
                onPress={async () => {
                  if (linking) return;
                  setLinking(true);
                  const hasHardware = await LocalAuthentication.hasHardwareAsync();
                  const enrolled = await LocalAuthentication.isEnrolledAsync();
                  if (!hasHardware || !enrolled) {
                    setSnack({ visible: true, text: 'Biometrics not available or not enrolled' });
                    setLinking(false);
                    return;
                  }
                  const res = await LocalAuthentication.authenticateAsync({ promptMessage: 'Enable biometrics' });
                  if (res.success) {
                    const ok = await enableBiometricsForCurrentUser();
                    if (ok) {
                      const verify = await isBiometricsLinkedForCurrentUser();
                      setBioLinked(verify);
                      setLinkedEmail(verify ? await getBiometricLinkedEmail() : null);
                      setSnack({ visible: true, text: 'Biometrics enabled for this account' });
                    } else {
                      setSnack({ visible: true, text: 'Failed to enable biometrics. Try again.' });
                    }
                  } else if (res.error) {
                    setSnack({ visible: true, text: 'Authentication canceled' });
                  }
                  setLinking(false);
                }}
                loading={linking}
                disabled={linking}
              >
                Enable biometrics for this account
              </Button>
            ) : null}
            {bioLinked ? (
              <Text style={{ marginTop: 8, opacity: 0.8 }}>
                Biometrics linked{linkedEmail ? ` to ${linkedEmail}` : ''}
              </Text>
            ) : null}
          </>
        ) : (
          <Button mode="contained" onPress={() => router.push('/auth/login')}>Login / Register</Button>
        )}
      </View>
      <Snackbar visible={snack.visible} onDismiss={() => setSnack({ visible: false, text: '' })} duration={2000}>
        {snack.text}
      </Snackbar>

      <Text variant="titleMedium" style={{ marginVertical: 12 }}>Favourites</Text>
      <View style={{ flex: 1 }}>
        <FlashList
          data={favEvents ?? []}
          extraData={extra}
          estimatedItemSize={120}
          keyExtractor={(ev) => ev.id}
          renderItem={({ item: ev }) => (
            <List.Item
              title={ev.name}
              description={ev._embedded?.venues?.[0]?.city?.name}
              left={(p) => <List.Icon {...p} icon="heart" />}
              onPress={() => router.push(`/event/${ev.id}`)}
            />
          )}
          ListEmptyComponent={<Text>No favourites yet</Text>}
        />
      </View>
    </SafeAreaView>
  );
});

export default ProfileTab;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
});


