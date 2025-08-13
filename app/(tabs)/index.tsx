import { useSearchEvents } from '@/common/hooks/useEvents';
import { toggleFavorite, userStore } from '@/common/stores/userStore';
import { observer } from '@legendapp/state/react';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, IconButton, Searchbar, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const HomeScreen = observer(function HomeScreenInner() {
  const [keyword, setKeyword] = useState('music');
  const [city, setCity] = useState('');
  const { data, isFetching } = useSearchEvents(keyword, city);
  const favorites = userStore.favorites.get();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.row}>
        <Searchbar
          placeholder="City"
          value={city}
          onChangeText={setCity}
          style={[styles.search, styles.inputHalf]}
        />
        <Searchbar
          placeholder="Type"
          value={keyword}
          onChangeText={setKeyword}
          style={[styles.search, styles.inputHalf]}
        />
      </View>
      <FlashList
        data={data ?? []}
        extraData={[favorites, keyword, city]}
        estimatedItemSize={220}
        renderItem={({ item: ev }) => {
          const cover = ev.images?.[0]?.url;
          const fav = favorites.includes(ev.id);
          return (
            <Card style={styles.card} onPress={() => router.push(`/event/${ev.id}`)}>
              {cover ? <Card.Cover source={{ uri: cover }} /> : null}
              <Card.Title title={ev.name} subtitle={ev._embedded?.venues?.[0]?.city?.name} />
              <Card.Actions>
                <IconButton
                  icon={fav ? 'heart' : 'heart-outline'}
                  onPress={() => {
                    toggleFavorite(ev.id);
                  }}
                  accessibilityLabel="favorite"
                />
              </Card.Actions>
            </Card>
          );
        }}
        ListFooterComponent={isFetching ? (
          <Text style={{ textAlign: 'center', marginVertical: 8 }}>Loading…</Text>
        ) : null}
      />
    </SafeAreaView>
  );
});

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  search: { marginBottom: 8 },
  row: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  inputHalf: { flex: 1 },
  card: { marginBottom: 12 },
});
