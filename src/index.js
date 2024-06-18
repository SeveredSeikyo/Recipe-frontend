const express = require("express");
const path = require("path");
const {MongoClient} = require('mongodb');
const {recipeUsersCollection,recipeCollection} = require("./config");
const bcrypt = require('bcrypt');

const app = express();
// convert data into json format
app.use(express.json());
// Serve static files from 'public' and 'assets' directories
app.use(express.static("public"));
app.use('/assets', express.static('assets'));
app.use('/js', express.static('js'));


app.use(express.urlencoded({ extended: false }));
//use EJS as the view engine
app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/explore", (req, res) => {
    res.render("explore");
});

app.get("/home", (req, res) => {
    res.render("home");
});

app.get("/profile", (req,res) => {
    res.render("profile");
});

app.get("/search", (req,res) => {
    res.render("search");
});

app.get("/signup", (req, res) => {
    res.render("signup", { req: req });
});

// Register User
app.post("/signup", async (req, res) => {
    try {
        const data = {
            name: req.body.username,
            email: req.body.email,
            password: req.body.password
        }

        // Check if the username already exists in the database
        const existingUser = await recipeUsersCollection.findOne({ name: data.name });

        if (existingUser) {
            res.redirect('/signup?error=userExists');
        } else {
            // Hash the password using bcrypt
            const saltRounds = 10; // Number of salt rounds for bcrypt
            const hashedPassword = await bcrypt.hash(data.password, saltRounds);

            data.password = hashedPassword; // Replace the original password with the hashed one

            // Insert the user data into the database
            await recipeUsersCollection.insertOne(data);

            res.redirect('/home');
        }
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).send("An error occurred while registering the user");
    }
});

// Login user 
app.post("/login", async (req, res) => {
    try {
        const username = req.body.username;
        const password = req.body.password;

        // Find the user by username
        const user = await recipeUsersCollection.findOne({ name: username });

        if (!user) {
            res.redirect("/signup?error=userNotExists");
            return;
        }

        // Compare the hashed password from the database with the plaintext password
        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            res.redirect("/signup?error=wrongPassword");
            return;
        }

        // Redirect to home page if login is successful
        res.redirect('/home');
    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).send("An error occurred while logging in");
    }
});

//retrieve search data
app.post('/api/search', async (req, res) => {
    try {
        // Extract the search query from the request body
        const searchOutput = req.body.query;

        // Create a MongoDB client
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

        // Connect to the MongoDB server
        await client.connect();

        // Access the 'recipe' collection
        const recipeCollection = client.db('recipedb').collection('recipe');

        // Execute the search query and limit the results to 20
        const searchResults = await recipeCollection.find({ title: searchOutput }).limit(20).toArray();

        // Log the search query and results
        console.log('Search query received:', searchOutput);
        console.log('Search results:', searchResults);

        // Close the MongoDB client connection
        await client.close();

        // Send the search results as a response
        res.json({ message: 'Search query received', results: searchResults });
    } catch (error) {
        // Handle any errors that occur during the search operation
        console.error('Error processing search query:', error);
        res.status(500).json({ error: 'An internal server error occurred' });
    }
});


// Define Port for Application
const port = 5000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
});