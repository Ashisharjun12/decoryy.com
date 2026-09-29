import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { WhatsAppIcon } from '@/components/shell/WhatsAppIcon';
import { INSTANT_TAB_HEX } from '@/lib/theme';
import { ChevronRight, Zap } from 'lucide-react-native';
import { View } from 'react-native';
import { Icon } from '@/components/ui/icon';

type ProductPdpBookingActionsProps = {
  booking: boolean;
  isInstantBooking: boolean;
  onWhatsApp: () => void;
  onBookNow: () => void;
};

export function ProductPdpBookingActions({
  booking,
  isInstantBooking,
  onWhatsApp,
  onBookNow,
}: ProductPdpBookingActionsProps) {
  return (
    <View className="flex-row gap-2.5">
      <Button
        className="h-12 min-w-0 flex-1 rounded-xl bg-[#00A859]"
        onPress={onWhatsApp}>
        <View className="flex-row items-center gap-2">
          <WhatsAppIcon size={20} color="#fff" />
          <Text className="text-base font-semibold text-white">WhatsApp</Text>
        </View>
      </Button>
      <Button
        className={`h-12 min-w-0 flex-1 rounded-xl ${isInstantBooking ? '' : 'bg-primary'}`}
        style={isInstantBooking ? { backgroundColor: INSTANT_TAB_HEX } : undefined}
        disabled={booking}
        onPress={onBookNow}>
        <View className="flex-row items-center gap-2">
          {isInstantBooking ? (
            <Icon as={Zap} className="size-5 text-white" fill={INSTANT_TAB_HEX} />
          ) : null}
          <Text
            className={`text-base font-bold ${isInstantBooking ? 'text-white' : 'text-primary-foreground'}`}>
            {booking ? 'Adding…' : isInstantBooking ? 'Book instant' : 'Book Now'}
          </Text>
          {!booking && !isInstantBooking ? (
            <Icon as={ChevronRight} className="text-primary-foreground size-5" />
          ) : null}
        </View>
      </Button>
    </View>
  );
}
