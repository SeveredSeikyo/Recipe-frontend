const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse incoming request bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// MongoDB Atlas connection URI (replace with your own credentials)
const uri = 'mongodb+srv://thanmaysadguru:JliusNz8vTmUfIev@recipe.mongocluster.cosmos.azure.com/?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000';

// MongoDB Client instance
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Connect to MongoDB
client.connect(err => {
    if (err) {
        console.error('Error connecting to MongoDB:', err);
        return;
    }
    console.log('Connected to MongoDB');

    // Database and collection
    const db = client.db('recipedb');
    const usersCollection = db.collection('recipe_users');

    // Serve static files (not needed for this example)
    // app.use(express.static('public'));

    // Serve the homepage
    app.get('/', (req, res) => {
        res.sendFile(__dirname + '/index.html');
    });

    // Serve the signup/signin page (not static here, but could be rendered with a template engine)
    app.get('/signup', (req, res) => {
        res.sendFile(__dirname + '/signup.html');
    });

    // Handle signup form submission
    app.post('/signup', async (req, res) => {
        const { username, password } = req.body;

        // Insert into database
        try {
            const result = await usersCollection.insertOne({ username, password });
            console.log('Inserted new user:', result.ops[0]);
            res.status(201).send('Successfully signed up');
        } catch (error) {
            console.error('Error inserting data:', error);
            res.status(500).send('Error inserting data');
        }
    });

    // Handle signin form submission
    app.post('/signin', async (req, res) => {
        const { 'signin-username': username, 'signin-password': password } = req.body;

        // Query database for user credentials
        try {
            const user = await usersCollection.findOne({ username, password });
            if (user) {
                res.status(200).send('Successfully signed in');
            } else {
                res.status(401).send('Invalid username or password');
            }
        } catch (error) {
            console.error('Error querying data:', error);
            res.status(500).send('Error querying data');
        }
    });

    // Start server
    app.listen(port, () => {
        console.log("Server is running on http://localhost:${port}");
    });
});