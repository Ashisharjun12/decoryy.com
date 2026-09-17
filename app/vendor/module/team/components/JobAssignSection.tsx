import { getApiError } from '@/api/client';
import type { TeamMember } from '@/api/team.api';
import { listJobAssignments, setJobAssignments } from '@/api/team.api';
import { OnboardingButton } from '@/module/onboarding/components/OnboardingButton';
import { vendorJobsKeys } from '@/module/bookings/hooks/use-vendor-jobs';
import { notificationQueryKeys } from '@/module/notifications/lib/notification-query-keys';
import { AssignWorkerConfirmSheet } from '@/module/team/components/AssignWorkerConfirmSheet';
import { AssignWorkerPickerSheet } from '@/module/team/components/AssignWorkerPickerSheet';
import { AssignedWorkerChip } from '@/module/team/components/AssignedWorkerChip';
import { Text } from '@/components/ui/text';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Alert, View } from 'react-native';

type Props = {
  orderId: string;
  accepted: boolean;
};

export function JobAssignSection({ orderId, accepted }: Props) {
  const queryClient = useQueryClient();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<TeamMember | null>(null);

  const { data: assignments } = useQuery({
    queryKey: ['job-assignments', orderId],
    queryFn: () => listJobAssignments(orderId),
    enabled: accepted,
  });

  const assignMutation = useMutation({
    mutationFn: (memberIds: string[]) => setJobAssignments(orderId, memberIds),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['job-assignments', orderId] });
      void queryClient.invalidateQueries({ queryKey: vendorJobsKeys.all });
      void queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all });
      setConfirmOpen(false);
      setPickerOpen(false);
      setSelectedWorker(null);
    },
    onError: (err) => Alert.alert('Assign failed', getApiError(err)),
  });

  if (!accepted) return null;

  const assigned = assignments?.[0] ?? null;
  const assignedMemberId = assigned?.memberId ?? null;

  function openPicker() {
    setPickerOpen(true);
  }

  function handleSelectWorker(worker: TeamMember) {
    setSelectedWorker(worker);
    setPickerOpen(false);
    setConfirmOpen(true);
  }

  function handleConfirmAssign() {
    if (!selectedWorker) return;
    assignMutation.mutate([selectedWorker.id]);
  }

  function handleUnassign() {
    assignMutation.mutate([]);
  }

  const isReassign = Boolean(assignedMemberId && selectedWorker && assignedMemberId !== selectedWorker.id);

  return (
    <View className="gap-3 rounded-2xl border border-border bg-card p-4">
      <View className="gap-1">
        <Text className="text-foreground text-base font-semibold">Field worker</Text>
        <Text className="text-muted-foreground text-sm">
          One worker per job. They&apos;ll be notified and handle customer chat.
        </Text>
      </View>

      <AssignedWorkerChip orderId={orderId} enabled={accepted} />

      <OnboardingButton onPress={openPicker}>
        <Text className="font-semibold">
          {assignedMemberId ? 'Change worker' : 'Assign worker'}
        </Text>
      </OnboardingButton>

      <AssignWorkerPickerSheet
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelectWorker={handleSelectWorker}
        assignedMemberId={assignedMemberId}
      />

      <AssignWorkerConfirmSheet
        open={confirmOpen}
        worker={selectedWorker}
        loading={assignMutation.isPending}
        isReassign={isReassign}
        onClose={() => {
          setConfirmOpen(false);
          setSelectedWorker(null);
        }}
        onConfirmAssign={handleConfirmAssign}
        onUnassign={
          assignedMemberId && selectedWorker?.id === assignedMemberId
            ? handleUnassign
            : undefined
        }
      />
    </View>
  );
}
