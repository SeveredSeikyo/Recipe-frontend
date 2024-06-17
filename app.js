const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5500;

// Middleware to parse incoming request bodies
app.use(bodyParser.json());

// MongoDB connection URI
const uri = process.env.MONGODB_URI;

// MongoDB Client instance
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
    if (err) {
        console.error('Error connecting to MongoDB:', err);
        return;
    }
    console.log('Connected to MongoDB');

    // Database and collection
    const db = client.db('your_database_name');
    const usersCollection = db.collection('users');

    // Serve static files
    app.use(express.static('public'));

    // Handle signup form submission
    app.post('/signup', async (req, res) => {
        const { username,email, password } = req.body;

        try {
            const result = await usersCollection.insertOne({ username:username,email:email, password:password });
            console.log('Inserted new user:', result.ops[0]);
            res.status(201).send('Successfully signed up');
        } catch (error) {
            console.error('Error inserting data:', error);
            res.status(500).send('Error inserting data');
        }
    });

    // Handle signin form submission
    app.post('/signin', async (req, res) => {
        const { username, password } = req.body;

        try {
            const user = await usersCollection.findOne({ username:username, password:password });
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