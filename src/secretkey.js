const crypto = require('crypto');

const generateRandomString = (length) => {
    return crypto.randomBytes(Math.ceil(length / 2))
        .toString('hex') // Convert to hexadecimal format
        .slice(0, length); // Trim to desired length
};

const secretKey = generateRandomString(32); // Generate a 32-character random string
console.log(secretKey); // Print the generated secret key
