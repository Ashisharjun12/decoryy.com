import type { CustomerUser } from '@/lib/auth.types';
import { type Href, router } from 'expo-router';

export function proceedToCheckout(user: CustomerUser | null) {
  if (!user) {
    router.push('/(onboarding)/login' as Href);
    return false;
  }
  router.push('/(app)/checkout' as Href);
  return true;
}
