import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { SELECT_LOCATION_HREF } from '@/lib/select-location-route';
import { Href, router } from 'expo-router';
import { View } from 'react-native';

export function ProductDetailLocationPrompt() {
  return (
    <View className="mx-5 mt-24 flex-1 gap-4 rounded-2xl border border-border bg-card p-6">
      <Text className="text-foreground text-2xl font-semibold">Choose your area</Text>
      <Text className="text-muted-foreground text-sm leading-relaxed">
        Product pricing and availability depend on your location. Select where we should deliver and
        set up.
      </Text>
      <Button onPress={() => router.push(SELECT_LOCATION_HREF as Href)}>
        <Text>Select location</Text>
      </Button>
    </View>
  );
}
