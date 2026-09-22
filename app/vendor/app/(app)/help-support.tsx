import { FadeInView } from '@/components/motion';
import { PressableScale } from '@/components/motion';
import { LoadingPlaceholder, Screen, Surface } from '@/components/shell';
import { Text } from '@/components/ui/text';
import { HelpContactCard } from '@/module/support/components/HelpContactCard';
import { useSiteBrand } from '@/module/support/hooks/use-site-brand';
import {
  openEmailCompose,
  openExternalUrl,
  openPhoneCall,
  showCopiedAlert,
} from '@/module/support/lib/contact-actions';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { Headphones, Mail, MessageCircle, Phone } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';

export default function HelpSupportScreen() {
  const { brand, isLoading } = useSiteBrand();

  async function copyValue(label: string, value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;
    await Clipboard.setStringAsync(trimmed);
    showCopiedAlert(label, trimmed);
  }

  return (
    <Screen>
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 px-5 pb-10 pt-2"
        showsVerticalScrollIndicator={false}>
        <View>
          <PressableScale onPress={() => router.back()} className="mb-3 self-start">
            <Text className="text-foreground text-sm font-medium">Back</Text>
          </PressableScale>
          <Text className="text-foreground text-2xl font-bold">Help & support</Text>
          <Text className="text-muted-foreground mt-1 text-sm leading-5">
            {brand.footerDescription}
          </Text>
        </View>

        {isLoading ? (
          <LoadingPlaceholder className="py-8" />
        ) : (
          <FadeInView>
            <Surface className="gap-1 p-4">
              <Text className="text-foreground text-sm font-semibold uppercase tracking-wide">
                Connect with us
              </Text>
              <Text className="text-muted-foreground text-sm">
                Contact {brand.companyName} — details are managed in admin Brand → Company.
              </Text>
            </Surface>

            <View className="mt-4 gap-3">
              <HelpContactCard
                icon={Phone}
                title="Call us"
                subtitle={brand.contactPhone ?? 'Phone not configured yet'}
                hint={brand.contactPhone ? 'Tap to call' : 'Ask your admin to add a phone in Brand settings'}
                disabled={!brand.contactPhone}
                onPress={() => {
                  if (brand.contactPhone) void openPhoneCall(brand.contactPhone);
                }}
                onCopy={
                  brand.contactPhone
                    ? () => void copyValue('Phone number', brand.contactPhone!)
                    : undefined
                }
              />

              <HelpContactCard
                icon={Mail}
                title="Email us"
                subtitle={brand.contactEmail ?? 'Email not configured yet'}
                hint={brand.contactEmail ? 'Tap to open mail app' : undefined}
                disabled={!brand.contactEmail}
                onPress={() => {
                  if (brand.contactEmail) void openEmailCompose(brand.contactEmail);
                }}
                onCopy={
                  brand.contactEmail
                    ? () => void copyValue('Email', brand.contactEmail!)
                    : undefined
                }
              />

              <HelpContactCard
                icon={MessageCircle}
                title="WhatsApp"
                subtitle={
                  brand.whatsappUrl
                    ? 'Message us on WhatsApp'
                    : 'WhatsApp link not configured yet'
                }
                disabled={!brand.whatsappUrl}
                onPress={() => {
                  if (brand.whatsappUrl) void openExternalUrl(brand.whatsappUrl);
                }}
                onCopy={
                  brand.whatsappUrl
                    ? () => void copyValue('WhatsApp link', brand.whatsappUrl!)
                    : undefined
                }
              />

              <HelpContactCard
                icon={Headphones}
                title="Chat with us"
                subtitle="In-app chat with Decoryy support"
                hint="Opens your support conversation"
                onPress={() => router.push('/(app)/support')}
              />
            </View>
          </FadeInView>
        )}
      </ScrollView>
    </Screen>
  );
}
