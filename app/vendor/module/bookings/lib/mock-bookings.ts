export type BookingStatus = 'ASSIGNED' | 'EN_ROUTE' | 'ON_SITE' | 'COMPLETED';

export type PaymentMethod = 'ONLINE' | 'COD';

export type MockBooking = {
  id: string;
  orderRef: string;
  customerName: string;
  area: string;
  addressLine: string;
  slotLabel: string;
  packageName: string;
  status: BookingStatus;
  paymentMethod: PaymentMethod;
  earningsAmount: number;
  itemCount: number;
  needsAction: boolean;
  isToday: boolean;
  isUpcoming: boolean;
  isCompleted: boolean;
  items: Array<{ name: string; quantity: number }>;
};

export const MOCK_BOOKINGS: MockBooking[] = [
  {
    id: 'booking-1',
    orderRef: 'DCY-240901',
    customerName: 'Priya Sharma',
    area: 'Sector 18, Noida',
    addressLine: 'Flat 402, Supertech Capetown, Sector 18, Noida 201301',
    slotLabel: 'Today, 5:00 PM',
    packageName: 'Birthday Balloon Arch',
    status: 'ASSIGNED',
    paymentMethod: 'ONLINE',
    earningsAmount: 420000,
    itemCount: 2,
    needsAction: true,
    isToday: true,
    isUpcoming: false,
    isCompleted: false,
    items: [
      { name: 'Balloon arch setup', quantity: 1 },
      { name: 'Happy birthday banner', quantity: 1 },
    ],
  },
  {
    id: 'booking-2',
    orderRef: 'DCY-240902',
    customerName: 'Rahul Mehta',
    area: 'Indiranagar, Bangalore',
    addressLine: '12th Main, HAL 2nd Stage, Indiranagar, Bengaluru 560038',
    slotLabel: 'Tomorrow, 11:00 AM',
    packageName: 'Anniversary Room Decor',
    status: 'ASSIGNED',
    paymentMethod: 'COD',
    earningsAmount: 650000,
    itemCount: 3,
    needsAction: false,
    isToday: false,
    isUpcoming: true,
    isCompleted: false,
    items: [
      { name: 'Room backdrop decor', quantity: 1 },
      { name: 'Fairy lights', quantity: 2 },
      { name: 'Rose petal setup', quantity: 1 },
    ],
  },
  {
    id: 'booking-3',
    orderRef: 'DCY-240903',
    customerName: 'Ananya Patel',
    area: 'Bandra West, Mumbai',
    addressLine: 'Hill Road, Bandra West, Mumbai 400050',
    slotLabel: 'Sat, 4:30 PM',
    packageName: 'Kids Party Setup',
    status: 'EN_ROUTE',
    paymentMethod: 'ONLINE',
    earningsAmount: 380000,
    itemCount: 2,
    needsAction: false,
    isToday: false,
    isUpcoming: true,
    isCompleted: false,
    items: [
      { name: 'Theme balloon bouquet', quantity: 1 },
      { name: 'Table centerpiece', quantity: 1 },
    ],
  },
  {
    id: 'booking-4',
    orderRef: 'DCY-240890',
    customerName: 'Vikram Singh',
    area: 'DLF Phase 1, Gurgaon',
    addressLine: 'DLF Phase 1, Gurugram 122002',
    slotLabel: 'Yesterday, 6:00 PM',
    packageName: 'Corporate Event Backdrop',
    status: 'COMPLETED',
    paymentMethod: 'ONLINE',
    earningsAmount: 890000,
    itemCount: 1,
    needsAction: false,
    isToday: false,
    isUpcoming: false,
    isCompleted: true,
    items: [{ name: 'Corporate backdrop', quantity: 1 }],
  },
  {
    id: 'booking-5',
    orderRef: 'DCY-240875',
    customerName: 'Neha Kapoor',
    area: 'Koregaon Park, Pune',
    addressLine: 'North Main Road, Koregaon Park, Pune 411001',
    slotLabel: 'Last week',
    packageName: 'Engagement Stage Decor',
    status: 'COMPLETED',
    paymentMethod: 'COD',
    earningsAmount: 1250000,
    itemCount: 4,
    needsAction: false,
    isToday: false,
    isUpcoming: false,
    isCompleted: true,
    items: [
      { name: 'Stage floral decor', quantity: 1 },
      { name: 'LED name board', quantity: 1 },
    ],
  },
];

export function getTodayBookings(bookings: MockBooking[] = MOCK_BOOKINGS) {
  return bookings.filter((booking) => booking.isToday && !booking.isCompleted);
}

export function getUpcomingBookings(bookings: MockBooking[] = MOCK_BOOKINGS) {
  return bookings.filter((booking) => booking.isUpcoming && !booking.isCompleted);
}

export function getCompletedBookings(bookings: MockBooking[] = MOCK_BOOKINGS) {
  return bookings.filter((booking) => booking.isCompleted);
}

export function getPendingActionBookings(bookings: MockBooking[] = MOCK_BOOKINGS) {
  return bookings.filter((booking) => booking.needsAction && !booking.isCompleted);
}

export function getNextBooking(bookings: MockBooking[] = MOCK_BOOKINGS) {
  const today = getTodayBookings(bookings);
  if (today.length > 0) return today[0];
  const upcoming = getUpcomingBookings(bookings);
  return upcoming[0] ?? null;
}

export function getBookingById(id: string, bookings: MockBooking[] = MOCK_BOOKINGS) {
  return bookings.find((booking) => booking.id === id) ?? null;
}

export function getActiveBookingCount(bookings: MockBooking[] = MOCK_BOOKINGS) {
  return bookings.filter(
    (booking) => !booking.isCompleted && (booking.status === 'EN_ROUTE' || booking.status === 'ON_SITE'),
  ).length;
}

export function getTodayBookingCount(bookings: MockBooking[] = MOCK_BOOKINGS) {
  return getTodayBookings(bookings).length;
}
