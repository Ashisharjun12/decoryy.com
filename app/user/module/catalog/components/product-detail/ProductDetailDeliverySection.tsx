import {
  ProductFulfillmentTabs,
  type FulfillmentMode,
} from '@/module/catalog/components/ProductFulfillmentTabs';
import { buildScheduledIso } from '@/module/catalog/lib/time-slots';
import { ScalePressable } from '@/components/shell';
import { Text } from '@/components/ui/text';
import { addDays, format, startOfToday } from 'date-fns';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import {
  ProductDeliveryDateChips,
  type DeliveryDateMode,
} from './ProductDeliveryDateChips';
import { ProductDeliveryEtaBanner } from './ProductDeliveryEtaBanner';
import { ProductDeliveryScheduleDialog } from './ProductDeliveryScheduleDialog';
import { ProductDeliverySlotPicker } from './ProductDeliverySlotPicker';
import { ProductInstantDetails } from './ProductInstantDetails';
type ProductDetailDeliverySectionProps = {
  canInstant: boolean;
  canScheduled: boolean;
  fulfillment: FulfillmentMode;
  onFulfillmentChange: (mode: FulfillmentMode) => void;
  instantLabel?: string | null;
  instantNote?: string | null;
  instantEtaMinutes?: number | null;
  onScheduledAtChange: (iso: string | null) => void;
};

export function ProductDetailDeliverySection({
  canInstant,
  canScheduled,
  fulfillment,
  onFulfillmentChange,
  instantLabel,
  instantNote,
  instantEtaMinutes,
  onScheduledAtChange,
}: ProductDetailDeliverySectionProps) {
  const today = useMemo(() => startOfToday(), []);
  const [dateMode, setDateMode] = useState<DeliveryDateMode | null>(null);
  const [selectedDate, setSelectedDate] = useState(today);
  const [slotId, setSlotId] = useState('9-12');
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);

  const isInstantBooking = fulfillment === 'instant' && canInstant;
  const isLater = dateMode === 'later';

  const dialogInitialDate = useMemo(() => {
    if (dateMode === 'later') return selectedDate;
    return addDays(today, 2);
  }, [dateMode, selectedDate, today]);

  const openLaterDialog = useCallback(() => {
    setScheduleDialogOpen(true);
  }, []);

  const handleDateConfirm = useCallback((date: Date) => {
    setSelectedDate(date);
    setDateMode('later');
  }, []);

  const handleSelectMode = useCallback(
    (mode: DeliveryDateMode) => {
      setDateMode(mode);
      if (mode === 'today') setSelectedDate(today);
      if (mode === 'tomorrow') setSelectedDate(addDays(today, 1));
    },
    [today],
  );

  const dateChosen = dateMode != null;

  useEffect(() => {
    if (isInstantBooking || !canScheduled || !dateChosen) {
      onScheduledAtChange(null);
      return;
    }
    onScheduledAtChange(buildScheduledIso(selectedDate, slotId));
  }, [isInstantBooking, canScheduled, dateChosen, selectedDate, slotId, onScheduledAtChange]);

  return (
    <View className="gap-4">
      {canInstant && canScheduled ? (
        <ProductFulfillmentTabs
          value={fulfillment}
          onChange={onFulfillmentChange}
          instantLabel={instantLabel}
        />
      ) : null}

      {isInstantBooking ? (
        <ProductInstantDetails note={instantNote} etaMinutes={instantEtaMinutes} />
      ) : canScheduled ? (
        <View className="gap-4 rounded-2xl border border-border bg-card p-4">
          <ProductDeliveryDateChips
            mode={dateMode}
            selectedDate={selectedDate}
            onSelectMode={handleSelectMode}
            onOpenLater={openLaterDialog}
          />

          {isLater ? (
            <View className="flex-row items-center justify-between gap-3 rounded-2xl bg-muted/40 px-3 py-3">
              <View className="min-w-0 flex-1">
                <Text className="text-muted-foreground text-xs font-medium uppercase">
                  Delivery date
                </Text>
                <Text className="text-foreground mt-0.5 text-sm font-semibold">
                  {format(selectedDate, 'EEE, d MMM yyyy')}
                </Text>
              </View>
              <ScalePressable haptic onPress={openLaterDialog} accessibilityRole="button">
                <Text className="text-foreground text-sm font-semibold">Change</Text>
              </ScalePressable>
            </View>
          ) : null}

          {dateChosen ? (
            <>
              <ProductDeliverySlotPicker slotId={slotId} onSlotChange={setSlotId} />
              <ProductDeliveryEtaBanner />
            </>
          ) : null}

          <ProductDeliveryScheduleDialog
            open={scheduleDialogOpen}
            onOpenChange={setScheduleDialogOpen}
            initialDate={dialogInitialDate}
            onConfirm={handleDateConfirm}
          />
        </View>
      ) : null}
    </View>
  );
}
