import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { RefreshControl } from 'react-native';

type RefetchFn = () => Promise<unknown> | unknown;

/**
 * Screen refresh:
 * - Focus (tab / back nav): silent background refetch — no spinner.
 * - Pull down: native spinner until refetch completes.
 */
export function useScreenRefresh(refetch: RefetchFn) {
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const refreshControl = useMemo(
    () => <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />,
    [refreshing, onRefresh],
  );

  return { refreshing, onRefresh, refreshControl };
}
