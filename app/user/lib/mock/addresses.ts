export type MockSavedAddress = {
  id: string;
  label: string;
  lines: string;
  distanceLabel?: string;
  selected?: boolean;
};

export const MOCK_SAVED_ADDRESSES: MockSavedAddress[] = [
  {
    id: 'work',
    label: 'Work',
    lines: 'WeWork Galaxy, 43 Residency Rd, Ashok Nagar, Bengaluru, Karnataka 560025',
    distanceLabel: '5 m',
    selected: true,
  },
  {
    id: 'home',
    label: 'Home',
    lines: '12th Main, Indiranagar, Bengaluru, Karnataka 560038',
    distanceLabel: '19 m',
  },
  {
    id: 'other',
    label: 'Hotel / PG',
    lines: 'MG Road, near Trinity Metro, Bengaluru, Karnataka 560001',
    distanceLabel: '1.2 km',
  },
];
