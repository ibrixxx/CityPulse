import { useEventDetails } from '@/common/hooks/useEvents';
import { toggleFavorite, userStore } from '@/common/stores/userStore';
import { observer } from '@legendapp/state/react';
import { AppleMaps, GoogleMaps } from 'expo-maps';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Image, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const EventDetails = observer(function EventDetailsInner() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useEventDetails(id);
  const favs = userStore.favorites.get();
  const isFav = id ? favs.includes(id) : false;

  const cover = data?.images?.[0]?.url;
  const venue = data?._embedded?.venues?.[0];
  const lat = venue?.location?.latitude ? Number(venue.location.latitude) : undefined;
  const lng = venue?.location?.longitude ? Number(venue.location.longitude) : undefined;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
      {cover ? (
        <Image source={{ uri: cover }} style={styles.cover} resizeMode="cover" />
      ) : null}
      <Text variant="headlineMedium" style={styles.title}>
        {data?.name}
      </Text>
      <Text variant="bodyMedium" style={styles.meta}>
        {venue?.name} {venue?.city?.name ? `• ${venue?.city?.name}` : ''}
      </Text>
      <View style={styles.actions}>
        <Button mode={isFav ? 'contained' : 'outlined'} onPress={() => id && toggleFavorite(id)}>
          {isFav ? 'Favourited' : 'Add to favourites'}
        </Button>
      </View>
      {data?.info ? (
        <Card style={{ marginTop: 12 }}>
          <Card.Content>
            <Text>{data.info}</Text>
          </Card.Content>
        </Card>
      ) : null}
      {data?.pleaseNote ? (
        <Card style={{ marginTop: 12 }}>
          <Card.Content>
            <Text>{data.pleaseNote}</Text>
          </Card.Content>
        </Card>
      ) : null}
      {lat !== undefined && lng !== undefined ? (
        <View style={{ height: 220, marginTop: 12, borderRadius: 8, overflow: 'hidden' }}>
          {Platform.OS === 'ios' ? (
            <AppleMaps.View
              style={{ flex: 1 }}
              cameraPosition={{ coordinates: { latitude: lat, longitude: lng }, zoom: 14 }}
              markers={[{ coordinates: { latitude: lat, longitude: lng }, title: venue?.name }]}
              properties={{ selectionEnabled: false }}
            />
          ) : (
            <GoogleMaps.View
              style={{ flex: 1 }}
              cameraPosition={{ coordinates: { latitude: lat, longitude: lng }, zoom: 14 }}
              markers={[{ coordinates: { latitude: lat, longitude: lng }, title: venue?.name }]}
              properties={{ isMyLocationEnabled: false, mapType: 'NORMAL' }}
              uiSettings={{ scrollGesturesEnabled: false, zoomGesturesEnabled: false }}
            />
          )}
        </View>
      ) : null}
      </ScrollView>
    </SafeAreaView>
  );
});

export default EventDetails;

const styles = StyleSheet.create({
  container: { padding: 16 },
  cover: { width: '100%', height: 220, borderRadius: 8, marginBottom: 12 },
  title: { marginBottom: 4 },
  meta: { opacity: 0.8, marginBottom: 12 },
  actions: { flexDirection: 'row', gap: 8 },
});


