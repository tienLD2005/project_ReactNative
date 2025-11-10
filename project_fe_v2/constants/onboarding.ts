export const ONBOARDING_COLORS = {
  PRIMARY: '#6C7CE7',
  TEXT_PRIMARY: '#1A1A1A',
  TEXT_SECONDARY: '#6B7280',
  BACKGROUND: '#FFFFFF',
  PAGINATION_ACTIVE: '#6C7CE7',
  PAGINATION_INACTIVE: '#E5E7EB',
} as const;

export interface OnboardingData {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
}

export const ONBOARDING_DATA: OnboardingData[] = [
  {
    id: 1,
    title: 'Easy way to book hotels with us',
    description: 'It is  a long established fact that a reader will be distracted by the readable content  when looking at its layout the point of using Lorem Ipsum is that it has a more-or-less normal.',
    imageUrl: 'https://images.pexels.com/photos/24284828/pexels-photo-24284828/free-photo-of-thap-mekkah.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500?w=800',
  },
  {
    id: 2,
    title: 'Discover and find the perfect vacation spot',
    description: 'It is  a long established fact that a reader will be distracted by the readable content  when looking at its layout the point of using Lorem Ipsum is that it has a more-or-less normal.',
    imageUrl: 'https://images.pexels.com/photos/10885325/pexels-photo-10885325.jpeg?w=800',
  },
  {
    id: 3,
    title: 'Giving the best deal just for you',
    description: 'It is  a long established fact that a reader will be distracted by the readable content  when looking at its layout the point of using Lorem Ipsum is that it has a more-or-less normal.',
    imageUrl: 'https://images.pexels.com/photos/3510073/pexels-photo-3510073.jpeg?w=800',
  },
] as const;

export const STORAGE_KEYS = {
  ONBOARDING_COMPLETED: '@onboarding_completed',
} as const;
