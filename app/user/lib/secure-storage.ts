import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'deccorbuddys_user_access_token';
const USER_PHONE_KEY = 'deccorbuddys_user_phone';
const HAS_SEEN_WELCOME_KEY = 'deccorbuddys_user_has_seen_welcome';

export async function loadAccessToken() {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function saveAccessToken(accessToken: string) {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
}

export async function clearAccessToken() {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_PHONE_KEY);
}

export async function loadUserPhone() {
  return SecureStore.getItemAsync(USER_PHONE_KEY);
}

export async function saveUserPhone(phone: string) {
  await SecureStore.setItemAsync(USER_PHONE_KEY, phone);
}

export async function loadHasSeenWelcome() {
  const value = await SecureStore.getItemAsync(HAS_SEEN_WELCOME_KEY);
  return value === '1';
}

export async function saveHasSeenWelcome() {
  await SecureStore.setItemAsync(HAS_SEEN_WELCOME_KEY, '1');
}

export async function clearHasSeenWelcome() {
  await SecureStore.deleteItemAsync(HAS_SEEN_WELCOME_KEY);
}
