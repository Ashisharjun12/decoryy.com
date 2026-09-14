export type MockNotification = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  readAt: string | null;
};

export const MOCK_NOTIFICATIONS: MockNotification[] = [
  {
    id: 'notif-1',
    title: 'New booking assigned',
    body: 'Booking DCY-240901 on Today, 5:00 PM at Sector 18, Noida',
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    readAt: null,
  },
  {
    id: 'notif-2',
    title: 'Payout processed',
    body: '₹12,400 has been credited to your wallet',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    readAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
  {
    id: 'notif-3',
    title: 'Reminder',
    body: 'You have a booking tomorrow at 11:00 AM in Indiranagar',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    readAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
  },
];

export function getUnreadNotificationCount(notifications: MockNotification[] = MOCK_NOTIFICATIONS) {
  return notifications.filter((n) => !n.readAt).length;
}
