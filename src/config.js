const mongoose = require('mongoose');

// Connect to the existing database 'recipedb'
const connect = mongoose.connect("mongodb+srv://thanmaysadguru:JliusNz8vTmUfIev@recipe.mongocluster.cosmos.azure.com/recipedb?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Check if the database is connected
connect.then(() => {
    console.log("Database Connected Successfully");
}).catch((error) => {
    console.error("Database connection failed:", error);
});

// Define the schema
const Loginschema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String
    },
    password: {
        type: String,
        required: true
    }
});

const LoginPostSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    image:{
        type:String,
    },
    postDate:{
        type:Date,
        default:Date.now
    }

})

// Use the existing collection name 'recipe_users'
const collection = mongoose.model("recipe_users", Loginschema, "recipe_users");
const Recipe = mongoose.model('Recipe', { title: String });
const tables={collection,Recipe};

module.exports = tables;
/*const { MongoClient } = require('mongodb');

// Connection URI
const uri = "mongodb+srv://thanmaysadguru:JliusNz8vTmUfIev@recipe.mongocluster.cosmos.azure.com/recipedb?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000";

// Create a new MongoClient
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Connect to the MongoDB server
client.connect()
    .then(() => {
        console.log("Connected to MongoDB database");

        // Access the database
        const db = client.db('recipedb');
        console.log(db.listCollections());
        // Access the collections
        const recipeUsersCollection = db.collection('recipe_users');
        const recipeCollection = db.collection('recipe');

        // Export the collections
        module.exports = { recipeUsersCollection, recipeCollection };
    })
    .catch(err => {
        console.error("Error connecting to MongoDB:", err);
    });
*/
