import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Daily Devotionals | Divine Comfort',
  description: 'Start your day with inspiring daily devotionals, scripture readings, reflections, and prayers to strengthen your faith and deepen your spiritual journey.',
  keywords: 'daily devotionals, Christian devotions, scripture reflections, daily prayer, Bible meditation, spiritual inspiration, faith journey',
  openGraph: {
    title: 'Daily Devotionals | Divine Comfort',
    description: 'Start your day with inspiring daily devotionals, scripture readings, reflections, and prayers to strengthen your faith and deepen your spiritual journey.',
    images: [
      {
        url: 'https://fcuiwgbwavqwunqerchc.supabase.co/storage/v1/object/public/assets//Divine%20Comfort%20featured%20image.png',
        width: 1200,
        height: 630,
        alt: 'Daily Devotionals from Divine Comfort',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Daily Devotionals | Divine Comfort',
    description: 'Start your day with inspiring daily devotionals, scripture readings, reflections, and prayers to strengthen your faith and deepen your spiritual journey.',
    images: ['https://fcuiwgbwavqwunqerchc.supabase.co/storage/v1/object/public/assets//Divine%20Comfort%20featured%20image.png'],
  },
}; 