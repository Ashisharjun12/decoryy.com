export type MockBannerSlide = {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
};

export const MOCK_HOME_BANNERS: MockBannerSlide[] = [
  {
    id: '1',
    title: 'Birthday decor',
    subtitle: 'Book slots for this weekend',
    imageUrl: 'https://ik.imagekit.io/aevhlnk0h/undraw_partying_3qad.png',
  },
  {
    id: '2',
    title: 'Instant setup',
    subtitle: 'Same-day decoration in select areas',
    imageUrl: 'https://ik.imagekit.io/aevhlnk0h/undraw_booking_8vl5.png',
  },
];
