export type MockProductCard = {
  id: string;
  title: string;
  imageUrl: string;
  pricePaise: number;
  rating: number;
  reviewCount: number;
  instant?: boolean;
  slotHint?: string;
};

export type MockProductRail = {
  id: string;
  title: string;
  subtitle?: string;
  items: MockProductCard[];
};

const IMG =
  'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=300&fit=crop';

export const MOCK_HOME_PRODUCT_RAILS: MockProductRail[] = [
  {
    id: 'popular',
    title: 'Popular near you',
    subtitle: 'Top picks in your city',
    items: [
      {
        id: 'p1',
        title: 'Balloon arch & backdrop',
        imageUrl: IMG,
        pricePaise: 499900,
        rating: 4.8,
        reviewCount: 124,
        instant: true,
        slotHint: 'Today 4–6 PM',
      },
      {
        id: 'p2',
        title: 'Floral entrance decor',
        imageUrl: IMG,
        pricePaise: 349900,
        rating: 4.6,
        reviewCount: 89,
        slotHint: 'Tomorrow',
      },
      {
        id: 'p3',
        title: 'Kids theme setup',
        imageUrl: IMG,
        pricePaise: 599900,
        rating: 4.9,
        reviewCount: 210,
      },
    ],
  },
  {
    id: 'birthdays',
    title: 'Birthdays',
    subtitle: 'Most booked this week',
    items: [
      {
        id: 'p4',
        title: 'Classic birthday package',
        imageUrl: IMG,
        pricePaise: 299900,
        rating: 4.7,
        reviewCount: 340,
        instant: true,
      },
      {
        id: 'p5',
        title: 'Premium milestone decor',
        imageUrl: IMG,
        pricePaise: 899900,
        rating: 4.5,
        reviewCount: 56,
      },
    ],
  },
];

export function formatPaise(paise: number): string {
  const rupees = paise / 100;
  return `₹${rupees.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}
