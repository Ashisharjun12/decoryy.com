export type MockHomeCategory = {
  id: string;
  name: string;
  slug: string;
  iconKey: 'cake' | 'heart' | 'baby' | 'home' | 'sparkles';
};

export const MOCK_HOME_CATEGORIES: MockHomeCategory[] = [
  { id: 'birthday', name: 'Birthday', slug: 'birthday', iconKey: 'cake' },
  { id: 'anniversary', name: 'Anniversary', slug: 'anniversary', iconKey: 'heart' },
  { id: 'kids', name: 'Kids', slug: 'kids', iconKey: 'baby' },
  { id: 'home', name: 'Home party', slug: 'home-party', iconKey: 'home' },
  { id: 'premium', name: 'Premium', slug: 'premium', iconKey: 'sparkles' },
];
