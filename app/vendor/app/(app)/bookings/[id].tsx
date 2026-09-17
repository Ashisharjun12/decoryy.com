import { FadeInView, PressableScale, SlideInBottom } from '@/components/motion';
import { triggerHaptic } from '@/components/motion/haptics';
import * as Haptics from 'expo-haptics';
import { IconWell, LoadingPlaceholder, SoftSection, Surface } from '@/components/shell';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { getApiError } from '@/api/client';
import { BookingItemsList } from '@/module/bookings/components/BookingItemsList';
import { BookingStatusBadge } from '@/module/bookings/components/BookingStatusBadge';
import { CollectCashSheet } from '@/module/bookings/components/CollectCashSheet';
import { DeclineBookingSheet } from '@/module/bookings/components/DeclineBookingSheet';
import { DeliveryCompleteSheet } from '@/module/bookings/components/DeliveryCompleteSheet';
import { JobCompletedSuccessSheet } from '@/module/bookings/components/JobCompletedSuccessSheet';
import { JobPackageSheet } from '@/module/bookings/components/JobPackageSheet';
import {
  SwipeToAcceptButton,
  SwipeToConfirmButton,
} from '@/module/bookings/components/SwipeToConfirmButton';
import {
  collectionStatusTone,
  formatCollectionStatus,
  formatInr,
} from '@/module/bookings/lib/booking-format';
import {
  useCollectCash,
  useCollectOnline,
  useCollectionStatus,
} from '@/module/bookings/hooks/use-collection';
import {
  useAcceptVendorJob,
  useDeclineVendorJob,
  useMarkEnRoute,
  useMarkOnSite,
  useSendDeliveryCode,
  useVendorJob,
} from '@/module/bookings/hooks/use-vendor-jobs';
import { useVendorDuty } from '@/module/duty/hooks/use-vendor-duty';
import { useNotificationJobPreview } from '@/module/notifications/hooks/use-notification-job-preview';
import { useAuthStore } from '@/store/auth.store';
import { AssignedWorkerChip } from '@/module/team/components/AssignedWorkerChip';
import { JobAssignSection } from '@/module/team/components/JobAssignSection';
import { selectIsFieldShell, usePartnerModeStore } from '@/store/partner-mode.store';
import { Href, router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  CreditCard,
  MapPin,
  MessageCircle,
  Phone,
  User,
} from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Alert,
  Image,
  Linking,
  ScrollView,
  Share,
  View,
} from 'react-native';
import { cn } from '@/lib/utils';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const NEEDS_ACTION_BAR_HEIGHT = 120;

function bottomActionOffset(insets: { bottom: number }) {
  return Math.max(insets.bottom, 12);
}

type BookingAcceptActionsProps = {
  onAccept: () => void;
  onDecline: () => void;
  acceptLoading?: boolean;
  disabled?: boolean;
  declineDisabled?: boolean;
  swipeLabel?: string;
  showSwipe?: boolean;
  primaryLabel?: string;
  onPrimary?: () => void;
  primaryLoading?: boolean;
};

function BookingAcceptActions({
  onAccept,
  onDecline,
  acceptLoading = false,
  disabled = false,
  declineDisabled = false,
  swipeLabel = 'Swipe to accept booking',
  showSwipe = true,
  primaryLabel,
  onPrimary,
  primaryLoading = false,
}: BookingAcceptActionsProps) {
  const actionsDisabled = disabled || acceptLoading || primaryLoading;

  return (
    <View className="gap-3">
      {showSwipe ? (
        <SwipeToAcceptButton
          label={swipeLabel}
          loading={acceptLoading}
          disabled={actionsDisabled}
          onAccept={onAccept}
        />
      ) : (
        <Button
          className="h-14 rounded-full"
          disabled={actionsDisabled}
          onPress={onPrimary}>
          <Text>{primaryLoading ? 'Going online…' : acceptLoading ? 'Accepting…' : primaryLabel}</Text>
        </Button>
      )}
      <Button
        className="h-11 rounded-full"
        variant="ghost"
        disabled={actionsDisabled || declineDisabled}
        onPress={onDecline}>
        <Text className="text-destructive font-medium">Decline</Text>
      </Button>
    </View>
  );
}

