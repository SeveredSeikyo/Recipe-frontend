import express from 'express';
import path from 'path';
import { MongoClient } from 'mongodb';
import { BlobServiceClient } from '@azure/storage-blob';
import bcrypt from 'bcrypt';
import 'dotenv/config';
import multer from 'multer';
import { Readable } from 'stream';
import session from 'express-session';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';
import MongoDBStoreFactory from 'connect-mongodb-session';
const MongoDBStore = MongoDBStoreFactory(session);

// Environment Variables
const mongodbUri = process.env.MONGODB_URI;
const accountName = process.env.ACCOUNT_NAME;
const sasToken = process.env.SAS_TOKEN;
const containerName = process.env.CONTAINER_NAME;
const secretKey = process.env.SECRET_KEY;
const sessionCollection = 'sessions';
const databaseName = process.env.MONGODB_DATABASE;
const dbName = 'recipedb';
const collectionName = 'recipes';

// Log MongoDB URI to verify
console.log('MONGODB_URI:', process.env.MONGODB_URI);

// Azure Blob Storage setup
const blobServiceClient = new BlobServiceClient(`https://${accountName}.blob.core.windows.net/?${sasToken}`);
const containerClient = blobServiceClient.getContainerClient(containerName);

// MongoDB setup
const client = new MongoClient(mongodbUri);
await client.connect();
const db = client.db(dbName);
const loginCredentials = db.collection('recipe_users');
const userPosts = db.collection('recipe_userPosts');
const userDetails = db.collection('recipe_userDetails');

const store = new MongoDBStore({
    uri: mongodbUri,
    databaseName: databaseName, 
    collection: sessionCollection
});

// Express setup
const app = express();
const port = 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use('/assets', express.static('assets'));
app.use('/js', express.static('js'));
app.set("view engine", "ejs");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    secret: uuidv4(),
    resave: false,
    saveUninitialized: false,
    store: store
}));

function isLoggedIn(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/');
    }
}

// Routes
app.get("/", (req, res) => {
    res.render("index");
});

app.get("/explore", (req, res) => {
    res.render("explore");
});

app.get("/home", (req, res) => {
    res.render("home");
});

app.get("/profile", (req, res) => {
    res.render("profile");
});

app.get("/search", (req, res) => {
    res.render("search");
});

app.get("/signup", (req, res) => {
    res.render("signup", { req: req });
});

app.get("/post", (req, res) => {
    res.render("post");
});

// Register User
app.post("/signup", async (req, res) => {
    try {
        const data = {
            name: req.body.username,
            email: req.body.email,
            password: req.body.password
        }
        const existingUser = await loginCredentials.findOne({ name: data.name });

        if (existingUser) {
            res.redirect('/signup?error=userExists');
        } else {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(data.password, saltRounds);
            data.password = hashedPassword;
            req.session.user = data.name;
            await loginCredentials.insertOne(data);
            res.redirect('/home');
        }
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).send("An error occurred while registering the user");
    }
});

// Login User
app.post("/login", async (req, res) => {
    try {
        const username = req.body.username;
        const password = req.body.password;
        const user = await loginCredentials.findOne({ name: username });

        if (!user) {
            res.redirect("/signup?error=userNotExists");
            return;
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            res.redirect("/signup?error=wrongPassword");
            return;
        } else {
            req.session.user = username;
            res.redirect('/home');
        }

    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).send("An error occurred while logging in");
    }
});

// Logout User
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error logging out:', err);
            res.status(500).send('Error logging out');
        } else {
            res.redirect('/');
        }
    });
});

// Define API endpoint to fetch user-specific posts
app.get("/api/posts", async (req, res) => {
    try {
        console.log("we r in");
        // Retrieve username from session or request (depends on your authentication setup)
        const username = req.session.user;
        console.log(username);
        // Query the database for posts associated with the current user's username
        const posts = await userPosts.find({ username: username }).toArray();
        console.log(posts);
        // Send the fetched posts as a JSON response
        res.json(posts);
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Random Picks
async function fetchRandomRecipes(numRecipes) {
    try {
        // Connect to MongoDB
        const client = new MongoClient(mongodbUri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        console.log('Connected to MongoDB');

        // Access the recipes collection
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // Fetch random recipes
        const randomRecipes = await collection.aggregate([{ $sample: { size: numRecipes } }]).toArray();

        console.log(`Fetched ${randomRecipes.length} random recipes:`);
        console.log(randomRecipes);

        // Close the MongoDB connection
        await client.close();

        return randomRecipes;
    } catch (error) {
        console.error('Error fetching random recipes:', error.message);
        return null;
    }
}

// Example usage
app.post("/api/random", async (req, res) => {
    try {
        const numRecipes = req.body.numRecipes;
        console.log(`Number of recipes requested: ${numRecipes}`);
        const randomRecipes = await fetchRandomRecipes(numRecipes);
        res.json({ randomRecipes });
    } catch (err) {
        console.error('Error in /api/random route:', err);
        res.status(500).send(err);
    }
});

// User Posts Retrieval
app.post('/api/userposts', async (req, res) => {
    try {
        const numPosts = req.body.numPosts;
        const userPosts = await userPosts.aggregate([{$sample: { size: numPosts }}]).toArray();
        res.json({ userPosts });
    } catch (err) {
        console.error('Error in /api/userposts route:', err);
        res.status(500).send(err);
    }
});

// Handle image upload and store metadata
app.post('/api/post', upload.single('image'), async (req, res) => {
    try {
        const { title, ingredients, description } = req.body;
        const { originalname, mimetype, buffer } = req.file;

        const fileType = mimetype.split('/')[1];
        const uniqueFileName = `image-${uuidv4()}.${fileType}`;
        const fileName = originalname || `image-${Date.now()}.${fileType}`;
        const caption = 'No caption provided'; // Modify this if you need to extract the caption from the request
        const username = req.session.user;
        // Get the current date
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so we add 1
        const day = String(currentDate.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;

        // Upload the image to Azure Blob Storage
        const blockBlobClient = containerClient.getBlockBlobClient(fileName);
        const stream = Readable.from(buffer);
        await blockBlobClient.uploadStream(stream);
        const imageUrl=blockBlobClient.url;
        console.log('Image uploaded to Azure Blob Storage:', fileName);

        // Store the metadata in MongoDB
        const imageMetadata = {
            title,
            ingredients,
            description,
            caption,
            filename: uniqueFileName,
            username: username,
            date: dateString,
            imageUrl:imageUrl
        };

        await userPosts.insertOne(imageMetadata);
        console.log('Metadata stored in MongoDB:', imageMetadata);

        res.status(200).json({ message: 'Post uploaded successfully' });
    } catch (error) {
        console.error('Error uploading post:', error);
        res.status(500).json({ message: 'Error uploading post' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});