import { AccountStubScreen } from '@/module/account/components/AccountStubScreen';

export default function ProfileReturnsRoute() {
  return (
    <AccountStubScreen
      title="Refunds"
      description="Refund requests and return status will match the web account returns flow when the API is live."
    />
  );
}
