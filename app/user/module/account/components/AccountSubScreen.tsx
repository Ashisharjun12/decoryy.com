import { Screen, TabScreenTitle } from '@/components/shell';
import { cn } from '@/lib/utils';
import { useGoBack } from '@/lib/use-go-back';
import type { ReactNode } from 'react';
import { View } from 'react-native';

const HORIZONTAL_GUTTER = 20;

type AccountSubScreenProps = {
  title: string;
  children: ReactNode;
  contentClassName?: string;
};

export function AccountSubScreen({ title, children, contentClassName }: AccountSubScreenProps) {
  const onBack = useGoBack();
  return (
    <Screen scroll={false} edges={['top', 'left', 'right']} contentClassName="flex-1">
      <TabScreenTitle title={title} showBack onBack={onBack} />
      <Screen
        className="flex-1"
        contentClassName={cn('flex-1', contentClassName)}
        scrollProps={{
          contentContainerStyle: {
            paddingHorizontal: HORIZONTAL_GUTTER,
            paddingTop: 16,
            paddingBottom: 32,
          },
        }}>
        <View className="gap-5">{children}</View>
      </Screen>
    </Screen>
  );
}