function BottomActionBar({
  bottom,
  children,
}: {
  bottom: number;
  children: ReactNode;
}) {
  return (
    <View className="absolute left-0 right-0 px-5" style={{ bottom }}>
      <SlideInBottom className="rounded-3xl bg-background pt-1 shadow-soft-lg">{children}</SlideInBottom>
    </View>
  );
}

function AssignedJobFallback({
  orderId,
  preview,
}: {
  orderId: string;
  preview: ReturnType<typeof useNotificationJobPreview>;
}) {
  const insets = useSafeAreaInsets();
  const actionBottom = bottomActionOffset(insets);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 px-5 pt-4"
        contentContainerStyle={{
          paddingBottom: preview?.needsAction ? NEEDS_ACTION_BAR_HEIGHT + actionBottom : 32 + insets.bottom,
        }}
        showsVerticalScrollIndicator={false}>
        <PressableScale onPress={() => router.back()} className="mb-1 flex-row items-center gap-2">
          <Icon as={ArrowLeft} className="text-foreground size-5" />
          <Text className="text-foreground text-sm font-medium">Back</Text>
        </PressableScale>

        <FadeInView>
          <View className="gap-2">
            <Text className="text-muted-foreground text-sm">
              {preview?.orderRef ?? `Order ${orderId.slice(0, 8)}`}
            </Text>
            <Text className="text-foreground text-2xl font-semibold">
              {preview?.title ?? 'New booking assigned'}
            </Text>
            <View className="self-start rounded-full bg-amber-500/15 px-3 py-1">
              <Text className="text-xs font-medium text-amber-800">Action required</Text>
            </View>
          </View>
        </FadeInView>

        <FadeInView delay={60}>
          <Surface className="bg-primary/10 p-5">
            <Text className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
              Scheduled slot
            </Text>
            <Text className="text-foreground mt-1 text-xl font-semibold">
              {preview?.scheduledAt || 'See notification for timing'}
            </Text>
          </Surface>
        </FadeInView>

        <FadeInView delay={120}>
          <SoftSection className="gap-4">
            <View className="flex-row items-start gap-3">
              <IconWell icon={MapPin} />
              <View className="flex-1">
                <Text className="text-muted-foreground text-xs">Address</Text>
                <Text className="text-foreground text-sm leading-5">
                  {preview?.address || preview?.body || 'Loading full details…'}
                </Text>
              </View>
            </View>
          </SoftSection>
        </FadeInView>
        {!preview?.needsAction ? (
          <FadeInView delay={150}>
            <Button className="h-12 rounded-full" onPress={() => router.push('/(app)/bookings' as Href)}>
              <Text>View all bookings</Text>
            </Button>
          </FadeInView>
        ) : null}
      </ScrollView>

      {preview?.needsAction ? (
        <BottomActionBar bottom={actionBottom}>
          <BookingAcceptActions
            onAccept={() => {}}
            onDecline={() => {}}
            disabled
            swipeLabel="Swipe to accept booking"
          />
        </BottomActionBar>
      ) : null}
    </SafeAreaView>
  );
}

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const orderId = String(id ?? '');
  const insets = useSafeAreaInsets();
  const preview = useNotificationJobPreview(orderId);
  const { data: booking, isLoading, isError } = useVendorJob(orderId);
  const user = useAuthStore((s) => s.user);
  const partnerMode = usePartnerModeStore((s) => s.mode);
  const isFieldShell = selectIsFieldShell(partnerMode, user);
  const isOwnerShell = !isFieldShell;
  const acceptMutation = useAcceptVendorJob(orderId);
  const declineMutation = useDeclineVendorJob(orderId);
  const enRouteMutation = useMarkEnRoute(orderId);
  const onSiteMutation = useMarkOnSite(orderId);
  const sendCodeMutation = useSendDeliveryCode(orderId);
  const collectCashMutation = useCollectCash(orderId);
  const collectOnlineMutation = useCollectOnline(orderId);
  const autoSendCodeRef = useRef(false);

  useEffect(() => {
    autoSendCodeRef.current = false;
  }, [orderId]);

  const shouldPollCollection =
    Boolean(booking) &&
    booking.paymentMethod === 'COD' &&
    booking.collectionStatus === 'pending' &&
    booking.status === 'ON_SITE';

  const onOnlinePaymentCollected = useCallback(() => {
    if (autoSendCodeRef.current || sendCodeMutation.isPending) return;
    autoSendCodeRef.current = true;
    void sendCodeMutation
      .mutateAsync()
      .then(() => {
        triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
      })
      .catch((err: unknown) => {
        autoSendCodeRef.current = false;
        Alert.alert('Payment received', getApiError(err));
      });
  }, [sendCodeMutation]);

  const { data: collectionStatus } = useCollectionStatus(orderId, {
    enabled: shouldPollCollection,
    poll: shouldPollCollection,
    onCollected: (status) => {
      if (status === 'collected_online') {
        onOnlinePaymentCollected();
      }
    },
  });
  const { isOnDuty, setOnDuty, isUpdating: dutyUpdating } = useVendorDuty();
  const [packageOpen, setPackageOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [declineOpen, setDeclineOpen] = useState(false);
  const [declineError, setDeclineError] = useState<string | null>(null);
  const [cashCollectOpen, setCashCollectOpen] = useState(false);
  const [cashCollectError, setCashCollectError] = useState<string | null>(null);
  const [jobCompletedOpen, setJobCompletedOpen] = useState(false);
  const [completedSnapshot, setCompletedSnapshot] = useState<{
    paymentMethod: string;
    collectionMethod: string | null;
    vendorSharePaise: number | null;
  } | null>(null);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <LoadingPlaceholder className="py-0" />
      </SafeAreaView>
    );
  }

  if (isError || !booking) {
    return <AssignedJobFallback orderId={orderId} preview={preview} />;
  }

  const paymentLabel =
    booking.paymentMethod === 'COD' ? 'Cash on delivery' : 'Paid online';
  const collectionTone = collectionStatusTone(booking.collectionStatus);
  const collectionChipClass =
    collectionTone === 'amber'
      ? 'bg-amber-500/15'
      : collectionTone === 'emerald'
        ? 'bg-emerald-500/15'
        : 'bg-muted';
  const collectionTextClass =
    collectionTone === 'amber'
      ? 'text-amber-800'
      : collectionTone === 'emerald'
        ? 'text-emerald-800'
        : 'text-muted-foreground';

  async function onAccept() {
    try {
      await acceptMutation.mutateAsync();
      triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    } catch (err) {
      Alert.alert('Could not accept', getApiError(err));
    }
  }

  async function onGoOnlineAndAccept() {
    await setOnDuty(true);
    if (useAuthStore.getState().user?.vendor?.isOnDuty) {
      await onAccept();
    }
  }

  function onDeclinePress() {
    setDeclineError(null);
    setDeclineOpen(true);
  }

  function onDeclineClose() {
    if (declineMutation.isPending) return;
    setDeclineOpen(false);
    setDeclineError(null);
  }

  async function onConfirmDecline() {
    try {
      setDeclineError(null);
      await declineMutation.mutateAsync();
      setDeclineOpen(false);
      triggerHaptic();
      router.replace('/(app)/bookings' as Href);
    } catch (err) {
      setDeclineError(getApiError(err));
    }
  }

  function onCashCollectPress() {
    setCashCollectError(null);
    setCashCollectOpen(true);
  }

  function onCashCollectClose() {
    if (collectCashMutation.isPending) return;
    setCashCollectOpen(false);
    setCashCollectError(null);
  }

  async function onConfirmCashCollect() {
    try {
      setCashCollectError(null);
      await collectCashMutation.mutateAsync();
      setCashCollectOpen(false);
      triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    } catch (err) {
      setCashCollectError(getApiError(err));
    }
  }

  async function onSwipePayOnline() {
    try {
      await collectOnlineMutation.mutateAsync();
      triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    } catch (err) {
      Alert.alert('Could not create payment link', getApiError(err));
    }
  }

  const actionBottom = bottomActionOffset(insets);
  const scrollBottomPadding = booking.needsAction
    ? NEEDS_ACTION_BAR_HEIGHT + actionBottom
    : 160 + actionBottom;
  const tripBusy =
    enRouteMutation.isPending ||
    onSiteMutation.isPending ||
    sendCodeMutation.isPending ||
    collectCashMutation.isPending ||
    collectOnlineMutation.isPending;

  const needsCollection =
    booking.paymentMethod === 'COD' && booking.collectionStatus === 'pending';
  const collectionSettled = !needsCollection;
  const delivery = booking.delivery;

  function openMaps() {
    const query = encodeURIComponent(
      [delivery.address, delivery.landmark, delivery.cityName, delivery.pincode]
        .filter(Boolean)
        .join(', '),
    );
    void Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  }

  async function runTripAction(
    label: string,
    action: () => Promise<unknown>,
  ) {
    try {
      await action();
      triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    } catch (err) {
      Alert.alert(`Could not ${label}`, getApiError(err));
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 px-5 pt-4"
        contentContainerStyle={{ paddingBottom: scrollBottomPadding }}
        showsVerticalScrollIndicator={false}>
        <View className="mb-1 flex-row items-center justify-between gap-3">
          <PressableScale onPress={() => router.back()} className="flex-row items-center gap-2">
            <Icon as={ArrowLeft} className="text-foreground size-5" />
            <Text className="text-foreground text-sm font-medium">Back</Text>
          </PressableScale>
          {booking.canChat ? (
            <PressableScale
              className="flex-row items-center gap-1.5 rounded-full border border-amber-400 bg-primary px-3.5 py-2.5"
              accessibilityLabel="Chat with customer"
              onPress={() => router.push(`/(app)/bookings/${orderId}/chat` as Href)}>
              <Icon as={MessageCircle} className="size-4 text-[#1A1A1A]" />
              <Text className="text-sm font-bold text-[#1A1A1A]">Chat</Text>
            </PressableScale>
          ) : null}
        </View>

        <FadeInView>
          <View className="gap-2">
            <Text className="text-muted-foreground text-sm">{booking.orderRef}</Text>
            <Text className="text-foreground text-2xl font-semibold">{booking.packageName}</Text>
            <BookingStatusBadge
              status={booking.needsAction ? 'CONFIRMED' : booking.status}
              className="self-start"
            />
            {isOwnerShell && booking.vendorResponse === 'accepted' ? (
              <AssignedWorkerChip orderId={orderId} />
            ) : null}
          </View>
        </FadeInView>

        <FadeInView delay={60}>
          <Surface className="bg-primary/10 p-5">
            <Text className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
              Scheduled slot
            </Text>
            <Text className="text-foreground mt-1 text-xl font-semibold">{booking.slotLabel}</Text>
          </Surface>
        </FadeInView>

        <FadeInView delay={120}>
          <SoftSection className="gap-4">
            <View className="flex-row items-center gap-3">
              <IconWell icon={User} />
              <View className="flex-1">
                <Text className="text-muted-foreground text-xs">Customer</Text>
                <Text className="text-foreground text-base font-medium">{booking.customer.name}</Text>
              </View>
            </View>
            {booking.customer.phone ? (
              <View className="flex-row items-center gap-3">
                <IconWell icon={Phone} />
                <View className="min-w-0 flex-1">
                  <Text className="text-muted-foreground text-xs">Phone</Text>
                  <Text className="text-foreground text-base font-medium">
                    {booking.customer.phone}
                  </Text>
                </View>
                <PressableScale
                  onPress={() => Linking.openURL(`tel:${booking.customer.phone}`)}
                  className="rounded-full border border-amber-400 bg-primary px-4 py-2">
                  <Text className="text-sm font-bold text-[#1A1A1A]">Call</Text>
                </PressableScale>
              </View>
            ) : null}
            <View className="flex-row items-start gap-3">
              <IconWell icon={MapPin} />
              <View className="flex-1">
                <Text className="text-muted-foreground text-xs">Address</Text>
                <Text className="text-foreground text-sm leading-5">{booking.addressLine}</Text>
                <Text className="text-muted-foreground mt-1 text-sm">
                  {booking.delivery.cityName} · {booking.delivery.pincode}
                </Text>
              </View>
            </View>
            <View className="flex-row items-start gap-3 border-t border-border/70 pt-4">
              <IconWell icon={CreditCard} />
              <View className="min-w-0 flex-1 gap-3">
                <View>
                  <Text className="text-muted-foreground text-xs">Payment</Text>
                  <Text className="text-foreground text-base font-medium">{paymentLabel}</Text>
                  {booking.paymentMethod === 'COD' ? (
                    <View className={cn('mt-2 self-start rounded-full px-3 py-1', collectionChipClass)}>
                      <Text className={cn('text-xs font-medium', collectionTextClass)}>
                        {formatCollectionStatus(booking.collectionStatus)}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <View>
                  <Text className="text-muted-foreground text-xs">Order value</Text>
                  <Text className="text-foreground text-2xl font-bold tracking-tight">
                    {formatInr(booking.subtotalPaise)}
                  </Text>
                  {booking.vendorSharePaise != null && collectionSettled ? (
                    <Text className="text-emerald-700 mt-1 text-sm font-medium">
                      Your share: {formatInr(booking.vendorSharePaise)}
                    </Text>
                  ) : null}
                </View>
              </View>
            </View>
          </SoftSection>
        </FadeInView>

        {isOwnerShell && booking.vendorResponse === 'accepted' ? (
          <FadeInView delay={160}>
            <JobAssignSection orderId={orderId} accepted />
          </FadeInView>
        ) : null}

        <FadeInView delay={180}>
          <BookingItemsList
            items={booking.items}
            subtotalPaise={booking.subtotalPaise}
            onViewAll={() => setPackageOpen(true)}
          />
        </FadeInView>

        {needsCollection && collectionStatus?.activeSession ? (
          <FadeInView delay={220}>
            <Surface className="gap-4 p-5 shadow-none">
              {collectionStatus.activeSession.qrImageUrl ||
              collectionStatus.activeSession.qrBase64 ? (
                <>
                  <Text className="text-foreground text-center text-base font-semibold">
                    Scan to pay
                  </Text>
                  <Text className="text-muted-foreground text-center text-sm">
                    Customer scans this code on your phone to pay{' '}
                    {formatInr(booking.subtotalPaise)}
                  </Text>
                  {collectionStatus.activeSession.qrImageUrl ? (
                    <Image
                      source={{ uri: collectionStatus.activeSession.qrImageUrl }}
                      className="mx-auto h-56 w-56 rounded-xl bg-white p-2"
                      resizeMode="contain"
                      accessibilityLabel="Payment QR code"
                    />
                  ) : (
                    <Image
                      source={{
                        uri: `data:image/png;base64,${collectionStatus.activeSession.qrBase64}`,
                      }}
                      className="mx-auto h-56 w-56 rounded-xl bg-white p-2"
                      resizeMode="contain"
                      accessibilityLabel="Payment QR code"
                    />
                  )}
                </>
              ) : collectionStatus.activeSession.shareUrl ? (
                <>
                  <Text className="text-foreground text-center text-base font-semibold">
                    Payment link ready
                  </Text>
                  <Text className="text-muted-foreground text-center text-sm">
                    Open the link so the customer can pay {formatInr(booking.subtotalPaise)} online
                  </Text>
                  <Button
                    className="h-12 rounded-full"
                    onPress={() =>
                      void Linking.openURL(collectionStatus.activeSession!.shareUrl!)
                    }>
                    <Text className="font-semibold">Open payment link</Text>
                  </Button>
                  <Button
                    className="h-11 rounded-full"
                    variant="outline"
                    onPress={() =>
                      void Share.share({
                        message: `Pay ${formatInr(booking.subtotalPaise)} for your Decoryy booking: ${collectionStatus.activeSession!.shareUrl}`,
                        url: collectionStatus.activeSession!.shareUrl!,
                      })
                    }>
                    <Text>Share link with customer</Text>
                  </Button>
                </>
              ) : null}
            </Surface>
          </FadeInView>
        ) : null}
      </ScrollView>

      <JobPackageSheet
        open={packageOpen}
        onClose={() => setPackageOpen(false)}
        items={booking.items}
        subtotalPaise={booking.subtotalPaise}
      />

      {isOwnerShell && booking.needsAction ? (
        <BottomActionBar bottom={actionBottom}>
          <BookingAcceptActions
            showSwipe={isOnDuty}
            swipeLabel="Swipe to accept booking"
            onAccept={() => void onAccept()}
            onDecline={onDeclinePress}
            acceptLoading={acceptMutation.isPending}
            declineDisabled={declineOpen || declineMutation.isPending}
            disabled={dutyUpdating}
            primaryLabel="Go online to accept"
            onPrimary={() => void onGoOnlineAndAccept()}
            primaryLoading={dutyUpdating}
          />
        </BottomActionBar>
      ) : !isFieldShell || booking.status === 'COMPLETED' ? null : (
        <BottomActionBar bottom={actionBottom}>
          <View className="gap-2">
            {booking.status === 'ASSIGNED' ? (
              <View className="gap-3">
                <SwipeToConfirmButton
                  variant="accept"
                  label="Swipe — I'm on the way"
                  loadingLabel="Updating…"
                  loading={enRouteMutation.isPending}
                  disabled={tripBusy}
                  onConfirm={() =>
                    void runTripAction('mark en route', () => enRouteMutation.mutateAsync())
                  }
                />
                <Button className="h-11 rounded-full" variant="outline" onPress={openMaps}>
                  <Text>Open in Maps</Text>
                </Button>
              </View>
            ) : null}
            {booking.status === 'EN_ROUTE' ? (
              <View className="gap-3">
                <SwipeToConfirmButton
                  variant="accept"
                  label="Swipe — I've reached location"
                  loadingLabel="Updating…"
                  loading={onSiteMutation.isPending}
                  disabled={tripBusy}
                  onConfirm={() =>
                    void runTripAction('mark arrived', () => onSiteMutation.mutateAsync())
                  }
                />
                <Button className="h-11 rounded-full" variant="outline" onPress={openMaps}>
                  <Text>Open in Maps</Text>
                </Button>
              </View>
            ) : null}
            {booking.status === 'ON_SITE' ? (
              <>
                {needsCollection && !collectionSettled ? (
                  <View className="gap-3">
                    <Text className="text-muted-foreground text-center text-sm">
                      Collect {formatInr(booking.subtotalPaise)} before sending the delivery code
                    </Text>
                    <SwipeToConfirmButton
                      variant="accept"
                      label="Swipe — Customer pays online"
                      loadingLabel="Creating link…"
                      loading={collectOnlineMutation.isPending}
                      disabled={tripBusy || cashCollectOpen}
                      onConfirm={() => void onSwipePayOnline()}
                    />
                    <Button
                      className="h-12 rounded-full"
                      variant="outline"
                      disabled={tripBusy || collectOnlineMutation.isPending}
                      onPress={onCashCollectPress}>
                      <Text>Cash collected</Text>
                    </Button>
                  </View>
                ) : null}
                {!booking.deliveryCodeSent && collectionSettled ? (
                  <Button
                    className="h-12 rounded-full"
                    disabled={tripBusy}
                    onPress={() =>
                      void runTripAction('send code', () => sendCodeMutation.mutateAsync())
                    }>
                    <Text>{sendCodeMutation.isPending ? 'Sending…' : 'Send delivery code'}</Text>
                  </Button>
                ) : null}
                {booking.deliveryCodeSent ? (
                  <Button
                    className="h-12 rounded-full"
                    onPress={() => setCompleteOpen(true)}>
                    <Text>Complete with code</Text>
                  </Button>
                ) : null}
                {booking.deliveryCodeSent ? (
                  <Button
                    className="h-12 rounded-full"
                    variant="outline"
                    disabled={tripBusy}
                    onPress={() =>
                      void runTripAction('resend code', () => sendCodeMutation.mutateAsync())
                    }>
                    <Text>{sendCodeMutation.isPending ? 'Sending…' : 'Resend code'}</Text>
                  </Button>
                ) : null}
              </>
            ) : null}
          </View>
        </BottomActionBar>
      )}

      <DeliveryCompleteSheet
        open={completeOpen}
        onClose={() => setCompleteOpen(false)}
        orderId={orderId}
        onCompleted={() => {
          triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
          setCompletedSnapshot({
            paymentMethod: booking.paymentMethod,
            collectionMethod: booking.collectionMethod,
            vendorSharePaise: booking.vendorSharePaise,
          });
          setJobCompletedOpen(true);
        }}
      />

      {completedSnapshot ? (
        <JobCompletedSuccessSheet
          open={jobCompletedOpen}
          onClose={() => setJobCompletedOpen(false)}
          paymentMethod={completedSnapshot.paymentMethod}
          collectionMethod={completedSnapshot.collectionMethod}
          vendorSharePaise={completedSnapshot.vendorSharePaise}
        />
      ) : null}

      <DeclineBookingSheet
        open={declineOpen}
        onClose={onDeclineClose}
        bookingLabel={booking.packageName}
        onDecline={() => void onConfirmDecline()}
        loading={declineMutation.isPending}
        error={declineError}
      />

      <CollectCashSheet
        open={cashCollectOpen}
        onClose={onCashCollectClose}
        amountPaise={booking.subtotalPaise}
        onCollect={() => void onConfirmCashCollect()}
        loading={collectCashMutation.isPending}
        error={cashCollectError}
      />
    </SafeAreaView>
  );
}
