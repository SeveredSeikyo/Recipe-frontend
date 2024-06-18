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
import MongoDBStore from 'connect-mongodb-session';

// Environment Variables
const mongodbUri = process.env.MONGODB_URI;
const accountName = process.env.ACCOUNT_NAME;
const sasToken = process.env.SAS_TOKEN;
const containerName = process.env.CONTAINER_NAME;
const secretKey=process.env.SECRET_KEY;

// Azure Blob Storage setup
const blobServiceClient = new BlobServiceClient(`https://${accountName}.blob.core.windows.net/?${sasToken}`);
const containerClient = blobServiceClient.getContainerClient(containerName);

// MongoDB setup
const client = new MongoClient(mongodbUri);
await client.connect();
const db = client.db("recipedb");
const loginCredentials = db.collection('recipe_users');
const userPosts = db.collection('recipe_userPosts');
const userDetails=db.collection('recipe_userDetails');

const store = new MongoDBStore({
    uri: mongodbUri,
    collection: 'sessions'
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

app.get("/post", (req,res) => {
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
        }
        else{
            req.session.user = username;
            res.redirect('/home');
        }
        
    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).send("An error occurred while logging in");
    }
});

//logout User
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

        // Query the database for posts associated with the current user's username
        const posts = await userPosts.find({ name: username }).toArray();
        console.log(posts);
        // Send the fetched posts as a JSON response
        res.json(posts);
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Handle image upload and store metadata
app.post('/api/post', upload.single('image'), async (req, res) => {
    try {
        const { title, description } = req.body;
        const { originalname, mimetype, buffer } = req.file;

        const fileType = mimetype.split('/')[1];
        const fileName = originalname || `image-${Date.now()}.${fileType}`;
        const caption = 'No caption provided'; // Modify this if you need to extract the caption from the request
        const username = req.session.user;
        // Get the current date
        const currentDate = new Date();

        // Extract day, month, and year components
        const day = currentDate.getDate().toString().padStart(2, '0'); // Ensure 2-digit format
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-indexed, so add 1
        const year = currentDate.getFullYear();

        // Format the date as DD/MM/YYYY
        const formattedDate = `${day}/${month}/${year}`;

        const imageUrl = await uploadImageStreamed(fileName, buffer);
        await storeMetadata(username,title, description, fileName, caption, fileType, imageUrl,formattedDate);
        const postData={
            title,
            description,
            imageUrl,
            formattedDate
        }
        res.status(201).send({ message: 'Post created successfully', postData });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

// Extract metadata
function extractMetadata(file) {
    const fileType = file.mimetype.split('/')[1];
    const fileName = file.originalname || `image-${Date.now()}.${fileType}`;
    const caption = 'No caption provided';
    return { fileName, caption, fileType };
}

// Upload image to Azure Blob Storage
async function uploadImageStreamed(blobName, buffer) {
    const blobClient = containerClient.getBlockBlobClient(blobName);
    const stream = Readable.from(buffer);
    await blobClient.uploadStream(stream);
    return blobClient.url;
}

// Store metadata in MongoDB
async function storeMetadata(username,title, description, name, caption, fileType, imageUrl,formattedDate) {
    await userPosts.insertOne({ username,title, description, name, caption, fileType, imageUrl,formattedDate });
}

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
