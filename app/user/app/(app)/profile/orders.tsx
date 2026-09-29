import { AccountStubScreen } from '@/module/account/components/AccountStubScreen';

export default function ProfileOrdersRoute() {
  return (
    <AccountStubScreen
      title="My orders"
      description="Your decoration bookings and order history will appear here once connected to the bookings API."
    />
  );
}
