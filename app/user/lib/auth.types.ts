export type CustomerUser = {
  id: string;
  name: string;
  phone: string;
};

export type MockSessionPayload = {
  accessToken: string;
  user: CustomerUser;
};
