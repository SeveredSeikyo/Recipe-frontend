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

const userPostSchema=new mongoose.Schema({
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

});

// Use the existing collection name 'recipe_users'
const loginCredentials = mongoose.model("recipe_users", Loginschema, "recipe_users");
const userPosts = mongoose.model("recipe_userPosts", userPostSchema,"recipe_userPosts");
const tables={loginCredentials,userPosts};

module.exports = tables;