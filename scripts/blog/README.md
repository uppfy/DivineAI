# Blog Setup Scripts

This directory contains scripts to set up the necessary Firestore collections for the blog feature of the Divine Comfort application.

## Collections Created

The scripts in this directory create the following Firestore collections:

1. **blogPosts** - Contains blog post documents with rich content, metadata, and references to categories, tags, and authors.
2. **blogCategories** - Contains categories used to organize blog posts.
3. **blogTags** - Contains tags used for content discovery and filtering.
4. **blogAuthors** - Contains information about blog post authors.

## Script Files

- `setup-all.js` - Main script that runs all setup scripts in sequence.
- `setup-blog-collections.js` - Sets up the blogPosts and blogCategories collections with sample data.
- `setup-blog-tags.js` - Sets up the blogTags collection with sample tags.
- `setup-blog-authors.js` - Sets up the blogAuthors collection with sample authors.
- `verify-blog-collections.js` - Verifies that all collections were created successfully.

## Running the Scripts

To run these scripts, you need to have the Firebase Admin SDK installed and properly configured with service account credentials in your `.env.local` file.

1. Make sure you have the required dependencies installed:
   ```
   npm install
   ```

2. Run all setup scripts at once:
   ```
   npm run setup
   ```

3. Or run individual scripts:
   ```
   npm run setup:collections
   npm run setup:tags
   npm run setup:authors
   npm run verify
   ```

4. Alternatively, you can run the scripts directly:
   ```
   node setup-all.js
   node setup-blog-collections.js
   node setup-blog-tags.js
   node setup-blog-authors.js
   node verify-blog-collections.js
   ```

## Data Structure

### Blog Post
```javascript
{
  id: string,
  title: string,
  slug: string,
  content: string, // HTML content with custom tags for verses and quotes
  excerpt: string,
  authorId: string,
  authorName: string,
  featuredImageUrl: string,
  categoryId: string,
  categoryName: string,
  tags: string[],
  status: 'draft' | 'published',
  publishedAt: string, // ISO date string
  metaDescription: string,
  metaKeywords: string[],
  views: number,
  createdAt: string, // ISO date string
  updatedAt: string // ISO date string
}
```

### Blog Category
```javascript
{
  id: string,
  name: string,
  slug: string,
  description: string,
  featuredImageUrl: string,
  order: number,
  createdAt: string, // ISO date string
  updatedAt: string // ISO date string
}
```

### Blog Tag
```javascript
{
  id: string,
  name: string,
  slug: string,
  description: string,
  count: number, // Number of posts with this tag
  createdAt: string, // ISO date string
  updatedAt: string // ISO date string
}
```

### Blog Author
```javascript
{
  id: string,
  name: string,
  email: string,
  bio: string,
  avatarUrl: string,
  role: 'admin' | 'author',
  socialLinks: {
    facebook?: string,
    twitter?: string,
    instagram?: string,
    linkedin?: string
  },
  postCount: number,
  createdAt: string, // ISO date string
  updatedAt: string // ISO date string
}
```

## Custom Content Tags

The blog content supports custom tags for verses and quotes:

### Verse
```
[verse]"For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life." - John 3:16[/verse]
```

### Quote
```
[quote]Prayer is not asking. It is a longing of the soul.[/quote]
```

These tags can be parsed and styled appropriately in the frontend. 