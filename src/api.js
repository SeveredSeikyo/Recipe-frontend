const axios = require('axios');
const {MongoClient} = require('mongodb');

// Connect to MongoDB
const client = new MongoClient('mongodb+srv://thanmaysadguru:JliusNz8vTmUfIev@recipe.mongocluster.cosmos.azure.com/?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000');
const db = client.db("recipedb");
const coll=db.collection("recipe");
console.log(db.collection.find({title:"Chicken"}));