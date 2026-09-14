import { FadeInView, PressableScale } from '@/components/motion';
import { triggerHaptic } from '@/components/motion/haptics';
import { Screen } from '@/components/shell';
import { Surface } from '@/components/shell';
import { Text } from '@/components/ui/text';
import { useSupportChatThread } from '@/module/chat/hooks/use-chat-thread';
import type { ChatMessage } from '@/api/chat.api';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Send } from 'lucide-react-native';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  TextInput,
  View,
} from 'react-native';

export default function SupportChatScreen() {
  const { messages, isLoading, sendMessage, isSending } = useSupportChatThread();
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const [draft, setDraft] = useState('');
  const canSend = draft.trim().length > 0 && !isSending;

  async function handleSend() {
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    await sendMessage(text);
    listRef.current?.scrollToEnd({ animated: true });
  }

  return (
    <Screen>
      <View className="border-b border-border px-5 pb-3">
        <PressableScale onPress={() => router.back()} className="mb-2">
          <Text className="text-foreground text-sm font-medium">Back</Text>
        </PressableScale>
        <Text className="text-foreground text-xl font-semibold">Help & support</Text>
        <Text className="text-muted-foreground mt-0.5 text-sm">Chat with Decoryy support</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          className="flex-1"
          contentContainerClassName="gap-3 px-5 py-4"
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item, index }) => {
            const isVendor = item.senderRole === 'vendor';
            return (
              <FadeInView delay={Math.min(index * 20, 120)}>
                <View className={`flex-row ${isVendor ? 'justify-end' : 'justify-start'}`}>
                  <Surface className={`max-w-[85%] px-4 py-3 ${isVendor ? 'bg-primary' : 'bg-muted'}`}>
                    <Text className={`text-sm ${isVendor ? 'text-primary-foreground' : 'text-foreground'}`}>
                      {item.body}
                    </Text>
                  </Surface>
                </View>
              </FadeInView>
            );
          }}
        />
      )}

      <View className="border-t border-border px-4 py-3">
        <View className="flex-row items-end gap-2">
          <TextInput
            className="min-h-11 flex-1 rounded-2xl border border-border px-4 py-2 text-foreground"
            placeholder="Type a message..."
            value={draft}
            onChangeText={setDraft}
            multiline
          />
          {canSend ? (
            <PressableScale
              onPress={handleSend}
              className="size-11 items-center justify-center rounded-full bg-primary">
              <Send size={18} color="#FFFFFF" />
            </PressableScale>
          ) : null}
        </View>
      </View>
    </Screen>
  );
}
