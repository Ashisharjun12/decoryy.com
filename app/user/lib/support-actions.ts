import { MOCK_CONTACT_PHONE, MOCK_WHATSAPP_URL } from './mock/support';
import { Linking } from 'react-native';

export async function openWhatsAppSupport() {
  const canOpen = await Linking.canOpenURL(MOCK_WHATSAPP_URL);
  if (canOpen) {
    await Linking.openURL(MOCK_WHATSAPP_URL);
    return;
  }
  await Linking.openURL(`tel:${MOCK_CONTACT_PHONE}`);
}
