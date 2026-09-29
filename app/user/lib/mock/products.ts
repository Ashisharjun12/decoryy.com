import {
  MOCK_HOME_PRODUCT_RAILS,
  type MockProductCard,
} from '@/lib/mock/home-product-rails';

export type MockProductFaq = { question: string; answer: string };

export type MockProductDetail = MockProductCard & {
  description: string;
  imageUrls: string[];
  compareAtPaise?: number;
  categoryLabel: string;
  railId: string;
  scheduledEnabled: boolean;
  includes: string[];
  faqs: MockProductFaq[];
  deliverySetup: string[];
  careInstructions: string[];
  instantPdpNote?: string;
  instantEtaMinutes?: number;
};

const IMG2 =
  'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=800&h=600&fit=crop';
const IMG3 =
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=600&fit=crop';

const RICH_OVERRIDES: Record<string, Partial<MockProductDetail>> = {
  p1: {
    description:
      'Full balloon arch with coordinated backdrop, floor props, and on-site styling. Perfect for birthdays and small celebrations.',
    compareAtPaise: 599900,
    imageUrls: [
      'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&h=600&fit=crop',
      IMG2,
      IMG3,
    ],
    includes: [
      'Balloon arch (up to 8 ft)',
      'Themed backdrop drape',
      'Floor props & signage',
      'Setup and teardown',
    ],
    instantPdpNote: 'Decorator assigned immediately after you confirm.',
    instantEtaMinutes: 15,
  },
  p4: {
    description:
      'Classic birthday décor with balloons, banner, and table styling. Our team sets up everything before your guests arrive.',
    compareAtPaise: 379900,
    includes: ['Balloon bouquet', 'Happy birthday banner', 'Table styling', '2-hour on-site setup'],
  },
};

const DEFAULT_INCLUDES = [
  'Professional on-site setup',
  'Theme-matched props',
  'Teardown after your event window',
];

const DEFAULT_FAQS: MockProductFaq[] = [
  {
    question: 'How long does setup take?',
    answer: 'Most packages are completed in 1–1.5 hours on site.',
  },
  {
    question: 'Can I reschedule?',
    answer: 'Yes — reschedule free up to 24 hours before your slot (mock policy).',
  },
];

const DEFAULT_DELIVERY = [
  'Team arrives at the start of your selected 3-hour window.',
  'We bring all materials; you provide power access if needed.',
  'Service available within 30 km of your selected city.',
];

const DEFAULT_CARE = [
  'Avoid direct rain on balloon décor.',
  'Keep floral arrangements away from direct AC blast.',
];

function findCardById(id: string): { card: MockProductCard; railId: string; categoryLabel: string } | null {
  for (const rail of MOCK_HOME_PRODUCT_RAILS) {
    const card = rail.items.find((item) => item.id === id);
    if (card) {
      return { card, railId: rail.id, categoryLabel: rail.title };
    }
  }
  return null;
}

function allCards(): MockProductCard[] {
  return MOCK_HOME_PRODUCT_RAILS.flatMap((rail) => rail.items);
}

function buildDetail(
  card: MockProductCard,
  railId: string,
  categoryLabel: string,
  override?: Partial<MockProductDetail>
): MockProductDetail {
  const baseImages = override?.imageUrls ?? [card.imageUrl, IMG2];
  return {
    ...card,
    description:
      override?.description ??
      `${card.title} — professional decoration setup in your city. Mock copy until catalog API is connected.`,
    imageUrls: baseImages,
    compareAtPaise: override?.compareAtPaise,
    categoryLabel,
    railId,
    scheduledEnabled: true,
    includes: override?.includes ?? DEFAULT_INCLUDES,
    faqs: override?.faqs ?? DEFAULT_FAQS,
    deliverySetup: override?.deliverySetup ?? DEFAULT_DELIVERY,
    careInstructions: override?.careInstructions ?? DEFAULT_CARE,
    instantPdpNote: override?.instantPdpNote,
    instantEtaMinutes: override?.instantEtaMinutes ?? 15,
  };
}

export function getMockProductById(id: string): MockProductDetail | null {
  const found = findCardById(id);
  if (!found) return null;
  const override = RICH_OVERRIDES[id];
  return buildDetail(found.card, found.railId, found.categoryLabel, override);
}

export function getSimilarProducts(productId: string, limit = 6): MockProductCard[] {
  const found = findCardById(productId);
  if (!found) return [];
  const rail = MOCK_HOME_PRODUCT_RAILS.find((r) => r.id === found.railId);
  const peers = rail?.items.filter((item) => item.id !== productId) ?? [];
  if (peers.length >= limit) return peers.slice(0, limit);
  const others = allCards().filter((c) => c.id !== productId && !peers.some((p) => p.id === c.id));
  return [...peers, ...others].slice(0, limit);
}
