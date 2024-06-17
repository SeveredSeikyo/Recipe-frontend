import http from 'http';
import { BlobServiceClient } from '@azure/storage-blob';
import { MongoClient } from 'mongodb';
import 'dotenv/config';
// Load in environment variables
const mongodbUri = process.env.MONGODB_URI;
const accountName = process.env.ACCOUNT_NAME;
const sasToken = process.env.SAS_TOKEN;
const containerName = process.env.CONTAINER_NAME;

// Establishes a connection with Azure Blob Storage
const blobServiceClient = new BlobServiceClient(`https://${accountName}.blob.core.windows.net/?${sasToken}`);
const containerClient = blobServiceClient.getContainerClient(containerName);

// Connect to MongoDB
const client = new MongoClient(mongodbUri);
client.connect();
const server = http.createServer(handleImageUpload);
const port = 3000;
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
async function handleImageUpload(req, res) {
    res.setHeader('Content-Type', 'application/json');
    if (req.url === '/api/upload' && req.method === 'POST') {
        try {
        // Extract metadata from headers
        const {fileName, caption, fileType } = await extractMetadata(req.headers);

        // Upload the image as a to Azure Storage Blob as a stream
        const imageUrl = await uploadImageStreamed(fileName, req);

        // Store the metadata in MongoDB
        await storeMetadata(fileName, caption, fileType, imageUrl);

        res.writeHead(201);
        res.end(JSON.stringify({ message: 'Image uploaded and metadata stored successfully', imageUrl }));
        } catch (error) {
        console.error('Error:', error);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Internal Server Error' }));
        }
    } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Not Found' }));
    }
}
async function extractMetadata(headers) {
    const contentType = headers['content-type'];
    const fileType = contentType.split('/')[1];
    const contentDisposition = headers['content-disposition'] || '';
    const caption = headers['x-image-caption'] || 'No caption provided';
    const matches = /filename="([^"]+)"/i.exec(contentDisposition);
    const fileName = matches?.[1] || `image-${Date.now()}.${fileType}`;
    return { fileName, caption, fileType };
}
async function uploadImageStreamed(blobName, dataStream) {
    const blobClient = containerClient.getBlockBlobClient(blobName);
    await blobClient.uploadStream(dataStream);
    return blobClient.url;
}
async function storeMetadata(name, caption, fileType, imageUrl) {
    const collection = client.db("tutorial").collection('metadata');
    await collection.insertOne({ name, caption, fileType, imageUrl });
}