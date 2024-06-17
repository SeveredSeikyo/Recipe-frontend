const { MongoClient }=require('mongodb');
require('dotenv').config();
const uri= "mongodb+srv://thanmaysadguru:JliusNz8vTmUfIev@recipe.mongocluster.cosmos.azure.com/?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000";
const client = new MongoClient(uri,{useNewUrlParser:true,useUnifiedTopology:true});