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

