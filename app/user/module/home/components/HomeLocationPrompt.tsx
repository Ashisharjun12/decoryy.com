import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { View } from 'react-native';

type HomeLocationPromptProps = {
  onPress: () => void;
};

export function HomeLocationPrompt({ onPress }: HomeLocationPromptProps) {
  return (
    <View className="mx-3 rounded-2xl border border-dashed border-border px-6 py-10">
      <Text className="text-foreground text-center text-base font-semibold">
        Location not set yet
      </Text>
      <Text className="text-muted-foreground mt-2 text-center text-sm leading-5">
        Set your delivery city to see decorations and prices near you.
      </Text>
      <Button className="mt-4 self-center rounded-full px-6" onPress={onPress}>
        <Text>Set delivery location</Text>
      </Button>
    </View>
  );
}
