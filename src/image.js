const { MongoClient } = require('mongodb');
const { google } = require('googleapis');

// Replace with your actual MongoDB connection string and database/collection names
const mongoUri = process.env.MONGODB_URI;
const dbName = 'recipedb';
const collectionName = 'recipe';

// Replace with your Google Cloud project credentials (obtain from Google Cloud Console)
const googleCloudProjectId = 'your-google-cloud-project-id';

async function main() {
  // Connect to MongoDB
  const client = await MongoClient.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
  const db = client.db(dbName);
  const collection = db.collection(collectionName);

  // Authenticate with Google Cloud using service account credentials (recommended for production)
  const credentials = require('./path/to/your/credentials.json'); // Replace with actual path
  const scopes = ['https://www.googleapis.com/auth/cloud-platform'];
  const jwt = new google.auth.JWTCredentials(credentials, scopes);

  // Create Google Custom Search Engine ID (https://cse.google.com/cse/create/new)
  const customSearchEngineId = 'your-custom-search-engine-id';

  // Function to search for image URLs using Google Custom Search API
  async function searchForImageUrls(title) {
    const customsearch = google.customsearch({ version: 'v1', auth: jwt });
    const res = await customsearch.cse.list({
      cx: customSearchEngineId,
      q: title,
      // Customize search parameters (e.g., num: 1 for first result only)
      num: 1, // Limit to 1 result to avoid overwhelming results
    });
    return res.data.items ? res.data.items.map(item => item.link) : [];
  }

  // Function to update item with found image URL
  async function updateItemWithImageUrl(itemId, imageUrl) {
    const updateResult = await collection.updateOne({ _id: itemId }, { $set: { imageUrl } });
    if (updateResult.matchedCount > 0) {
      console.log(`Updated item ${itemId} with image URL: ${imageUrl}`);
    } else {
      console.log(`Item ${itemId} not found.`);
    }
  }

  // Process each item in the collection
  const cursor = collection.find({});
  for await (const item of cursor) {
    const title = item.title; // Replace with actual field containing the title
    const imageUrls = await searchForImageUrls(title);
    if (imageUrls.length > 0) {
      const imageUrl = imageUrls[0]; // Use the first image URL
      await updateItemWithImageUrl(item._id, imageUrl);
    } else {
      console.log(`No image found for item "${title}" (ID: ${item._id})`);
    }
  }

  // Close MongoDB connection
  await client.close();
}

main().catch(console.error);
