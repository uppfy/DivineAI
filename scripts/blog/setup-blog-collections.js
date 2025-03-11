// Import required modules
const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '../../.env.local') });

// Initialize Firebase Admin with service account
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
});

const db = admin.firestore();

// Sample blog categories
const blogCategories = [
  {
    id: 'spiritual-growth',
    name: 'Spiritual Growth',
    slug: 'spiritual-growth',
    description: 'Articles focused on deepening your relationship with God and growing in faith.',
    featuredImageUrl: 'https://fcuiwgbwavqwunqerchc.supabase.co/storage/v1/object/public/assets/blog/categories/spiritual-growth.jpg',
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prayer',
    name: 'Prayer',
    slug: 'prayer',
    description: 'Guidance and insights on developing a meaningful prayer life and communicating with God.',
    featuredImageUrl: 'https://fcuiwgbwavqwunqerchc.supabase.co/storage/v1/object/public/assets/blog/categories/prayer.jpg',
    order: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'bible-study',
    name: 'Bible Study',
    slug: 'bible-study',
    description: 'Deep dives into Scripture, exploring its meaning, context, and application to modern life.',
    featuredImageUrl: 'https://fcuiwgbwavqwunqerchc.supabase.co/storage/v1/object/public/assets/blog/categories/bible-study.jpg',
    order: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'daily-devotional',
    name: 'Daily Devotional',
    slug: 'daily-devotional',
    description: 'Short, daily reflections to inspire your faith journey and provide spiritual nourishment.',
    featuredImageUrl: 'https://fcuiwgbwavqwunqerchc.supabase.co/storage/v1/object/public/assets/blog/categories/daily-devotional.jpg',
    order: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'testimonies',
    name: 'Testimonies',
    slug: 'testimonies',
    description: 'Stories of God\'s faithfulness, healing, and transformation in people\'s lives.',
    featuredImageUrl: 'https://fcuiwgbwavqwunqerchc.supabase.co/storage/v1/object/public/assets/blog/categories/testimonies.jpg',
    order: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

// Sample blog posts for initial setup
const sampleBlogPosts = [
  {
    id: 'sample-blog-post-1',
    title: 'Finding Peace in Troubled Times',
    slug: 'finding-peace-in-troubled-times',
    content: `
      <h2>Introduction</h2>
      <p>In today's fast-paced and often chaotic world, finding inner peace can seem like an impossible task. Yet, the Bible offers us timeless wisdom on how to maintain tranquility even in the midst of life's storms.</p>
      
      [verse]"Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid." - John 14:27[/verse]
      
      <h2>Understanding Biblical Peace</h2>
      <p>The peace that Jesus offers is not merely the absence of conflict but a profound sense of wholeness and well-being that transcends our circumstances. This peace, or "shalom" in Hebrew, encompasses harmony, completeness, and prosperity in every dimension of life.</p>
      
      <h2>Practical Steps to Cultivate Peace</h2>
      <p>Here are some practical ways to cultivate this divine peace in your daily life:</p>
      
      <h3>1. Practice Mindful Prayer</h3>
      <p>Regular, intentional prayer helps center our thoughts on God's promises rather than our problems.</p>
      
      [verse]"Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus." - Philippians 4:6-7[/verse]
      
      <h3>2. Immerse Yourself in Scripture</h3>
      <p>The Word of God serves as an anchor for our souls during turbulent times.</p>
      
      <h3>3. Cultivate Gratitude</h3>
      <p>Focusing on our blessings rather than our burdens shifts our perspective and invites peace into our hearts.</p>
      
      [quote]Gratitude turns what we have into enough, and more. It turns denial into acceptance, chaos into order, confusion into clarity... it makes sense of our past, brings peace for today, and creates a vision for tomorrow.[/quote]
      
      <h2>Conclusion</h2>
      <p>True peace is not found in perfect circumstances but in a perfect Savior. By anchoring ourselves in Christ's promises and practicing these spiritual disciplines, we can experience the supernatural peace that surpasses all understanding, regardless of what storms may rage around us.</p>
    `,
    excerpt: 'Discover biblical wisdom for finding and maintaining inner peace even during life\'s most challenging seasons.',
    authorId: 'admin',
    authorName: 'Divine Comfort Team',
    featuredImageUrl: 'https://fcuiwgbwavqwunqerchc.supabase.co/storage/v1/object/public/assets/blog/peace-in-troubled-times.jpg',
    categoryId: 'spiritual-growth',
    categoryName: 'Spiritual Growth',
    tags: ['peace', 'anxiety', 'prayer', 'scripture', 'gratitude'],
    status: 'published',
    publishedAt: new Date().toISOString(),
    metaDescription: 'Learn biblical strategies for finding peace in troubled times through prayer, scripture, and gratitude.',
    metaKeywords: ['inner peace', 'Christian peace', 'biblical peace', 'anxiety relief', 'spiritual growth'],
    views: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sample-blog-post-2',
    title: 'The Power of Daily Prayer',
    slug: 'the-power-of-daily-prayer',
    content: `
      <h2>Introduction</h2>
      <p>Prayer is the heartbeat of our relationship with God. It's through consistent, daily communication with our Creator that we grow spiritually and experience His transformative power in our lives.</p>
      
      [verse]"Rejoice always, pray continually, give thanks in all circumstances; for this is God's will for you in Christ Jesus." - 1 Thessalonians 5:16-18[/verse]
      
      <h2>Why Daily Prayer Matters</h2>
      <p>Just as we need daily physical nourishment, our spirits require regular communion with God. Daily prayer isn't about religious obligation but about cultivating an intimate relationship with our Heavenly Father.</p>
      
      <h2>Elements of Effective Prayer</h2>
      
      <h3>1. Adoration</h3>
      <p>Begin by focusing on who God is—His character, His attributes, His majesty. This shifts our perspective from our problems to His power.</p>
      
      <h3>2. Confession</h3>
      <p>Honest acknowledgment of our shortcomings creates space for God's grace and forgiveness to flow into our lives.</p>
      
      [verse]"If we confess our sins, he is faithful and just and will forgive us our sins and purify us from all unrighteousness." - 1 John 1:9[/verse]
      
      <h3>3. Thanksgiving</h3>
      <p>Expressing gratitude for God's blessings—both seen and unseen—cultivates a heart of joy and contentment.</p>
      
      <h3>4. Supplication</h3>
      <p>Bringing our requests to God demonstrates our dependence on Him and invites His intervention in our circumstances.</p>
      
      [quote]Prayer is not asking. It is a longing of the soul. It is daily admission of one's weakness. It is better in prayer to have a heart without words than words without a heart.[/quote]
      
      <h2>Establishing a Daily Prayer Routine</h2>
      <p>Consider these practical tips for developing a consistent prayer life:</p>
      <ul>
        <li>Set aside a specific time each day dedicated solely to prayer</li>
        <li>Create a prayer journal to record requests and answered prayers</li>
        <li>Use Scripture to guide your prayers</li>
        <li>Find a quiet space free from distractions</li>
      </ul>
      
      <h2>Conclusion</h2>
      <p>The power of daily prayer lies not in the words we say but in the God who hears them. As we commit to regular communion with Him, we'll discover a deeper relationship with our Creator and experience His peace, guidance, and transformation in every area of our lives.</p>
    `,
    excerpt: 'Explore the transformative impact of consistent prayer and discover practical ways to deepen your daily communion with God.',
    authorId: 'admin',
    authorName: 'Divine Comfort Team',
    featuredImageUrl: 'https://fcuiwgbwavqwunqerchc.supabase.co/storage/v1/object/public/assets/blog/daily-prayer.jpg',
    categoryId: 'prayer',
    categoryName: 'Prayer',
    tags: ['prayer', 'spiritual disciplines', 'devotional', 'relationship with God'],
    status: 'published',
    publishedAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    metaDescription: 'Discover the transformative power of daily prayer and learn practical strategies for developing a consistent prayer life.',
    metaKeywords: ['daily prayer', 'prayer life', 'Christian prayer', 'prayer routine', 'spiritual growth'],
    views: 0,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  }
];

// Function to set up blog collections
async function setupBlogCollections() {
  try {
    console.log('Setting up blog collections...');
    
    // Create a batch write
    const batch = db.batch();
    
    // Add blog categories
    console.log('Adding blog categories...');
    for (const category of blogCategories) {
      const docRef = db.collection('blogCategories').doc(category.id);
      batch.set(docRef, category);
    }
    
    // Add sample blog posts
    console.log('Adding sample blog posts...');
    for (const post of sampleBlogPosts) {
      const docRef = db.collection('blogPosts').doc(post.id);
      batch.set(docRef, post);
    }
    
    // Commit the batch
    await batch.commit();
    
    console.log('Blog collections set up successfully!');
    console.log(`Created ${blogCategories.length} blog categories.`);
    console.log(`Created ${sampleBlogPosts.length} sample blog posts.`);
    
  } catch (error) {
    console.error('Error setting up blog collections:', error);
  } finally {
    // Exit the process
    process.exit(0);
  }
}

// Run the setup function
setupBlogCollections(); 