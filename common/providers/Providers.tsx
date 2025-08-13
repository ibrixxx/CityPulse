import { observer } from '@legendapp/state/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import React, { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { I18nManager, View } from 'react-native';
import { MD3LightTheme as DefaultPaperTheme, Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { loadUserStoreFromStorage, userStore } from '@/common/stores/userStore';

export function Providers({ children }: PropsWithChildren) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      await loadUserStoreFromStorage();
      // Respect stored RTL flag at startup
      try {
        const rtl = userStore.language.get() === 'ar';
        I18nManager.allowRTL(true);
        // Note: forceRTL may require app reload to fully apply at native level
        I18nManager.forceRTL(rtl);
      } catch {
        // noop
      }
      setReady(true);
    })();
  }, []);

  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60, // 1 minute
            retry: 1,
          },
        },
      }),
    []
  );

  const persister = useMemo(
    () =>
      createAsyncStoragePersister({
        storage: AsyncStorage,
      }),
    []
  );

  const paperTheme = useMemo(() => {
    return {
      ...DefaultPaperTheme,
      // Extend if needed; respect RTL through I18nManager settings
    };
  }, []);

  if (!ready) return null;

  const DirectionWrapper = observer(function DirectionWrapperInner({ children: dirChildren }: PropsWithChildren) {
    const lang = userStore.language.get();
    return <View style={{ flex: 1, writingDirection: lang === 'ar' ? 'rtl' : 'ltr' }}>{dirChildren}</View>;
  });

  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
      <SafeAreaProvider>
        <PaperProvider theme={paperTheme}>
          <DirectionWrapper>{children}</DirectionWrapper>
        </PaperProvider>
      </SafeAreaProvider>
    </PersistQueryClientProvider>
  );
}


